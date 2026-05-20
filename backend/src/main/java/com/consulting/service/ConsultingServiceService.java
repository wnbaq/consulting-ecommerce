package com.consulting.service;

import com.consulting.dto.category.CategoryResponse;
import com.consulting.dto.service.PackageRequest;
import com.consulting.dto.service.PackageResponse;
import com.consulting.dto.service.ServiceRequest;
import com.consulting.dto.service.ServiceResponse;
import com.consulting.entity.ConsultingService;
import com.consulting.entity.ServiceCategory;
import com.consulting.entity.ServicePackage;
import com.consulting.exception.ResourceNotFoundException;
import com.consulting.repository.ConsultingServiceRepository;
import com.consulting.repository.ReviewRepository;
import com.consulting.repository.ServiceCategoryRepository;
import com.consulting.repository.ServicePackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultingServiceService {

    private final ConsultingServiceRepository serviceRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final ServicePackageRepository packageRepository;
    private final ReviewRepository reviewRepository;

    public Page<ServiceResponse> getAll(Long categoryId, String search, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return serviceRepository.findAllFiltered(categoryId, search, pageable)
                .map(this::toResponse);
    }

    public List<ServiceResponse> getFeatured() {
        return serviceRepository.findTop6ByIsActiveTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    public ServiceResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ServiceResponse create(ServiceRequest request) {
        ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        ConsultingService service = ConsultingService.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .shortDescription(request.getShortDescription())
                .price(request.getPrice())
                .durationMinutes(request.getDurationMinutes())
                .imageUrl(request.getImageUrl())
                .category(category)
                .isActive(request.getIsActive())
                .build();

        return toResponse(serviceRepository.save(service));
    }

    @Transactional
    public ServiceResponse update(Long id, ServiceRequest request) {
        ConsultingService service = findById(id);
        ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        service.setTitle(request.getTitle());
        service.setDescription(request.getDescription());
        service.setShortDescription(request.getShortDescription());
        service.setPrice(request.getPrice());
        service.setDurationMinutes(request.getDurationMinutes());
        service.setImageUrl(request.getImageUrl());
        service.setCategory(category);
        service.setIsActive(request.getIsActive());

        return toResponse(serviceRepository.save(service));
    }

    @Transactional
    public void delete(Long id) {
        serviceRepository.delete(findById(id));
    }

    // --- Paket işlemleri ---

    public List<PackageResponse> getPackages(Long serviceId) {
        return packageRepository.findByServiceIdAndIsActiveTrue(serviceId)
                .stream().map(this::toPackageResponse).toList();
    }

    @Transactional
    public PackageResponse createPackage(PackageRequest request) {
        ConsultingService service = findById(request.getServiceId());
        ServicePackage pkg = ServicePackage.builder()
                .service(service)
                .name(request.getName())
                .description(request.getDescription())
                .sessions(request.getSessions())
                .price(request.getPrice())
                .validityDays(request.getValidityDays())
                .isActive(request.getIsActive())
                .build();
        return toPackageResponse(packageRepository.save(pkg));
    }

    @Transactional
    public PackageResponse updatePackage(Long id, PackageRequest request) {
        ServicePackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));
        pkg.setName(request.getName());
        pkg.setDescription(request.getDescription());
        pkg.setSessions(request.getSessions());
        pkg.setPrice(request.getPrice());
        pkg.setValidityDays(request.getValidityDays());
        pkg.setIsActive(request.getIsActive());
        return toPackageResponse(packageRepository.save(pkg));
    }

    public ConsultingService findById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
    }

    private ServiceResponse toResponse(ConsultingService s) {
        Double avg = reviewRepository.findAverageRatingByServiceId(s.getId());
        int count = s.getReviews() != null ? s.getReviews().size() : 0;

        return ServiceResponse.builder()
                .id(s.getId())
                .title(s.getTitle())
                .description(s.getDescription())
                .shortDescription(s.getShortDescription())
                .price(s.getPrice())
                .durationMinutes(s.getDurationMinutes())
                .imageUrl(s.getImageUrl())
                .isActive(s.getIsActive())
                .category(CategoryResponse.builder()
                        .id(s.getCategory().getId())
                        .name(s.getCategory().getName())
                        .icon(s.getCategory().getIcon())
                        .slug(s.getCategory().getSlug())
                        .build())
                .averageRating(avg)
                .reviewCount(count)
                .createdAt(s.getCreatedAt())
                .build();
    }

    private PackageResponse toPackageResponse(ServicePackage p) {
        return PackageResponse.builder()
                .id(p.getId())
                .serviceId(p.getService().getId())
                .serviceName(p.getService().getTitle())
                .name(p.getName())
                .description(p.getDescription())
                .sessions(p.getSessions())
                .price(p.getPrice())
                .validityDays(p.getValidityDays())
                .isActive(p.getIsActive())
                .build();
    }
}
