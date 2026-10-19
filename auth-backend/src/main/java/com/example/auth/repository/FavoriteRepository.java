package com.example.auth.repository;

import com.example.auth.entity.Favorite;
import com.example.auth.entity.Listing;
import com.example.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserOrderByCreatedAtDesc(User user);
    Optional<Favorite> findByUserAndListing(User user, Listing listing);
    boolean existsByUserAndListing(User user, Listing listing);
    void deleteByUserAndListing(User user, Listing listing);
}
