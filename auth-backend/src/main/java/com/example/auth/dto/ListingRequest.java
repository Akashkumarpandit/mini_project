package com.example.auth.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ListingRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    // Backward compatibility with legacy pricePerDay
    private BigDecimal pricePerDay;

    private String priceUnit; // PER_MONTH, PER_NIGHT, PER_DAY
    private BigDecimal deposit;
    private BigDecimal cleaningFee;
    private String currency;

    private String type; // APARTMENT, HOUSE, VILLA, STUDIO, COMMERCIAL

    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private String location;

    private Integer beds;
    private Integer baths;
    private Integer areaSqFt;

    private Boolean furnished;
    private String amenities;
    private String houseRules;

    private String imageUrl;
    private String images;
    private String tags;

    private String status; // PUBLISHED, DRAFT, PAUSED, ARCHIVED
    private String availabilityStatus; // AVAILABLE, BOOKED, MAINTENANCE

    private Long categoryId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() {
        if (price != null) return price;
        return pricePerDay;
    }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getPricePerDay() {
        if (pricePerDay != null) return pricePerDay;
        return price;
    }
    public void setPricePerDay(BigDecimal pricePerDay) { this.pricePerDay = pricePerDay; }

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

    public Boolean getFurnished() { return furnished; }
    public void setFurnished(Boolean furnished) { this.furnished = furnished; }

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

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
}
