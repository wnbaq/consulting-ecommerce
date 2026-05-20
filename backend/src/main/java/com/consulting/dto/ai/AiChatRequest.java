package com.consulting.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AiChatRequest {
    @NotBlank
    private String message;
}
