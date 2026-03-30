package com.example.auth.entity;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "messages")
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long messageId;
    private String messageText;

    @ManyToOne @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne @JoinColumn(name = "receiver_id")
    private User receiver;

    @ManyToOne @JoinColumn(name = "listing_id")
    private Listing listing;

    // Getters and setters
    public Long getMessageId() { return messageId; }
    public void setMessageId(Long messageId) { this.messageId = messageId; }
    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }
    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }
}
