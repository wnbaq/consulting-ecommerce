package com.consulting.dto.cart;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class CartResponse {
    private Long id;
    private List<CartItemResponse> items;
    private BigDecimal total;

    @Data
    @Builder
    public static class CartItemResponse {
        private Long id;
        private String name;
        private String itemType;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private Long serviceId;
        private Long packageId;
    }
}
