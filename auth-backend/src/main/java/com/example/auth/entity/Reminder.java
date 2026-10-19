package com.example.auth.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders")
public class Reminder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long reminderId;

    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String messageText;

    // VIEWING, INSPECTION, FOLLOWUP, EMAIL
    private String reminderType = "INSPECTION";

    private LocalDateTime dueAt;
    private LocalDateTime sendAt;

    // PENDING, COMPLETED, CANCELLED
    private String status = "PENDING";

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "listing_id")
    private Listing listing;

    public Reminder() {}

    @PrePersist
    public void prePersist() {
        if (dueAt == null && sendAt != null) dueAt = sendAt;
        if (sendAt == null && dueAt != null) sendAt = dueAt;
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getReminderId() { return reminderId; }
    public void setReminderId(Long reminderId) { this.reminderId = reminderId; }

    public Long getId() { return reminderId; }
    public void setId(Long id) { this.reminderId = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public String getReminderType() { return reminderType; }
    public void setReminderType(String reminderType) { this.reminderType = reminderType; }

    public LocalDateTime getDueAt() { return dueAt; }
    public void setDueAt(LocalDateTime dueAt) {
        this.dueAt = dueAt;
        this.sendAt = dueAt;
    }

    public LocalDateTime getSendAt() { return sendAt; }
    public void setSendAt(LocalDateTime sendAt) {
        this.sendAt = sendAt;
        if (this.dueAt == null) this.dueAt = sendAt;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }

    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }
}
