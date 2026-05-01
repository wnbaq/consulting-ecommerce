package com.consulting.dto.cart;

import com.consulting.entity.CartItem;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemRequest {
    private Long serviceId;
    private Long packageId;

    @NotNull(message = "Kalem tipi zorunludur")
    private CartItem.ItemType itemType;

    private Integer quantity = 1;
}
