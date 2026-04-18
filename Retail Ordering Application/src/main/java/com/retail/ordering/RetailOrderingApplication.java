package com.retail.ordering;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// RetailOrderingApplication - Entry point of the Spring Boot application
// @SpringBootApplication enables auto-configuration, component scan, and configuration
@SpringBootApplication
public class RetailOrderingApplication {

    // Main method - starts the entire Spring Boot application
    public static void main(String[] args) {
        SpringApplication.run(RetailOrderingApplication.class, args);
        System.out.println("===========================================");
        System.out.println("  Retail Ordering API is running!");
        System.out.println("  Access at: http://localhost:8080");
        System.out.println("  HCL Tech Hackathon Project");
        System.out.println("===========================================");
    }
}
