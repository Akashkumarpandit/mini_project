package com.example.auth.controller;

import com.example.auth.entity.Category;
import com.example.auth.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    
    @Autowired
    private CategoryRepository repository;
    
    @GetMapping
    public List<Category> getAll() {
        return repository.findAll();
    }
}
