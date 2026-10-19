package com.example.auth.controller;

import com.example.auth.dto.ReportRequest;
import com.example.auth.entity.ListingReport;
import com.example.auth.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private AdminService adminService;

    @PostMapping
    public ResponseEntity<ListingReport> createReport(
            @Valid @RequestBody ReportRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(adminService.createReport(request, username));
    }
}
