package com.consulting.repository;

import com.consulting.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Appointment> findAllByOrderByCreatedAtDesc();
    long countByStatus(Appointment.Status status);
}
