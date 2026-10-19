package com.example.auth.controller;

import com.example.auth.dto.ReminderRequest;
import com.example.auth.entity.Reminder;
import com.example.auth.service.ReminderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    @Autowired
    private ReminderService reminderService;

    @GetMapping
    public ResponseEntity<List<Reminder>> getMyReminders(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(reminderService.getAllReminders());
        }
        return ResponseEntity.ok(reminderService.getMyReminders(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<Reminder> createReminder(
            @Valid @RequestBody ReminderRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(reminderService.createReminder(request, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Reminder> updateReminder(
            @PathVariable Long id,
            @Valid @RequestBody ReminderRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(reminderService.updateReminder(id, request, authentication.getName()));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Reminder> toggleStatus(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(reminderService.toggleStatus(id, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteReminder(@PathVariable Long id, Authentication authentication) {
        reminderService.deleteReminder(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Reminder successfully deleted."));
    }
}
