package com.example.auth.entity;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders")
public class Reminder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long reminderId;
    private String messageText;
    private LocalDateTime sendAt;
    private String status;

    @ManyToOne @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne @JoinColumn(name = "receiver_id")
    private User receiver;

    @ManyToOne @JoinColumn(name = "listing_id")
    private Listing listing;

    public Reminder() {}

    // Getters and setters
    public Long getReminderId() { return reminderId; }
    public void setReminderId(Long reminderId) { this.reminderId = reminderId; }
    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }
    public LocalDateTime getSendAt() { return sendAt; }
    public void setSendAt(LocalDateTime sendAt) { this.sendAt = sendAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }
    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }
}
