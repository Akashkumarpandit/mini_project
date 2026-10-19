package com.example.auth.controller;

import com.example.auth.dto.ReviewRequest;
import com.example.auth.entity.Review;
import com.example.auth.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/listing/{listingId}")
    public ResponseEntity<List<Review>> getReviewsForListing(@PathVariable Long listingId) {
        return ResponseEntity.ok(reviewService.getReviewsForListing(listingId));
    }

    @PostMapping
    public ResponseEntity<Review> addReview(
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(reviewService.addReview(request, authentication.getName()));
    }
}
