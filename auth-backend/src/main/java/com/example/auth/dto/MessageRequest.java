package com.example.auth.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class MessageRequest {
    private Long listingId;
    private Long receiverId;
    private String subject;

    @NotBlank(message = "Message text is required")
    private String messageText;

    private String senderEmail;
    private String senderPhone;
    private String messageType; // ENQUIRY, CHAT, VIEWING_REQUEST
    private LocalDateTime viewingDate;

    public Long getListingId() { return listingId; }
    public void setListingId(Long listingId) { this.listingId = listingId; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }

    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }

    public String getSenderPhone() { return senderPhone; }
    public void setSenderPhone(String senderPhone) { this.senderPhone = senderPhone; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public LocalDateTime getViewingDate() { return viewingDate; }
    public void setViewingDate(LocalDateTime viewingDate) { this.viewingDate = viewingDate; }
}
