package com.retail.ordering.service;

import com.retail.ordering.dto.CartItemRequest;
import com.retail.ordering.exception.ResourceNotFoundException;
import com.retail.ordering.model.Product;
import com.retail.ordering.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CartService {

    @Autowired
    private ProductRepository productRepository;


    private final Map<String, Map<Long, Integer>> cartStore = new ConcurrentHashMap<>();


    public Map<Long, Integer> getCart(String email) {
        return cartStore.getOrDefault(email, new HashMap<>());
    }


    public Map<Long, Integer> addToCart(String email, CartItemRequest request) {

        productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + request.getProductId()));


        cartStore.putIfAbsent(email, new HashMap<>());
        Map<Long, Integer> cart = cartStore.get(email);


        cart.merge(request.getProductId(), request.getQuantity(), Integer::sum);

        return cart;
    }


    public Map<Long, Integer> updateCart(String email, CartItemRequest request) {
        Map<Long, Integer> cart = cartStore.getOrDefault(email, new HashMap<>());


        if (request.getQuantity() <= 0) {
            cart.remove(request.getProductId());
        } else {
            cart.put(request.getProductId(), request.getQuantity());
        }

        cartStore.put(email, cart);
        return cart;
    }


    public Map<Long, Integer> removeFromCart(String email, Long productId) {
        Map<Long, Integer> cart = cartStore.getOrDefault(email, new HashMap<>());
        cart.remove(productId);
        cartStore.put(email, cart);
        return cart;
    }


    public void clearCart(String email) {
        cartStore.remove(email);
    }
}
