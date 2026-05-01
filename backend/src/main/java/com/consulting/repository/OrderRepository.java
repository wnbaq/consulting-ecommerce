package com.consulting.repository;

import com.consulting.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Order> findByStripePaymentIntentId(String paymentIntentId);
    long countByStatus(Order.Status status);
}
