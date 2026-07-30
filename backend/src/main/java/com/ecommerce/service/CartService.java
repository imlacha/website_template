package com.ecommerce.service;

import com.ecommerce.dto.CartDTO;

public interface CartService {
    CartDTO getUserCart(Long userId);
    void addItemToCart(Long userId, Long productId, int quantity);
    void updateItemQuantity(Long userId, Long productId, int quantity);
    void removeItemFromCart(Long userId, Long productId);
    void clearCart(Long userId);
}
