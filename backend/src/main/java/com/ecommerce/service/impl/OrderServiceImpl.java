package com.ecommerce.service.impl;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.dto.OrderItemDTO;
import com.ecommerce.entity.*;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.*;
import com.ecommerce.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    @Transactional
    public OrderDTO checkout(Long userId, String shippingAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cannot checkout an empty shopping cart");
        }

        // 驗證庫存並構建訂單明細列表
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(shippingAddress);
        order.setStatus(OrderStatus.PENDING);

        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            // 重新以寫入鎖載入商品，確保「檢查庫存 → 扣庫存」是不可切割的動作，避免併發超賣
            Long productId = cartItem.getProduct().getId();
            Product product = productRepository.findByIdForUpdate(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("商品 " + product.getName() + " 庫存不足");
            }

            // 扣減資料庫中的庫存
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(product.getPrice()); // 紀錄購買當下的商品單價（快照）

            order.getItems().add(orderItem);

            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        order.setTotalAmount(total);
        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cartItemRepository.deleteByUserId(userId);

        return convertToDTO(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId, Long requesterId, boolean isAdmin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        // 只有下單本人或管理員能讀取訂單明細，否則改網址上的 id 就能看到別人的訂單與收件地址
        if (!isAdmin && !order.getUser().getId().equals(requesterId)) {
            throw new AccessDeniedException("無權存取此訂單");
        }
        return convertToDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid Order Status: " + status);
        }

        // 庫存必須跟著「已取消」這個狀態雙向調整，只做單邊會讓庫存憑空增減：
        //   未取消 → 已取消：把當初扣掉的庫存還回去，否則庫存永久蒸發。
        //   已取消 → 未取消：重新扣回來，否則來回切換狀態就能無限灌大庫存。
        boolean wasCancelled = order.getStatus() == OrderStatus.CANCELLED;
        boolean willBeCancelled = newStatus == OrderStatus.CANCELLED;

        if (willBeCancelled && !wasCancelled) {
            for (OrderItem item : order.getItems()) {
                Product product = lockProduct(item);
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        } else if (!willBeCancelled && wasCancelled) {
            for (OrderItem item : order.getItems()) {
                Product product = lockProduct(item);
                if (product.getStock() < item.getQuantity()) {
                    throw new BadRequestException(
                            "商品「" + product.getName() + "」庫存不足，無法復原這張已取消的訂單");
                }
                product.setStock(product.getStock() - item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        return convertToDTO(updatedOrder);
    }

    /** 以寫入鎖載入訂單明細對應的商品，確保庫存增減不會與其他交易互相覆蓋 */
    private Product lockProduct(OrderItem item) {
        Long productId = item.getProduct().getId();
        return productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setStatus(order.getStatus());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setCreatedAt(order.getCreatedAt());

        List<OrderItemDTO> itemsList = order.getItems().stream().map(item -> {
            OrderItemDTO itemDto = new OrderItemDTO();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductName(item.getProduct().getName());
            itemDto.setProductImageUrl(item.getProduct().getImageUrl());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setPrice(item.getPrice());
            return itemDto;
        }).collect(Collectors.toList());

        dto.setItems(itemsList);
        return dto;
    }
}
