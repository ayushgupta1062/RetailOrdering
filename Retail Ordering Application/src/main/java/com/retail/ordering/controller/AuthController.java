package com.retail.ordering.controller;

import com.retail.ordering.dto.ApiResponse;
import com.retail.ordering.dto.LoginRequest;
import com.retail.ordering.dto.RegisterRequest;
import com.retail.ordering.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest request) {
        var user = authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.builder()
                        .success(true)
                        .message("User registered successfully")
                        .data(user)
                        .build());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest request) {
        var result = authService.login(request);

        return ResponseEntity.ok(ApiResponse.builder()
                .success(true)
                .message("Login successful")
                .data(result)
                .build());
    }
}
