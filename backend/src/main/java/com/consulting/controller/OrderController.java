package com.consulting.controller;

import com.consulting.dto.order.OrderResponse;
import com.consulting.entity.User;
import com.consulting.service.OrderService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Value("${app.stripe.webhook-secret}")
    private String webhookSecret;

    // Ödeme başlat
    @PostMapping("/payments/create-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.createPaymentIntent(user));
    }

    // Ödeme onaylandı → sipariş oluştur
    @PostMapping("/orders")
    public ResponseEntity<OrderResponse> createOrder(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.createOrder(user, body.get("paymentIntentId")));
    }

    // Stripe Webhook
    @PostMapping("/payments/webhook")
    public ResponseEntity<String> stripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            if ("payment_intent.succeeded".equals(event.getType())) {
                PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (paymentIntent != null) {
                    orderService.handlePaymentSucceeded(paymentIntent.getId());
                }
            }

            return ResponseEntity.ok("OK");
        } catch (SignatureVerificationException e) {
            return ResponseEntity.badRequest().body("Geçersiz imza");
        }
    }

    @GetMapping("/orders/my")
    public ResponseEntity<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getMyOrders(user));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponse> getById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getById(id, user));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}
