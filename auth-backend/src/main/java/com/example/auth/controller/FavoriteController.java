package com.example.auth.controller;

import com.example.auth.entity.Listing;
import com.example.auth.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<List<Listing>> getUserFavorites(Authentication authentication) {
        return ResponseEntity.ok(favoriteService.getUserFavoriteListings(authentication.getName()));
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getUserFavoriteIds(Authentication authentication) {
        return ResponseEntity.ok(favoriteService.getUserFavoriteListingIds(authentication.getName()));
    }

    @PostMapping("/{listingId}/toggle")
    public ResponseEntity<Map<String, Object>> toggleFavorite(
            @PathVariable Long listingId,
            Authentication authentication
    ) {
        boolean isFavorited = favoriteService.toggleFavorite(listingId, authentication.getName());
        return ResponseEntity.ok(Map.of(
                "listingId", listingId,
                "isFavorited", isFavorited,
                "message", isFavorited ? "Added to favorites." : "Removed from favorites."
        ));
    }
}
