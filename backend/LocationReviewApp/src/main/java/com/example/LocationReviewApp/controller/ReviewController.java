package com.example.LocationReviewApp.controller;

import com.example.LocationReviewApp.model.Review;
import com.example.LocationReviewApp.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

// Handles all API requests related to reviews
// Base URL for all endpoints in this controller: /reviews
@RestController
@RequestMapping("/reviews")
public class ReviewController {

    // Injects the ReviewRepository so we can query the database
    @Autowired
    private ReviewRepository reviewRepository;

    // GET /reviews - returns all reviews in the database
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // GET /reviews/{id} - returns a single review by its UUID
    @GetMapping("/{id}")
    public Review getReviewById(@PathVariable UUID id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
    }

    // POST /reviews - creates a new review from the request body
    @PostMapping
    public Review createReview(@RequestBody Review review) {
        return reviewRepository.save(review);
    }

    // DELETE /reviews/{id} - deletes a review by its UUID
    @DeleteMapping("/{id}")
    public void deleteReview(@PathVariable UUID id) {
        reviewRepository.deleteById(id);
    }
}