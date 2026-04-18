package com.retail.ordering.controller;

import com.retail.ordering.dto.ApiResponse;
import com.retail.ordering.dto.CouponRequest;
import com.retail.ordering.model.Coupon;
import com.retail.ordering.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse> applyCoupon(@RequestBody CouponRequest request) {
        Map<String, Object> result = couponService.applyCoupon(request);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Coupon applied successfully")
                .data(result)
                .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createCoupon(@RequestBody Coupon coupon) {
        Coupon saved = couponService.saveCoupon(coupon);
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Coupon created successfully")
                .data(saved)
                .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Coupons fetched successfully")
                .data(couponService.getAllCoupons())
                .build());
    }
}
