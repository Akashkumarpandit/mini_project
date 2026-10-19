package com.example.auth.controller;

import com.example.auth.dto.AdminStatsResponse;
import com.example.auth.dto.UserDTO;
import com.example.auth.entity.AuditLog;
import com.example.auth.entity.Listing;
import com.example.auth.entity.ListingReport;
import com.example.auth.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String role = body.get("role");
        return ResponseEntity.ok(adminService.updateUserRole(id, role, authentication.getName()));
    }

    @PatchMapping("/users/{id}/verify")
    public ResponseEntity<UserDTO> toggleUserVerification(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return ResponseEntity.ok(adminService.toggleUserVerification(id, authentication.getName()));
    }

    @PatchMapping("/listings/{id}/moderate")
    public ResponseEntity<Listing> moderateListing(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String status = body.get("status");
        return ResponseEntity.ok(adminService.moderateListing(id, status, authentication.getName()));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ListingReport>> getReports() {
        return ResponseEntity.ok(adminService.getAllReports());
    }

    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<ListingReport> resolveReport(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String status = body.get("status");
        return ResponseEntity.ok(adminService.resolveReport(id, status, authentication.getName()));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }
}
