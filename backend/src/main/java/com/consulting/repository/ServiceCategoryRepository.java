package com.consulting.repository;

import com.consulting.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, Long> {
    Optional<ServiceCategory> findBySlug(String slug);

    boolean existsByName(String name);

    @Query("SELECT s FROM ServiceCategory s " +
            "WHERE (:keyword IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(s.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<ServiceCategory> findByKeyword(@Param("keyword") String keyword);

    Optional<ServiceCategory> findById(Long id);
}
