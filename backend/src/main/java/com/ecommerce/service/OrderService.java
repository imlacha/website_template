package com.ecommerce.service;

import com.ecommerce.dto.OrderDTO;

import java.util.List;

public interface OrderService {
    OrderDTO checkout(Long userId, String shippingAddress);
    List<OrderDTO> getUserOrders(Long userId);
    List<OrderDTO> getAllOrders();
    OrderDTO getOrderById(Long orderId, Long requesterId, boolean isAdmin);
    OrderDTO updateOrderStatus(Long orderId, String status);
}
