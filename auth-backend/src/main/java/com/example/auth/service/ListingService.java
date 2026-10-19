package com.example.auth.service;

import com.example.auth.dto.ListingRequest;
import com.example.auth.entity.Category;
import com.example.auth.entity.Listing;
import com.example.auth.entity.User;
import com.example.auth.repository.CategoryRepository;
import com.example.auth.repository.ListingRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ListingService {

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Listing> searchListings(
            String type,
            String query,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Integer beds,
            Integer baths,
            Boolean furnished,
            Boolean availableOnly,
            String sortBy
    ) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if ("rating".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "rating");
        } else if ("newest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        return listingRepository.searchListings(
                "PUBLISHED",
                type,
                query,
                minPrice,
                maxPrice,
                beds,
                baths,
                furnished,
                availableOnly,
                sort
        );
    }

    public List<Listing> getAllListings() {
        return listingRepository.findAll();
    }

    public Listing getListingById(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + id));
    }

    public List<Listing> getMyListings(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        if (user.getRoles().contains("ADMIN")) {
            return listingRepository.findAll();
        }
        return listingRepository.findByOwner(user);
    }

    @Transactional
    public Listing createListing(ListingRequest req, String username) {
        User owner = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Listing listing = new Listing();
        applyRequestToListing(req, listing);
        listing.setOwner(owner);

        if (listing.getStatus() == null) listing.setStatus("PUBLISHED");
        if (listing.getAvailabilityStatus() == null) listing.setAvailabilityStatus("AVAILABLE");

        return listingRepository.save(listing);
    }

    @Transactional
    public Listing updateListing(Long id, ListingRequest req, String username) {
        Listing listing = getListingById(id);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // Ownership or Admin check
        boolean isAdmin = user.getRoles().contains("ADMIN");
        boolean isOwner = listing.getOwner() != null && listing.getOwner().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You are not authorized to update this listing.");
        }

        applyRequestToListing(req, listing);
        return listingRepository.save(listing);
    }

    @Transactional
    public void deleteListing(Long id, String username) {
        Listing listing = getListingById(id);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        boolean isAdmin = user.getRoles().contains("ADMIN");
        boolean isOwner = listing.getOwner() != null && listing.getOwner().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You are not authorized to delete this listing.");
        }

        listingRepository.delete(listing);
    }

    @Transactional
    public Listing updateStatus(Long id, String status, String username) {
        Listing listing = getListingById(id);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        boolean isAdmin = user.getRoles().contains("ADMIN");
        boolean isOwner = listing.getOwner() != null && listing.getOwner().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("You are not authorized to modify this listing status.");
        }

        listing.setStatus(status);
        return listingRepository.save(listing);
    }

    private void applyRequestToListing(ListingRequest req, Listing listing) {
        listing.setTitle(req.getTitle());
        listing.setDescription(req.getDescription());
        if (req.getPrice() != null) listing.setPrice(req.getPrice());
        if (req.getPriceUnit() != null) listing.setPriceUnit(req.getPriceUnit());
        if (req.getDeposit() != null) listing.setDeposit(req.getDeposit());
        if (req.getCleaningFee() != null) listing.setCleaningFee(req.getCleaningFee());
        if (req.getCurrency() != null) listing.setCurrency(req.getCurrency());
        if (req.getType() != null) listing.setType(req.getType());
        if (req.getAddress() != null) listing.setAddress(req.getAddress());
        if (req.getCity() != null) listing.setCity(req.getCity());
        if (req.getState() != null) listing.setState(req.getState());
        if (req.getCountry() != null) listing.setCountry(req.getCountry());
        if (req.getZipCode() != null) listing.setZipCode(req.getZipCode());
        if (req.getLocation() != null) listing.setLocation(req.getLocation());
        if (req.getBeds() != null) listing.setBeds(req.getBeds());
        if (req.getBaths() != null) listing.setBaths(req.getBaths());
        if (req.getAreaSqFt() != null) listing.setAreaSqFt(req.getAreaSqFt());
        if (req.getFurnished() != null) listing.setFurnished(req.getFurnished());
        if (req.getAmenities() != null) listing.setAmenities(req.getAmenities());
        if (req.getHouseRules() != null) listing.setHouseRules(req.getHouseRules());
        if (req.getImageUrl() != null) listing.setImageUrl(req.getImageUrl());
        if (req.getImages() != null) listing.setImages(req.getImages());
        if (req.getTags() != null) listing.setTags(req.getTags());
        if (req.getStatus() != null) listing.setStatus(req.getStatus());
        if (req.getAvailabilityStatus() != null) listing.setAvailabilityStatus(req.getAvailabilityStatus());

        if (req.getCategoryId() != null) {
            Category cat = categoryRepository.findById(req.getCategoryId()).orElse(null);
            listing.setCategory(cat);
        }
    }
}
