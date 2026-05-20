package com.consulting.dto.service;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PackageRequest {

    @NotNull(message = "Service is required")
    private Long serviceId;

    @NotBlank(message = "Package name is required")
    private String name;

    private String description;

    @NotNull(message = "Session count is required")
    @Min(value = 1, message = "Must have at least 1 session")
    private Integer sessions;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    private Integer validityDays;
    private Boolean isActive = true;
}
