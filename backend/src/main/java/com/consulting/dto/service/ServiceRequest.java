package com.consulting.dto.service;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceRequest {

    @NotBlank(message = "Başlık zorunludur")
    private String title;

    @NotBlank(message = "Açıklama zorunludur")
    private String description;

    private String shortDescription;

    @NotNull(message = "Fiyat zorunludur")
    @DecimalMin(value = "0.0", inclusive = false, message = "Fiyat sıfırdan büyük olmalıdır")
    private BigDecimal price;

    private Integer durationMinutes;
    private String imageUrl;

    @NotNull(message = "Kategori zorunludur")
    private Long categoryId;

    private Boolean isActive = true;
}
