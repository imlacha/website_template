package com.ecommerce.controller;

import com.ecommerce.dto.CartDTO;
import com.ecommerce.security.UserPrincipal;
import com.ecommerce.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart(@AuthenticationPrincipal UserPrincipal currentUser) {
        CartDTO cart = cartService.getUserCart(currentUser.getId());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/add")
    public ResponseEntity<Void> addToCart(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("productId") Long productId,
            @RequestParam(value = "quantity", defaultValue = "1") int quantity) {
        cartService.addItemToCart(currentUser.getId(), productId, quantity);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update")
    public ResponseEntity<Void> updateCartItem(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("productId") Long productId,
            @RequestParam("quantity") int quantity) {
        cartService.updateItemQuantity(currentUser.getId(), productId, quantity);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Void> removeFromCart(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("productId") Long productId) {
        cartService.removeItemFromCart(currentUser.getId(), productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserPrincipal currentUser) {
        cartService.clearCart(currentUser.getId());
        return ResponseEntity.ok().build();
    }
}
