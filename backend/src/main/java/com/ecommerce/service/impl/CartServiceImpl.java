package com.ecommerce.service.impl;

import com.ecommerce.dto.CartDTO;
import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public CartDTO getUserCart(Long userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        
        List<CartItemDTO> itemDTOs = cartItems.stream().map(item -> {
            CartItemDTO dto = new CartItemDTO();
            dto.setId(item.getId());
            dto.setProductId(item.getProduct().getId());
            dto.setProductName(item.getProduct().getName());
            dto.setProductPrice(item.getProduct().getPrice());
            dto.setProductImageUrl(item.getProduct().getImageUrl());
            dto.setQuantity(item.getQuantity());
            return dto;
        }).collect(Collectors.toList());

        BigDecimal total = itemDTOs.stream()
                .map(item -> item.getProductPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartDTO cartDTO = new CartDTO();
        cartDTO.setItems(itemDTOs);
        cartDTO.setTotalAmount(total);

        return cartDTO;
    }

    @Override
    @Transactional
    public void addItemToCart(Long userId, Long productId, int quantity) {
        if (quantity <= 0) {
            throw new BadRequestException("Quantity must be greater than zero");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (product.getStock() < quantity) {
            throw new BadRequestException("Insufficient product stock available");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(userId, productId);
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQty = item.getQuantity() + quantity;
            if (product.getStock() < newQty) {
                throw new BadRequestException("Insufficient product stock available for total quantity");
            }
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setUser(user);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cartItemRepository.save(newItem);
        }
    }

    @Override
    @Transactional
    public void updateItemQuantity(Long userId, Long productId, int quantity) {
        if (quantity <= 0) {
            removeItemFromCart(userId, productId);
            return;
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (product.getStock() < quantity) {
            throw new BadRequestException("Insufficient product stock available");
        }

        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "productId", productId));

        item.setQuantity(quantity);
        cartItemRepository.save(item);
    }

    @Override
    @Transactional
    public void removeItemFromCart(Long userId, Long productId) {
        CartItem item = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "productId", productId));
        cartItemRepository.delete(item);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}
