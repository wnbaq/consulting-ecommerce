package com.consulting.dto.service;

import com.consulting.dto.category.CategoryResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ServiceResponse {
    private Long id;
    private String title;
    private String description;
    private String shortDescription;
    private BigDecimal price;
    private Integer durationMinutes;
    private String imageUrl;
    private Boolean isActive;
    private CategoryResponse category;
    private Double averageRating;
    private int reviewCount;
    private LocalDateTime createdAt;
}
