package com.consulting.dto.service;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PackageRequest {

    @NotNull(message = "Hizmet zorunludur")
    private Long serviceId;

    @NotBlank(message = "Paket adı zorunludur")
    private String name;

    private String description;

    @NotNull(message = "Seans sayısı zorunludur")
    @Min(value = 1, message = "En az 1 seans olmalıdır")
    private Integer sessions;

    @NotNull(message = "Fiyat zorunludur")
    @DecimalMin(value = "0.0", inclusive = false, message = "Fiyat sıfırdan büyük olmalıdır")
    private BigDecimal price;

    private Integer validityDays;
    private Boolean isActive = true;
}
