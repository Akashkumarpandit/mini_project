package com.example.auth.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class ReminderRequest {
    private Long listingId;

    @NotBlank(message = "Title is required")
    private String title;

    private String messageText;
    private String reminderType; // VIEWING, INSPECTION, FOLLOWUP, EMAIL
    private LocalDateTime dueAt;
    private String status; // PENDING, COMPLETED, CANCELLED

    public Long getListingId() { return listingId; }
    public void setListingId(Long listingId) { this.listingId = listingId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public String getReminderType() { return reminderType; }
    public void setReminderType(String reminderType) { this.reminderType = reminderType; }

    public LocalDateTime getDueAt() { return dueAt; }
    public void setDueAt(LocalDateTime dueAt) { this.dueAt = dueAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
