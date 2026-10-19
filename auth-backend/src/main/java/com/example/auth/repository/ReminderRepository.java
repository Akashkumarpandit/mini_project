package com.example.auth.repository;

import com.example.auth.entity.Listing;
import com.example.auth.entity.Reminder;
import com.example.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByReceiverOrderByDueAtAsc(User receiver);
    List<Reminder> findBySenderOrderByDueAtAsc(User sender);
    List<Reminder> findByListing(Listing listing);
    List<Reminder> findByReceiverAndStatusOrderByDueAtAsc(User receiver, String status);
}
