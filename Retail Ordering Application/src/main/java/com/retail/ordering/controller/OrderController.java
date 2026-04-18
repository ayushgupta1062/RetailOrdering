package com.retail.ordering.controller;

import com.retail.ordering.dto.ApiResponse;
import com.retail.ordering.dto.OrderRequest;
import com.retail.ordering.model.Order;
import com.retail.ordering.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public ResponseEntity<ApiResponse> placeOrder(@RequestBody(required = false) OrderRequest request,
            Authentication authentication) {
        String email = authentication.getName();

        if (request == null) {
            request = new OrderRequest();
        }

        Order order = orderService.placeOrder(email, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.builder()
                        .success(true)
                        .message("Order placed successfully! 10 loyalty points added.")
                        .data(order)
                        .build());
    }

    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse> getMyOrders(Authentication authentication) {
        String email = authentication.getName();
        List<Order> orders = orderService.getMyOrders(email);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Order history fetched successfully")
                .data(orders)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getOrderById(@PathVariable Long id) {
        Map<String, Object> orderDetails = orderService.getOrderDetails(id);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Order details fetched successfully")
                .data(orderDetails)
                .build());
    }
}
