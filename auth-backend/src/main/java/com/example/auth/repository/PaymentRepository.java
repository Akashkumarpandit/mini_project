package com.example.auth.repository;

import com.example.auth.entity.Booking;
import com.example.auth.entity.Payment;
import com.example.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByPayerOrderByCreatedAtDesc(User payer);
    Optional<Payment> findByBooking(Booking booking);
    List<Payment> findByPaymentStatus(String paymentStatus);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = 'SUCCESSFUL'")
    BigDecimal sumSuccessfulPayments();
}
