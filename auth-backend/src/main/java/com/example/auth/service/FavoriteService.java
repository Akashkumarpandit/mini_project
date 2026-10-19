package com.example.auth.service;

import com.example.auth.entity.Favorite;
import com.example.auth.entity.Listing;
import com.example.auth.entity.User;
import com.example.auth.repository.FavoriteRepository;
import com.example.auth.repository.ListingRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Listing> getUserFavoriteListings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return favoriteRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(Favorite::getListing)
                .collect(Collectors.toList());
    }

    public List<Long> getUserFavoriteListingIds(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return favoriteRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(f -> f.getListing().getListingId())
                .collect(Collectors.toList());
    }

    @Transactional
    public boolean toggleFavorite(Long listingId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found: " + listingId));

        Optional<Favorite> existing = favoriteRepository.findByUserAndListing(user, listing);
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            return false; // Removed
        } else {
            Favorite fav = new Favorite(user, listing);
            favoriteRepository.save(fav);
            return true; // Added
        }
    }
}
