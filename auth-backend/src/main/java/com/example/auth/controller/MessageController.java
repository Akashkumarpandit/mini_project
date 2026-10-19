package com.example.auth.controller;

import com.example.auth.dto.MessageRequest;
import com.example.auth.entity.Message;
import com.example.auth.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // Public / prospect enquiry endpoint
    @PostMapping("/enquire")
    public ResponseEntity<Message> sendPublicEnquiry(
            @Valid @RequestBody MessageRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(messageService.sendMessage(request, username));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<Message>> getInbox(Authentication authentication) {
        return ResponseEntity.ok(messageService.getInbox(authentication.getName()));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<Message>> getSent(Authentication authentication) {
        return ResponseEntity.ok(messageService.getSent(authentication.getName()));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Message> markAsRead(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(messageService.markAsRead(id, authentication.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Message> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String status = body.get("status");
        return ResponseEntity.ok(messageService.updateStatus(id, status, authentication.getName()));
    }
}
