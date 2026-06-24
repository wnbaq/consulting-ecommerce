package com.consulting.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ImageGenerationService {

    private final FileUploadService fileUploadService;
    private final RestTemplate restTemplate;

    @Value("${spring.ai.openai.api-key}")
    private String openAiApiKey;

    public String generateAndSave(String prompt) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(openAiApiKey);

        Map<String, Object> body = Map.of(
                "model", "dall-e-2",
                "prompt", prompt,
                "n", 1,
                "size", "512x512"
        );

        ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.openai.com/v1/images/generations",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class
        );

        @SuppressWarnings("unchecked")
        List<Map<String, String>> data = (List<Map<String, String>>) response.getBody().get("data");
        String imageUrl = data.get(0).get("url");

        byte[] imageBytes = restTemplate.getForObject(imageUrl, byte[].class);
        return fileUploadService.saveFromBytes(imageBytes, "services", "png");
    }
}
