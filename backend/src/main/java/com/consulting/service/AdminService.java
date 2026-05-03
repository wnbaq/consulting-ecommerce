package com.consulting.service;

import com.consulting.entity.Appointment;
import com.consulting.entity.Order;
import com.consulting.entity.User;
import com.consulting.exception.ResourceNotFoundException;
import com.consulting.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ConsultingServiceRepository serviceRepository;
    private final OrderRepository orderRepository;
    private final AppointmentRepository appointmentRepository;
    private final ReviewRepository reviewRepository;

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalServices", serviceRepository.count());
        stats.put("totalOrders", orderRepository.count());
        stats.put("paidOrders", orderRepository.countByStatus(Order.Status.PAID));
        stats.put("pendingAppointments", appointmentRepository.countByStatus(Appointment.Status.PENDING));
        stats.put("confirmedAppointments", appointmentRepository.countByStatus(Appointment.Status.CONFIRMED));
        stats.put("totalReviews", reviewRepository.count());
        return stats;
    }

    public List<Map<String, Object>> getUsers() {
        return userRepository.findAll().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole().name());
            m.put("phone", u.getPhone());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).toList();
    }

    @Transactional
    public void updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        userRepository.save(user);
    }
    @Transactional
    public void updateUserName(Long userId, String name) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı"));
        user.setName(name);
        userRepository.save(user);
    }
}
