package com.consulting.repository;

import com.consulting.entity.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicePackageRepository extends JpaRepository<ServicePackage, Long> {
    List<ServicePackage> findByServiceIdAndIsActiveTrue(Long serviceId);
}
