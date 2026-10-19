package com.example.auth.service;

import com.example.auth.dto.BookingRequest;
import com.example.auth.entity.Booking;
import com.example.auth.entity.Listing;
import com.example.auth.entity.User;
import com.example.auth.repository.BookingRepository;
import com.example.auth.repository.ListingRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Booking> getMyBookings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return bookingRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<Booking> getOwnerBookings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        if (user.getRoles().contains("ADMIN")) {
            return bookingRepository.findAll();
        }
        return bookingRepository.findByListingOwnerOrderByCreatedAtDesc(user);
    }

    public Booking getBookingById(Long id, String username) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        boolean isTenant = booking.getUser().getId().equals(user.getId());
        boolean isOwner = booking.getListing().getOwner() != null && booking.getListing().getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().contains("ADMIN");

        if (!isTenant && !isOwner && !isAdmin) {
            throw new AccessDeniedException("You are not authorized to view this booking.");
        }

        return booking;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Booking createBooking(BookingRequest req, String username) {
        User tenant = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Listing listing = listingRepository.findById(req.getListingId())
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + req.getListingId()));

        if (req.getStartDate().isAfter(req.getEndDate()) || req.getStartDate().isEqual(req.getEndDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date.");
        }

        // Check for conflicting bookings
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                listing.getListingId(),
                req.getStartDate(),
                req.getEndDate()
        );

        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("The selected dates are unavailable. A reservation already exists for this timeframe.");
        }

        // Calculate total price
        long days = ChronoUnit.DAYS.between(req.getStartDate(), req.getEndDate());
        BigDecimal totalPrice;
        if ("PER_MONTH".equalsIgnoreCase(listing.getPriceUnit())) {
            // Approx prorated calculation: (price / 30) * days
            totalPrice = listing.getPrice().divide(BigDecimal.valueOf(30), 2, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(Math.max(1, days)));
        } else {
            totalPrice = listing.getPrice().multiply(BigDecimal.valueOf(Math.max(1, days)));
        }

        Booking booking = new Booking();
        booking.setUser(tenant);
        booking.setListing(listing);
        booking.setStartDate(req.getStartDate());
        booking.setEndDate(req.getEndDate());
        booking.setGuestsCount(req.getGuestsCount() != null ? req.getGuestsCount() : 1);
        booking.setSpecialRequests(req.getSpecialRequests());
        booking.setTotalPrice(totalPrice);
        booking.setBookingStatus("PENDING");

        return bookingRepository.save(booking);
    }

    @Transactional
    public Booking updateBookingStatus(Long bookingId, String newStatus, String reason, String username) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        boolean isTenant = booking.getUser().getId().equals(user.getId());
        boolean isOwner = booking.getListing().getOwner() != null && booking.getListing().getOwner().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().contains("ADMIN");

        String statusUpper = newStatus.toUpperCase();

        if ("CANCELLED".equals(statusUpper)) {
            // Either tenant or owner can cancel
            if (!isTenant && !isOwner && !isAdmin) {
                throw new AccessDeniedException("You are not authorized to cancel this booking.");
            }
        } else if ("CONFIRMED".equals(statusUpper) || "REJECTED".equals(statusUpper)) {
            // Only owner or admin can confirm/reject
            if (!isOwner && !isAdmin) {
                throw new AccessDeniedException("Only the property owner or administrator can confirm or reject a booking.");
            }
        }

        booking.setBookingStatus(statusUpper);
        if (reason != null && !reason.isBlank()) {
            booking.setRejectionReason(reason);
        }

        return bookingRepository.save(booking);
    }
}
