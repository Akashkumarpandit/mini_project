package com.example.auth.controller;

import com.example.auth.dto.BookingRequest;
import com.example.auth.entity.Booking;
import com.example.auth.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<Booking>> getMyBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getMyBookings(authentication.getName()));
    }

    @GetMapping("/owner")
    public ResponseEntity<List<Booking>> getOwnerBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getOwnerBookings(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(bookingService.getBookingById(id, authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookingService.createBooking(request, authentication.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String status = body.get("status");
        String reason = body.get("reason");
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, reason, authentication.getName()));
    }
}
