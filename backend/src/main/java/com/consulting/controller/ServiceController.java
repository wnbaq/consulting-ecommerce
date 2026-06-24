package com.consulting.controller;

import com.consulting.dto.service.PackageRequest;
import com.consulting.dto.service.PackageResponse;
import com.consulting.dto.service.ServiceRequest;
import com.consulting.dto.service.ServiceResponse;
import com.consulting.service.ConsultingServiceService;
import com.consulting.service.FileUploadService;
import com.consulting.service.ImageGenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ServiceController {

    private final ConsultingServiceService serviceService;
    private final FileUploadService fileUploadService;
    private final ImageGenerationService imageGenerationService;

    @GetMapping("/services")
    public ResponseEntity<Page<ServiceResponse>> getAll(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(serviceService.getAll(categoryId, search, page, size));
    }

    @GetMapping("/services/featured")
    public ResponseEntity<List<ServiceResponse>> getFeatured() {
        return ResponseEntity.ok(serviceService.getFeatured());
    }

    @GetMapping("/services/{id}")
    public ResponseEntity<ServiceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(serviceService.getById(id));
    }

    @PostMapping("/services")
    public ResponseEntity<ServiceResponse> create(@Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceService.create(request));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ServiceResponse> update(@PathVariable Long id, @Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(serviceService.update(id, request));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        serviceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Paket endpoint'leri
    @GetMapping("/services/{id}/packages")
    public ResponseEntity<List<PackageResponse>> getPackages(@PathVariable Long id) {
        return ResponseEntity.ok(serviceService.getPackages(id));
    }

    @PostMapping("/packages")
    public ResponseEntity<PackageResponse> createPackage(@Valid @RequestBody PackageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceService.createPackage(request));
    }

    @PutMapping("/packages/{id}")
    public ResponseEntity<PackageResponse> updatePackage(@PathVariable Long id, @Valid @RequestBody PackageRequest request) {
        return ResponseEntity.ok(serviceService.updatePackage(id, request));
    }

    @PostMapping("/services/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileUploadService.uploadImage(file, "services");
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "File upload failed: " + e.getMessage()));
        }
    }

    @PostMapping("/services/generate-image")
    public ResponseEntity<Map<String, String>> generateImage(@RequestBody Map<String, String> body) {
        try {
            String url = imageGenerationService.generateAndSave(body.get("prompt"));
            return ResponseEntity.ok(Map.of("url", url));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Image generation failed: " + e.getMessage()));
        }
    }
}
