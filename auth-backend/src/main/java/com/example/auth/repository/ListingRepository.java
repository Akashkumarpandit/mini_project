package com.example.auth.repository;

import com.example.auth.entity.Listing;
import com.example.auth.entity.User;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByOwner(User owner);
    List<Listing> findByOwnerId(Long ownerId);
    List<Listing> findByStatus(String status);
    List<Listing> findByAvailabilityStatus(String availabilityStatus);
    long countByStatus(String status);
    long countByAvailabilityStatus(String availabilityStatus);

    @Query("SELECT l FROM Listing l WHERE " +
           "(:status IS NULL OR l.status = :status) AND " +
           "(:type IS NULL OR :type = 'ALL' OR UPPER(l.type) = UPPER(:type)) AND " +
           "(:query IS NULL OR :query = '' OR LOWER(l.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.location) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(l.city) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:minPrice IS NULL OR l.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR l.price <= :maxPrice) AND " +
           "(:beds IS NULL OR l.beds >= :beds) AND " +
           "(:baths IS NULL OR l.baths >= :baths) AND " +
           "(:furnished IS NULL OR l.furnished = :furnished) AND " +
           "(:availableOnly IS NULL OR :availableOnly = false OR l.availabilityStatus = 'AVAILABLE')")
    List<Listing> searchListings(
        @Param("status") String status,
        @Param("type") String type,
        @Param("query") String query,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("beds") Integer beds,
        @Param("baths") Integer baths,
        @Param("furnished") Boolean furnished,
        @Param("availableOnly") Boolean availableOnly,
        Sort sort
    );

    List<Listing> findTop6ByFeaturedTrueAndStatus(String status);
}
