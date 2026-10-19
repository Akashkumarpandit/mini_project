package com.example.auth.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "listings")
public class Listing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long listingId;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 12, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    // Backward-compatibility alias
    @Column(precision = 12, scale = 2)
    private BigDecimal pricePerDay = BigDecimal.ZERO;

    private String priceUnit = "PER_MONTH"; // PER_MONTH, PER_NIGHT, PER_DAY

    @Column(precision = 12, scale = 2)
    private BigDecimal deposit = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal cleaningFee = BigDecimal.ZERO;

    private String currency = "USD";

    private String type = "APARTMENT"; // APARTMENT, HOUSE, VILLA, STUDIO, COMMERCIAL

    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private String location; // e.g. "Downtown, New York"

    private Integer beds = 1;
    private Integer baths = 1;
    private Integer areaSqFt = 750;

    private boolean furnished = true;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String amenities = "WiFi, Air Conditioning, Heating, Kitchen, Washer";

    @Lob
    @Column(columnDefinition = "TEXT")
    private String houseRules;

    @Column(length = 1000)
    private String imageUrl;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String images; // Comma separated URLs

    private String tags;

    private String status = "PUBLISHED"; // DRAFT, PUBLISHED, PAUSED, ARCHIVED
    private String availabilityStatus = "AVAILABLE"; // AVAILABLE, BOOKED, MAINTENANCE

    private Double rating = 5.0;
    private Integer reviewCount = 0;
    private boolean verified = true;
    private boolean featured = false;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id")
    private User owner;

    public Listing() {}

    @PrePersist
    public void prePersist() {
        if (pricePerDay == null || pricePerDay.compareTo(BigDecimal.ZERO) == 0) {
            pricePerDay = price;
        }
        if (price == null || price.compareTo(BigDecimal.ZERO) == 0) {
            price = pricePerDay;
        }
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getListingId() { return listingId; }
    public void setListingId(Long listingId) { this.listingId = listingId; }

    // Convenience alias for JSON serialization
    public Long getId() { return listingId; }
    public void setId(Long id) { this.listingId = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) {
        this.price = price;
        this.pricePerDay = price;
    }

    public BigDecimal getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(BigDecimal pricePerDay) {
        this.pricePerDay = pricePerDay;
        if (this.price == null || this.price.compareTo(BigDecimal.ZERO) == 0) {
            this.price = pricePerDay;
        }
    }

    public String getPriceUnit() { return priceUnit; }
    public void setPriceUnit(String priceUnit) { this.priceUnit = priceUnit; }

    public BigDecimal getDeposit() { return deposit; }
    public void setDeposit(BigDecimal deposit) { this.deposit = deposit; }

    public BigDecimal getCleaningFee() { return cleaningFee; }
    public void setCleaningFee(BigDecimal cleaningFee) { this.cleaningFee = cleaningFee; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getBeds() { return beds; }
    public void setBeds(Integer beds) { this.beds = beds; }

    public Integer getBaths() { return baths; }
    public void setBaths(Integer baths) { this.baths = baths; }

    public Integer getAreaSqFt() { return areaSqFt; }
    public void setAreaSqFt(Integer areaSqFt) { this.areaSqFt = areaSqFt; }

    public boolean isFurnished() { return furnished; }
    public void setFurnished(boolean furnished) { this.furnished = furnished; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public String getHouseRules() { return houseRules; }
    public void setHouseRules(String houseRules) { this.houseRules = houseRules; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAvailabilityStatus() { return availabilityStatus; }
    public void setAvailabilityStatus(String availabilityStatus) { this.availabilityStatus = availabilityStatus; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }

    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
}
