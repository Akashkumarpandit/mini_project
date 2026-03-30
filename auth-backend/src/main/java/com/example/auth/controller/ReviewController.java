package com.example.auth.controller;

import com.example.auth.entity.Review;
import com.example.auth.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    
    @Autowired
    private ReviewRepository repository;
    
    @GetMapping
    public List<Review> getAll() {
        return repository.findAll();
    }
}
