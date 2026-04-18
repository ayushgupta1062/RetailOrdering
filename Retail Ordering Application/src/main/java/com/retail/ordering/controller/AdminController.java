package com.retail.ordering.controller;

import com.retail.ordering.dto.ApiResponse;
import com.retail.ordering.model.Order;
import com.retail.ordering.model.Product;
import com.retail.ordering.service.OrderService;
import com.retail.ordering.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("All orders fetched successfully")
                .data(orders)
                .build());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse> updateOrderStatus(@PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        Order updated = orderService.updateOrderStatus(id, status);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Order status updated to: " + status)
                .data(updated)
                .build());
    }

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse> getInventory() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Inventory fetched successfully")
                .data(products)
                .build());
    }
}
