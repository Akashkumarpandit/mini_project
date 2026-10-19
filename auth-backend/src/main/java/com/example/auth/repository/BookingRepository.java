package com.example.auth.repository;

import com.example.auth.entity.Booking;
import com.example.auth.entity.Listing;
import com.example.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserOrderByCreatedAtDesc(User user);
    List<Booking> findByListingOrderByCreatedAtDesc(Listing listing);
    List<Booking> findByListingOwnerOrderByCreatedAtDesc(User owner);
    List<Booking> findByBookingStatus(String status);
    long countByBookingStatus(String status);

    @Query("SELECT b FROM Booking b WHERE b.listing.listingId = :listingId " +
           "AND b.bookingStatus IN ('CONFIRMED', 'PENDING') " +
           "AND b.startDate < :endDate AND b.endDate > :startDate")
    List<Booking> findOverlappingBookings(
        @Param("listingId") Long listingId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
}
