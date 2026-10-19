package com.example.auth.service;

import com.example.auth.dto.PaymentRequest;
import com.example.auth.entity.Booking;
import com.example.auth.entity.Payment;
import com.example.auth.entity.User;
import com.example.auth.repository.BookingRepository;
import com.example.auth.repository.PaymentRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Payment> getMyPayments(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        if (user.getRoles().contains("ADMIN")) {
            return paymentRepository.findAll();
        }
        return paymentRepository.findByPayerOrderByCreatedAtDesc(user);
    }

    public Payment getPaymentForBooking(Long bookingId, String username) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        boolean isPayer = booking.getUser().getId().equals(user.getId());
        boolean isOwner = booking.getListing().getOwner() != null && booking.getListing().getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().contains("ADMIN");

        if (!isPayer && !isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to view this payment.");
        }

        return paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new RuntimeException("No payment found for booking: " + bookingId));
    }

    @Transactional
    public Payment processPayment(PaymentRequest req, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found: " + req.getBookingId()));

        if (!booking.getUser().getId().equals(user.getId()) && !user.getRoles().contains("ADMIN")) {
            throw new AccessDeniedException("You can only submit payment for your own booking.");
        }

        Payment payment = paymentRepository.findByBooking(booking).orElse(new Payment());
        payment.setBooking(booking);
        payment.setPayer(user);
        payment.setAmount(req.getAmount() != null ? req.getAmount() : booking.getTotalPrice());
        payment.setCurrency(req.getCurrency() != null ? req.getCurrency() : "USD");
        payment.setPaymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "STRIPE_DEMO");
        payment.setPaymentStatus("SUCCESSFUL");
        payment.setTransactionId("txn_demo_" + UUID.randomUUID().toString().substring(0, 12));
        payment.setReceiptNumber("RCP-" + System.currentTimeMillis() % 1000000);
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        // Transition booking to CONFIRMED on payment
        booking.setBookingStatus("CONFIRMED");
        bookingRepository.save(booking);

        return savedPayment;
    }
}
