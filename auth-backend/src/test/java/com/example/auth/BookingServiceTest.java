package com.example.auth;

import com.example.auth.dto.BookingRequest;
import com.example.auth.entity.Booking;
import com.example.auth.entity.Listing;
import com.example.auth.repository.ListingRepository;
import com.example.auth.service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class BookingServiceTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private ListingRepository listingRepository;

    @Test
    public void testBookingCreationAndConflictPrevention() {
        List<Listing> listings = listingRepository.findAll();
        assertFalse(listings.isEmpty(), "Listings should be seeded by DataInitializer");
        Listing listing = listings.get(0);

        LocalDate start = LocalDate.now().plusDays(60);
        LocalDate end = LocalDate.now().plusDays(65);

        BookingRequest req1 = new BookingRequest();
        req1.setListingId(listing.getListingId());
        req1.setStartDate(start);
        req1.setEndDate(end);
        req1.setGuestsCount(2);

        Booking booking1 = bookingService.createBooking(req1, "alex_tenant");
        assertNotNull(booking1);
        assertEquals("PENDING", booking1.getBookingStatus());
        assertTrue(booking1.getTotalPrice().doubleValue() > 0);

        // Attempting overlapping reservation on the exact same dates should throw IllegalStateException
        BookingRequest req2 = new BookingRequest();
        req2.setListingId(listing.getListingId());
        req2.setStartDate(start.plusDays(1));
        req2.setEndDate(end.plusDays(2));
        req2.setGuestsCount(1);

        assertThrows(IllegalStateException.class, () -> {
            bookingService.createBooking(req2, "alex_tenant");
        }, "Expected overlapping booking to be rejected by conflict detection");
    }

    @Test
    public void testInvalidDatesRejection() {
        List<Listing> listings = listingRepository.findAll();
        Listing listing = listings.get(0);

        BookingRequest req = new BookingRequest();
        req.setListingId(listing.getListingId());
        req.setStartDate(LocalDate.now().plusDays(5));
        req.setEndDate(LocalDate.now().plusDays(2)); // End before start!

        assertThrows(IllegalArgumentException.class, () -> {
            bookingService.createBooking(req, "alex_tenant");
        });
    }
}
