package com.example.auth.controller;

import com.example.auth.entity.Listing;
import com.example.auth.repository.ListingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
public class ListingController {
    
    @Autowired
    private ListingRepository repository;
    
    @GetMapping
    public List<Listing> getAll() {
        return repository.findAll();
    }
}
