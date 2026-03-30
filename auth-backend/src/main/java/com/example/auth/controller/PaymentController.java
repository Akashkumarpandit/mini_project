package com.example.auth.controller;

import com.example.auth.entity.Payment;
import com.example.auth.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    
    @Autowired
    private PaymentRepository repository;
    
    @GetMapping
    public List<Payment> getAll() {
        return repository.findAll();
    }
}
