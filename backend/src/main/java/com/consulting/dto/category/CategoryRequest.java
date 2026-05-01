package com.consulting.dto.category;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "Kategori adı zorunludur")
    private String name;
    private String description;
    private String icon;
}
