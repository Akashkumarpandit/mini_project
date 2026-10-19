package com.example.auth.controller;

import com.example.auth.dto.ListingRequest;
import com.example.auth.entity.Listing;
import com.example.auth.service.ListingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/listings")
public class ListingController {

    @Autowired
    private ListingService listingService;

    @GetMapping
    public ResponseEntity<List<Listing>> searchListings(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer beds,
            @RequestParam(required = false) Integer baths,
            @RequestParam(required = false) Boolean furnished,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(required = false, defaultValue = "default") String sortBy
    ) {
        String searchQuery = query != null ? query : title;
        return ResponseEntity.ok(listingService.searchListings(
                type,
                searchQuery,
                minPrice,
                maxPrice,
                beds,
                baths,
                furnished,
                availableOnly,
                sortBy
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Listing> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getListingById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Listing>> getMyListings(Authentication authentication) {
        return ResponseEntity.ok(listingService.getMyListings(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Listing> createListing(@Valid @RequestBody ListingRequest request, Authentication authentication) {
        return ResponseEntity.ok(listingService.createListing(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Listing> updateListing(
            @PathVariable Long id,
            @Valid @RequestBody ListingRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(listingService.updateListing(id, request, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteListing(@PathVariable Long id, Authentication authentication) {
        listingService.deleteListing(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Listing successfully deleted."));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Listing> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String status = body.get("status");
        return ResponseEntity.ok(listingService.updateStatus(id, status, authentication.getName()));
    }
}
