package com.example.LocationReviewApp.controller;

import com.example.LocationReviewApp.model.Review;
import com.example.LocationReviewApp.model.User;
import com.example.LocationReviewApp.repository.ReviewRepository;
import com.example.LocationReviewApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

// Handles all API requests related to users
// Base URL for all endpoints in this controller: /users
@RestController
@RequestMapping("/users")
public class UserController {

    // Injects the UserRepository so we can query the database
    @Autowired
    private UserRepository userRepository;

    // Injects ReviewRepository to fetch reviews written by a user
    @Autowired
    private ReviewRepository reviewRepository;

    // GET /users - returns all users in the database
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET /users/{id} - returns a single user by their UUID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // POST /users - creates a new user from the request body
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }

    // DELETE /users/{id} - deletes a user by their UUID
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable UUID id) {
        userRepository.deleteById(id);
    }

    // GET /users/{id}/reviews - returns all reviews written by a user
    @GetMapping("/{id}/reviews")
    public List<Review> getReviewsByUser(@PathVariable UUID id) {
        return reviewRepository.findByUserId(id);
    }
}