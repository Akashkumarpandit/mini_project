package com.example.auth.service;

import com.example.auth.dto.AdminStatsResponse;
import com.example.auth.dto.ReportRequest;
import com.example.auth.dto.UserDTO;
import com.example.auth.entity.*;
import com.example.auth.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private ListingRepository listingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ListingReportRepository listingReportRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public AdminStatsResponse getPlatformStats() {
        AdminStatsResponse stats = new AdminStatsResponse();
        stats.setTotalListings(listingRepository.count());
        stats.setAvailableListings(listingRepository.countByAvailabilityStatus("AVAILABLE"));
        stats.setTotalUsers(userRepository.count());
        stats.setTotalTenants(userRepository.countByRole("TENANT"));
        stats.setTotalOwners(userRepository.countByRole("OWNER") + userRepository.countByRole("AGENT"));
        stats.setTotalBookings(bookingRepository.count());
        stats.setConfirmedBookings(bookingRepository.countByBookingStatus("CONFIRMED"));

        BigDecimal rev = paymentRepository.sumSuccessfulPayments();
        stats.setTotalRevenue(rev != null ? rev : BigDecimal.ZERO);

        stats.setPendingReports(listingReportRepository.findByStatusOrderByCreatedAtDesc("OPEN").size());
        return stats;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUserRole(Long userId, String role, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        String upperRole = role.toUpperCase();
        user.setRole(upperRole);
        user.setRoles(Set.of(upperRole));
        User saved = userRepository.save(user);

        logAction("UPDATE_USER_ROLE", adminUsername, "USER", userId, "Changed role to " + upperRole);
        return new UserDTO(saved);
    }

    @Transactional
    public UserDTO toggleUserVerification(Long userId, String adminUsername) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.setVerified(!user.isVerified());
        User saved = userRepository.save(user);

        logAction("TOGGLE_USER_VERIFICATION", adminUsername, "USER", userId, "Verification status set to " + saved.isVerified());
        return new UserDTO(saved);
    }

    @Transactional
    public Listing moderateListing(Long listingId, String status, String adminUsername) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new RuntimeException("Listing not found: " + listingId));

        listing.setStatus(status.toUpperCase());
        Listing saved = listingRepository.save(listing);

        logAction("MODERATE_LISTING", adminUsername, "LISTING", listingId, "Status updated to " + status);
        return saved;
    }

    public List<ListingReport> getAllReports() {
        return listingReportRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public ListingReport createReport(ReportRequest req, String username) {
        Listing listing = listingRepository.findById(req.getListingId())
                .orElseThrow(() -> new RuntimeException("Listing not found: " + req.getListingId()));

        ListingReport report = new ListingReport();
        report.setListing(listing);
        report.setReason(req.getReason());
        report.setDetails(req.getDetails());
        report.setStatus("OPEN");

        if (username != null) {
            userRepository.findByUsername(username).ifPresent(report::setReporter);
        }

        return listingReportRepository.save(report);
    }

    @Transactional
    public ListingReport resolveReport(Long reportId, String status, String adminUsername) {
        ListingReport report = listingReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));

        report.setStatus(status.toUpperCase());
        ListingReport saved = listingReportRepository.save(report);

        logAction("RESOLVE_REPORT", adminUsername, "REPORT", reportId, "Status set to " + status);
        return saved;
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findTop100ByOrderByTimestampDesc();
    }

    public void logAction(String action, String actorUsername, String entityType, Long entityId, String details) {
        AuditLog log = new AuditLog(action, actorUsername, entityType, entityId, details);
        auditLogRepository.save(log);
    }
}
