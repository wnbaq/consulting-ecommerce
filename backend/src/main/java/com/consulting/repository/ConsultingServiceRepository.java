package com.consulting.repository;

import com.consulting.entity.ConsultingService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConsultingServiceRepository extends JpaRepository<ConsultingService, Long> {

    @Query("SELECT s FROM ConsultingService s WHERE s.isActive = true " +
           "AND (:categoryId IS NULL OR s.category.id = :categoryId) " +
           "AND (:search IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(s.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ConsultingService> findAllFiltered(
            @Param("categoryId") Long categoryId,
            @Param("search") String search,
            Pageable pageable);

    List<ConsultingService> findByCategoryIdAndIsActiveTrue(Long categoryId);

    List<ConsultingService> findTop6ByIsActiveTrueOrderByCreatedAtDesc();
}
