package com.consulting.dto.service;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PackageResponse {
    private Long id;
    private Long serviceId;
    private String serviceName;
    private String name;
    private String description;
    private Integer sessions;
    private BigDecimal price;
    private Integer validityDays;
    private Boolean isActive;
}
