import os

entities_dir = "src/main/java/com/example/myapp/entity"

entities = {
    "User.java": """package com.example.myapp.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;
    private String name;
    private String email;
    private String password;
    private String phone;
    private String role;
    private String googleId;
    private String multiFactorSecret;
    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}

    // Getters and setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    public String getMultiFactorSecret() { return multiFactorSecret; }
    public void setMultiFactorSecret(String multiFactorSecret) { this.multiFactorSecret = multiFactorSecret; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
""",
    "Reminder.java": """package com.example.myapp.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders")
public class Reminder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
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
"""
}

for filename, content in entities.items():
    with open(os.path.join(entities_dir, filename), "w") as f:
        f.write(content)

print("Entities User and Reminder updated successfully!")
