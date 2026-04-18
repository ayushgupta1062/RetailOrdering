package com.retail.ordering.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemRequest {

    private Long productId;

    private int quantity;
}
