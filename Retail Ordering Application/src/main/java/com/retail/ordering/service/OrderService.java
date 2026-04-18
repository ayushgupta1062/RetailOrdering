package com.retail.ordering.service;

import com.retail.ordering.dto.OrderRequest;
import com.retail.ordering.exception.ResourceNotFoundException;
import com.retail.ordering.model.*;
import com.retail.ordering.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// OrderService - handles placing orders, fetching order history, and updating order status
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private CartService cartService;

    // Place an order - converts cart to order in database
    // @Transactional ensures all DB operations succeed or all roll back together
    @Transactional
    public Order placeOrder(String email, OrderRequest request) {
        // Find the user placing the order
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        // Get user's current cart
        Map<Long, Integer> cart = cartService.getCart(email);

        // Cart must not be empty
        if (cart.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty. Add products before placing order.");
        }

        // Calculate total amount and validate stock availability
        double totalAmount = 0.0;
        for (Map.Entry<Long, Integer> entry : cart.entrySet()) {
            Long productId = entry.getKey();
            int quantity = entry.getValue();

            // Fetch product from database
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

            // Check stock availability - throw error if not enough stock
            if (product.getStockQuantity() < quantity) {
                throw new IllegalArgumentException(
                        "Product '" + product.getName() + "' is out of stock. Available: " + product.getStockQuantity()
                );
            }

            totalAmount += product.getPrice() * quantity;
        }

        // Apply coupon discount if coupon code is provided
        double discountAmount = 0.0;
        String couponCode = request.getCouponCode();

        if (couponCode != null && !couponCode.isBlank()) {
            Coupon coupon = couponRepository.findByCode(couponCode).orElse(null);
            if (coupon != null && coupon.isActive() && !coupon.getValidUntil().isBefore(LocalDate.now())) {
                discountAmount = (coupon.getDiscountPercent() / 100.0) * totalAmount;
            }
        }

        double finalAmount = totalAmount - discountAmount;

        // Create and save the Order to database
        Order order = Order.builder()
                .user(user)
                .status("PLACED")
                .totalAmount(finalAmount)
                .couponCode(couponCode)
                .discountAmount(discountAmount)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Save each cart item as an OrderItem and reduce stock in database
        for (Map.Entry<Long, Integer> entry : cart.entrySet()) {
            Long productId = entry.getKey();
            int quantity = entry.getValue();

            Product product = productRepository.findById(productId).get();

            // Save order item to order_items table
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .build();
            orderItemRepository.save(orderItem);

            // Reduce stock_quantity in products table immediately
            product.setStockQuantity(product.getStockQuantity() - quantity);
            productRepository.save(product);
        }

        // Add 10 loyalty points to user in database for placing order
        user.setLoyaltyPoints(user.getLoyaltyPoints() + 10);
        userRepository.save(user);

        // Clear the cart after successful order placement
        cartService.clearCart(email);

        return savedOrder;
    }

    // Get order history of a specific user from database
    public List<Order> getMyOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return orderRepository.findByUserId(user.getId());
    }

    // Get details of a specific order along with its items
    public Map<String, Object> getOrderDetails(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        return Map.of(
                "order", order,
                "items", items
        );
    }

    // Get all orders (Admin use)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Update the status of an order (Admin only)
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        // Set new status and save immediately to database
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
