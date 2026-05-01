package com.consulting.service;

import com.consulting.dto.order.OrderResponse;
import com.consulting.entity.*;
import com.consulting.exception.BusinessException;
import com.consulting.exception.ResourceNotFoundException;
import com.consulting.repository.CartRepository;
import com.consulting.repository.OrderRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartService cartService;

    @Value("${app.stripe.publishable-key}")
    private String publishableKey;

    /**
     * Stripe PaymentIntent oluşturur ve client secret döner
     */
    @Transactional
    public Map<String, String> createPaymentIntent(User user) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Sepet bulunamadı"));

        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Sepetiniz boş");
        }

        BigDecimal total = cart.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(total.multiply(BigDecimal.valueOf(100)).longValue()) // kuruş cinsinden
                    .setCurrency("try")
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true).build()
                    )
                    .putMetadata("userId", String.valueOf(user.getId()))
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);

            Map<String, String> result = new HashMap<>();
            result.put("clientSecret", paymentIntent.getClientSecret());
            result.put("publishableKey", publishableKey);
            result.put("paymentIntentId", paymentIntent.getId());
            return result;

        } catch (StripeException e) {
            throw new BusinessException("Ödeme başlatılamadı: " + e.getMessage());
        }
    }

    /**
     * Ödeme onaylandıktan sonra sipariş oluştur
     */
    @Transactional
    public OrderResponse createOrder(User user, String paymentIntentId) {
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Sepet bulunamadı"));

        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Sepetiniz boş");
        }

        BigDecimal total = cart.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .user(user)
                .status(Order.Status.PAID)
                .totalAmount(total)
                .stripePaymentIntentId(paymentIntentId)
                .build();

        List<OrderItem> orderItems = cart.getItems().stream().map(cartItem -> {
            String description = cartItem.getItemType() == CartItem.ItemType.SERVICE
                    ? cartItem.getService().getTitle()
                    : cartItem.getServicePackage().getName();

            return OrderItem.builder()
                    .order(order)
                    .service(cartItem.getService())
                    .servicePackage(cartItem.getServicePackage())
                    .itemType(cartItem.getItemType())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .description(description)
                    .build();
        }).toList();

        order.setItems(orderItems);
        Order saved = orderRepository.save(order);

        // Sepeti temizle
        cartService.clearCart(user);

        return toResponse(saved);
    }

    public List<OrderResponse> getMyOrders(User user) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream().map(this::toResponse).toList();
    }

    public OrderResponse getById(Long id, User user) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sipariş bulunamadı"));
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BusinessException("Bu siparişe erişim yetkiniz yok");
        }
        return toResponse(order);
    }

    /**
     * Stripe Webhook: payment_intent.succeeded
     */
    @Transactional
    public void handlePaymentSucceeded(String paymentIntentId) {
        orderRepository.findByStripePaymentIntentId(paymentIntentId)
                .ifPresent(order -> {
                    order.setStatus(Order.Status.PAID);
                    orderRepository.save(order);
                });
    }

    private OrderResponse toResponse(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .status(o.getStatus().name())
                .totalAmount(o.getTotalAmount())
                .stripePaymentIntentId(o.getStripePaymentIntentId())
                .createdAt(o.getCreatedAt())
                .items(o.getItems().stream().map(item ->
                        OrderResponse.OrderItemResponse.builder()
                                .id(item.getId())
                                .itemType(item.getItemType().name())
                                .description(item.getDescription())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .build()
                ).toList())
                .build();
    }
}
