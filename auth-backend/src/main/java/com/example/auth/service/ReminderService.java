package com.example.auth.service;

import com.example.auth.dto.ReminderRequest;
import com.example.auth.entity.Listing;
import com.example.auth.entity.Reminder;
import com.example.auth.entity.User;
import com.example.auth.repository.ListingRepository;
import com.example.auth.repository.ReminderRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReminderService {

    @Autowired
    private ReminderRepository reminderRepository;

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Reminder> getMyReminders(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        if (user.getRoles().contains("ADMIN")) {
            return reminderRepository.findAll();
        }
        return reminderRepository.findByReceiverOrderByDueAtAsc(user);
    }

    public List<Reminder> getAllReminders() {
        return reminderRepository.findAll();
    }

    @Transactional
    public Reminder createReminder(ReminderRequest req, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Reminder reminder = new Reminder();
        reminder.setTitle(req.getTitle());
        reminder.setMessageText(req.getMessageText());
        reminder.setReminderType(req.getReminderType() != null ? req.getReminderType() : "INSPECTION");
        reminder.setDueAt(req.getDueAt());
        reminder.setStatus(req.getStatus() != null ? req.getStatus() : "PENDING");
        reminder.setReceiver(user);
        reminder.setSender(user);

        if (req.getListingId() != null) {
            Listing listing = listingRepository.findById(req.getListingId()).orElse(null);
            reminder.setListing(listing);
        }

        return reminderRepository.save(reminder);
    }

    @Transactional
    public Reminder updateReminder(Long id, ReminderRequest req, String username) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found: " + id));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (!reminder.getReceiver().getId().equals(user.getId()) && !user.getRoles().contains("ADMIN")) {
            throw new AccessDeniedException("Not authorized to modify this reminder.");
        }

        if (req.getTitle() != null) reminder.setTitle(req.getTitle());
        if (req.getMessageText() != null) reminder.setMessageText(req.getMessageText());
        if (req.getReminderType() != null) reminder.setReminderType(req.getReminderType());
        if (req.getDueAt() != null) reminder.setDueAt(req.getDueAt());
        if (req.getStatus() != null) reminder.setStatus(req.getStatus());

        return reminderRepository.save(reminder);
    }

    @Transactional
    public Reminder toggleStatus(Long id, String username) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found: " + id));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (!reminder.getReceiver().getId().equals(user.getId()) && !user.getRoles().contains("ADMIN")) {
            throw new AccessDeniedException("Not authorized to modify this reminder.");
        }

        reminder.setStatus("COMPLETED".equals(reminder.getStatus()) ? "PENDING" : "COMPLETED");
        return reminderRepository.save(reminder);
    }

    @Transactional
    public void deleteReminder(Long id, String username) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found: " + id));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        if (!reminder.getReceiver().getId().equals(user.getId()) && !user.getRoles().contains("ADMIN")) {
            throw new AccessDeniedException("Not authorized to delete this reminder.");
        }

        reminderRepository.delete(reminder);
    }
}
