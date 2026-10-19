package com.example.auth.repository;

import com.example.auth.entity.Listing;
import com.example.auth.entity.Review;
import com.example.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByListingListingIdOrderByCreatedAtDesc(Long listingId);
    List<Review> findByListingOrderByCreatedAtDesc(Listing listing);
    Optional<Review> findByUserAndListing(User user, Listing listing);
    boolean existsByUserAndListing(User user, Listing listing);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.listing.listingId = :listingId")
    Double calculateAverageRating(@Param("listingId") Long listingId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.listing.listingId = :listingId")
    Integer countReviews(@Param("listingId") Long listingId);
}
