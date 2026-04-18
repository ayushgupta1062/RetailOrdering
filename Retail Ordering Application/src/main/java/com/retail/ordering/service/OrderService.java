package src.main.java.com.retail.ordering.service;

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

    @Transactional
    public Order placeOrder(String email, OrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        Map<Long, Integer> cart = cartService.getCart(email);

        if (cart.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty. Add products before placing order.");
        }

        double totalAmount = 0.0;
        for (Map.Entry<Long, Integer> entry : cart.entrySet()) {
            Long productId = entry.getKey();
            int quantity = entry.getValue();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

            if (product.getStockQuantity() < quantity) {
                throw new IllegalArgumentException(
                        "Product '" + product.getName() + "' is out of stock. Available: " + product.getStockQuantity()
                );
            }

            totalAmount += product.getPrice() * quantity;
        }

        double discountAmount = 0.0;
        String couponCode = request.getCouponCode();

        if (couponCode != null && !couponCode.isBlank()) {
            Coupon coupon = couponRepository.findByCode(couponCode).orElse(null);
            if (coupon != null && coupon.isActive() && !coupon.getValidUntil().isBefore(LocalDate.now())) {
                discountAmount = (coupon.getDiscountPercent() / 100.0) * totalAmount;
            }
        }

        double finalAmount = totalAmount - discountAmount;

        Order order = Order.builder()
                .user(user)
                .status("PLACED")
                .totalAmount(finalAmount)
                .couponCode(couponCode)
                .discountAmount(discountAmount)
                .build();

        Order savedOrder = orderRepository.save(order);

        for (Map.Entry<Long, Integer> entry : cart.entrySet()) {
            Long productId = entry.getKey();
            int quantity = entry.getValue();

            Product product = productRepository.findById(productId).get();

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(quantity)
                    .unitPrice(product.getPrice())
                    .build();
            orderItemRepository.save(orderItem);

            product.setStockQuantity(product.getStockQuantity() - quantity);
            productRepository.save(product);
        }

        user.setLoyaltyPoints(user.getLoyaltyPoints() + 10);
        userRepository.save(user);

        cartService.clearCart(email);

        return savedOrder;
    }

    public List<Order> getMyOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return orderRepository.findByUserId(user.getId());
    }

    public Map<String, Object> getOrderDetails(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        return Map.of(
                "order", order,
                "items", items
        );
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        order.setStatus(status);
        return orderRepository.save(order);
    }
}