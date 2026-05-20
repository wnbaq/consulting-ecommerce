package com.consulting.controller;

import com.consulting.dto.ai.AiChatRequest;
import com.consulting.dto.ai.AiChatResponse;
import com.consulting.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        String reply = aiService.chat(request.getMessage());
        return ResponseEntity.ok(new AiChatResponse(reply));
    }
}
