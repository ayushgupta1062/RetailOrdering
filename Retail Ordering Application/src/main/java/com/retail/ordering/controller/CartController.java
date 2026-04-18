package com.retail.ordering.controller;

import com.retail.ordering.dto.ApiResponse;
import com.retail.ordering.dto.CartItemRequest;
import com.retail.ordering.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

        @Autowired
        private CartService cartService;

        @GetMapping
        public ResponseEntity<ApiResponse> getCart(Authentication authentication) {
                String email = authentication.getName();
                Map<Long, Integer> cart = cartService.getCart(email);

                return ResponseEntity.ok(ApiResponse.builder()
                                .success(true)
                                .message("Cart fetched successfully")
                                .data(cart)
                                .build());
        }

        @PostMapping("/add")
        public ResponseEntity<ApiResponse> addToCart(@RequestBody CartItemRequest request,
                        Authentication authentication) {
                String email = authentication.getName();
                Map<Long, Integer> cart = cartService.addToCart(email, request);

                return ResponseEntity.ok(ApiResponse.builder()
                                .success(true)
                                .message("Product added to cart")
                                .data(cart)
                                .build());
        }

        @PutMapping("/update")
        public ResponseEntity<ApiResponse> updateCart(@RequestBody CartItemRequest request,
                        Authentication authentication) {
                String email = authentication.getName();
                Map<Long, Integer> cart = cartService.updateCart(email, request);

                return ResponseEntity.ok(ApiResponse.builder()
                                .success(true)
                                .message("Cart updated successfully")
                                .data(cart)
                                .build());
        }

        @DeleteMapping("/remove/{productId}")
        public ResponseEntity<ApiResponse> removeFromCart(@PathVariable Long productId,
                        Authentication authentication) {
                String email = authentication.getName();
                Map<Long, Integer> cart = cartService.removeFromCart(email, productId);

                return ResponseEntity.ok(ApiResponse.builder()
                                .success(true)
                                .message("Product removed from cart")
                                .data(cart)
                                .build());
        }
}
