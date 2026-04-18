package com.retail.ordering.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponRequest {

    private double cartTotal;

    private String couponCode;
}
