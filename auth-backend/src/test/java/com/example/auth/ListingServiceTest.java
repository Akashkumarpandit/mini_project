package com.example.auth;

import com.example.auth.dto.ListingRequest;
import com.example.auth.entity.Listing;
import com.example.auth.service.ListingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class ListingServiceTest {

    @Autowired
    private ListingService listingService;

    @Test
    public void testListingSearchAndFilters() {
        List<Listing> apartments = listingService.searchListings(
                "APARTMENT", null, null, null, null, null, null, null, "default"
        );
        assertNotNull(apartments);
        assertFalse(apartments.isEmpty());
        assertTrue(apartments.stream().allMatch(l -> "APARTMENT".equalsIgnoreCase(l.getType())));
    }

    @Test
    public void testListingCreationAndOwnershipIsolation() {
        ListingRequest req = new ListingRequest();
        req.setTitle("Owner Exclusive Penthouse");
        req.setDescription("Stunning luxury penthouse with high ceilings");
        req.setPrice(new BigDecimal("4200"));
        req.setPriceUnit("PER_MONTH");
        req.setType("APARTMENT");
        req.setLocation("Manhattan, NY");

        Listing created = listingService.createListing(req, "sarah_owner");
        assertNotNull(created);
        assertEquals("Owner Exclusive Penthouse", created.getTitle());
        assertEquals("sarah_owner", created.getOwner().getUsername());

        // Updating with the rightful owner succeeds
        ListingRequest updateReq = new ListingRequest();
        updateReq.setTitle("Updated Owner Penthouse");
        updateReq.setPrice(new BigDecimal("4500"));
        Listing updated = listingService.updateListing(created.getListingId(), updateReq, "sarah_owner");
        assertEquals("Updated Owner Penthouse", updated.getTitle());

        // Attempting to update or delete as another user (alex_tenant) should throw AccessDeniedException
        assertThrows(AccessDeniedException.class, () -> {
            listingService.updateListing(created.getListingId(), updateReq, "alex_tenant");
        });

        assertThrows(AccessDeniedException.class, () -> {
            listingService.deleteListing(created.getListingId(), "alex_tenant");
        });

        // Admin can update or delete any listing
        assertDoesNotThrow(() -> {
            listingService.updateListing(created.getListingId(), updateReq, "admin");
        });
    }
}
