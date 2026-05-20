package com.consulting.service;

import com.consulting.dto.review.ReviewRequest;
import com.consulting.dto.review.ReviewResponse;
import com.consulting.entity.ConsultingService;
import com.consulting.entity.Review;
import com.consulting.entity.User;
import com.consulting.exception.BusinessException;
import com.consulting.exception.ResourceNotFoundException;
import com.consulting.repository.ConsultingServiceRepository;
import com.consulting.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ConsultingServiceRepository serviceRepository;

    public List<ReviewResponse> getByService(Long serviceId) {
        return reviewRepository.findByServiceIdAndIsApprovedTrueOrderByCreatedAtDesc(serviceId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public ReviewResponse create(ReviewRequest request, User user) {
        if (reviewRepository.existsByUserIdAndServiceId(user.getId(), request.getServiceId())) {
            throw new BusinessException("You have already reviewed this service");
        }

        ConsultingService service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        Review review = Review.builder()
                .user(user)
                .service(service)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void delete(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        reviewRepository.delete(review);
    }

    public List<ReviewResponse> getAll() {
        return reviewRepository.findAll().stream().map(this::toResponse).toList();
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getName())
                .serviceId(r.getService().getId())
                .rating(r.getRating())
                .comment(r.getComment())
                .isApproved(r.getIsApproved())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
