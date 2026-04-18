package src.main.java.com.retail.ordering.service;

import com.retail.ordering.dto.CouponRequest;
import com.retail.ordering.exception.ResourceNotFoundException;
import com.retail.ordering.model.Coupon;
import com.retail.ordering.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    public Map<String, Object> applyCoupon(CouponRequest request) {
        Coupon coupon = couponRepository.findByCode(request.getCouponCode())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid coupon code: " + request.getCouponCode()));

        if (!coupon.isActive()) {
            throw new IllegalArgumentException("Coupon is not active");
        }

        if (coupon.getValidUntil().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Coupon has expired");
        }

        double discountAmount = (coupon.getDiscountPercent() / 100.0) * request.getCartTotal();
        double finalAmount = request.getCartTotal() - discountAmount;

        Map<String, Object> result = new HashMap<>();
        result.put("couponCode", coupon.getCode());
        result.put("discountPercent", coupon.getDiscountPercent());
        result.put("cartTotal", request.getCartTotal());
        result.put("discountAmount", discountAmount);
        result.put("finalAmount", finalAmount);
        return result;
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon saveCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }
}