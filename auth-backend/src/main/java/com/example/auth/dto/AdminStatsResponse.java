package com.example.auth.dto;

import java.math.BigDecimal;

public class AdminStatsResponse {
    private long totalListings;
    private long availableListings;
    private long totalUsers;
    private long totalTenants;
    private long totalOwners;
    private long totalBookings;
    private long confirmedBookings;
    private BigDecimal totalRevenue = BigDecimal.ZERO;
    private long pendingReports;

    public AdminStatsResponse() {}

    public long getTotalListings() { return totalListings; }
    public void setTotalListings(long totalListings) { this.totalListings = totalListings; }

    public long getAvailableListings() { return availableListings; }
    public void setAvailableListings(long availableListings) { this.availableListings = availableListings; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalTenants() { return totalTenants; }
    public void setTotalTenants(long totalTenants) { this.totalTenants = totalTenants; }

    public long getTotalOwners() { return totalOwners; }
    public void setTotalOwners(long totalOwners) { this.totalOwners = totalOwners; }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }

    public long getConfirmedBookings() { return confirmedBookings; }
    public void setConfirmedBookings(long confirmedBookings) { this.confirmedBookings = confirmedBookings; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public long getPendingReports() { return pendingReports; }
    public void setPendingReports(long pendingReports) { this.pendingReports = pendingReports; }
}
