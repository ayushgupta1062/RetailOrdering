package com.retail.ordering.controller;

import com.retail.ordering.dto.ApiResponse;
import com.retail.ordering.model.Product;
import com.retail.ordering.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllProducts() {
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Products fetched successfully")
                .data(products)
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Product fetched successfully")
                .data(product)
                .build());
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse> getProductsByCategory(@PathVariable Long categoryId) {
        List<Product> products = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Products fetched for category: " + categoryId)
                .data(products)
                .build());
    }

    @GetMapping("/brand/{brandId}")
    public ResponseEntity<ApiResponse> getProductsByBrand(@PathVariable Long brandId) {
        List<Product> products = productService.getProductsByBrand(brandId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Products fetched for brand: " + brandId)
                .data(products)
                .build());
    }

    @GetMapping("/category/{categoryId}/brand/{brandId}")
    public ResponseEntity<ApiResponse> getProductsByCategoryAndBrand(
            @PathVariable Long categoryId, @PathVariable Long brandId) {
        List<Product> products = productService.getProductsByCategoryAndBrand(categoryId, brandId);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Products fetched for category: " + categoryId + " and brand: " + brandId)
                .data(products)
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse> addProduct(@RequestBody Product product) {
        Product saved = productService.addProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.builder()
                        .success(true)
                        .message("Product added successfully")
                        .data(saved)
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        Product updated = productService.updateProduct(id, product);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Product updated successfully")
                .data(updated)
                .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Product deleted successfully")
                .data(null)
                .build());
    }
}
