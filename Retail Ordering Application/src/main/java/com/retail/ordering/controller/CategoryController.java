package com.retail.ordering.controller;

import com.retail.ordering.dto.ApiResponse;
import com.retail.ordering.model.Category;
import com.retail.ordering.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Categories fetched successfully")
                .data(categories)
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse> addCategory(@RequestBody Category category) {
        Category saved = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.builder()
                        .success(true)
                        .message("Category added successfully")
                        .data(saved)
                        .build());
    }
}
