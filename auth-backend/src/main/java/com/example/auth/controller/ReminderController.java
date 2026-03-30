package com.example.auth.controller;

import com.example.auth.entity.Reminder;
import com.example.auth.repository.ReminderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {
    
    @Autowired
    private ReminderRepository repository;
    
    @GetMapping
    public List<Reminder> getAll() {
        return repository.findAll();
    }
}
