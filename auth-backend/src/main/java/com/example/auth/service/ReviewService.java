package com.example.auth.service;

import com.example.auth.dto.ReviewRequest;
import com.example.auth.entity.Listing;
import com.example.auth.entity.Review;
import com.example.auth.entity.User;
import com.example.auth.repository.ListingRepository;
import com.example.auth.repository.ReviewRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Review> getReviewsForListing(Long listingId) {
        return reviewRepository.findByListingListingIdOrderByCreatedAtDesc(listingId);
    }

    @Transactional
    public Review addReview(ReviewRequest req, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Listing listing = listingRepository.findById(req.getListingId())
                .orElseThrow(() -> new RuntimeException("Listing not found with id: " + req.getListingId()));

        if (reviewRepository.existsByUserAndListing(user, listing)) {
            throw new IllegalStateException("You have already submitted a review for this property.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setListing(listing);
        review.setRating(req.getRating());
        review.setComment(req.getComment());
        review.setVerifiedRental(true);

        Review saved = reviewRepository.save(review);

        // Update listing aggregated rating and review count
        Double avgRating = reviewRepository.calculateAverageRating(listing.getListingId());
        Integer count = reviewRepository.countReviews(listing.getListingId());

        listing.setRating(Math.round(avgRating * 10.0) / 10.0);
        listing.setReviewCount(count);
        listingRepository.save(listing);

        return saved;
    }
}
