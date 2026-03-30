package com.example.auth.entity;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "listings")
public class Listing {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long listingId;
    private String title;
    private String description;
    private BigDecimal pricePerDay;
    private String location;
    private String availabilityStatus;
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne @JoinColumn(name = "owner_id")
    private User owner;

    // Getters and setters
    public Long getListingId() { return listingId; }
    public void setListingId(Long listingId) { this.listingId = listingId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(BigDecimal pricePerDay) { this.pricePerDay = pricePerDay; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
}
