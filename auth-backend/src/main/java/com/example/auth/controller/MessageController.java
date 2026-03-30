package com.example.auth.controller;

import com.example.auth.entity.Message;
import com.example.auth.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    
    @Autowired
    private MessageRepository repository;
    
    @GetMapping
    public List<Message> getAll() {
        return repository.findAll();
    }
}
