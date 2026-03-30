package com.example.auth.controller;

import com.example.auth.entity.Booking;
import com.example.auth.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    
    @Autowired
    private BookingRepository repository;
    
    @GetMapping
    public List<Booking> getAll() {
        return repository.findAll();
    }
}
