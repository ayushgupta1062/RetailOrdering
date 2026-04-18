package com.retail.ordering.controller;

import com.retail.ordering.dto.ApiResponse;
import com.retail.ordering.model.Brand;
import com.retail.ordering.repository.BrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private BrandRepository brandRepository;

    @GetMapping
    public ResponseEntity<ApiResponse> getAllBrands() {
        List<Brand> brands = brandRepository.findAll();
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Brands fetched successfully")
                .data(brands)
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse> addBrand(@RequestBody Brand brand) {
        Brand saved = brandRepository.save(brand);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.builder()
                        .success(true)
                        .message("Brand added successfully")
                        .data(saved)
                        .build());
    }
}
