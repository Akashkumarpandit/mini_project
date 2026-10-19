package com.example.auth.repository;

import com.example.auth.entity.Listing;
import com.example.auth.entity.Message;
import com.example.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByReceiverOrderByCreatedAtDesc(User receiver);
    List<Message> findBySenderOrderByCreatedAtDesc(User sender);
    List<Message> findByListingOrderByCreatedAtDesc(Listing listing);
    long countByReceiverAndIsReadFalse(User receiver);
}
