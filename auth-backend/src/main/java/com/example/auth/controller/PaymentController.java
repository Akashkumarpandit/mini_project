package com.example.auth.controller;

import com.example.auth.dto.PaymentRequest;
import com.example.auth.entity.Payment;
import com.example.auth.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> getMyPayments(Authentication authentication) {
        return ResponseEntity.ok(paymentService.getMyPayments(authentication.getName()));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<Payment> getPaymentForBooking(@PathVariable Long bookingId, Authentication authentication) {
        return ResponseEntity.ok(paymentService.getPaymentForBooking(bookingId, authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Payment> processPayment(
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(paymentService.processPayment(request, authentication.getName()));
    }
}
