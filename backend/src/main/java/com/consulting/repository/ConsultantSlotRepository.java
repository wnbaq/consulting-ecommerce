package com.consulting.repository;

import com.consulting.entity.ConsultantSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ConsultantSlotRepository extends JpaRepository<ConsultantSlot, Long> {
    List<ConsultantSlot> findByServiceIdAndDateAndIsBookedFalse(Long serviceId, LocalDate date);
    List<ConsultantSlot> findByServiceIdAndDateBetweenAndIsBookedFalse(Long serviceId, LocalDate start, LocalDate end);
    List<ConsultantSlot> findByDateBetweenAndIsBookedFalse(LocalDate start, LocalDate end);
}
