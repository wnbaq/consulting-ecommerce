package com.consulting.repository;

import com.consulting.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByServiceIdAndIsApprovedTrueOrderByCreatedAtDesc(Long serviceId);
    boolean existsByUserIdAndServiceId(Long userId, Long serviceId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.service.id = :serviceId AND r.isApproved = true")
    Double findAverageRatingByServiceId(@Param("serviceId") Long serviceId);
}
