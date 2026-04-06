package com.example.LocationReviewApp.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.LocationReviewApp.model.Review;
import com.example.LocationReviewApp.repository.ReviewRepository;
import com.example.LocationReviewApp.service.AzureBlobService;

// Handles all API requests related to reviews
// Base URL for all endpoints in this controller: /reviews
@RestController
@RequestMapping("/reviews")
public class ReviewController {

    // Injects the ReviewRepository so we can query the database
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private AzureBlobService blobService;

    // GET /reviews - returns all reviews in the database
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // GET /reviews/{id} - returns a single review by its UUID
    @GetMapping("/{id}")
    public Review getReviewById(@PathVariable UUID id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
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

    // POST /reviews/{id}/photo - uploads a photo for a review to Azure Blob Storage
    // Photo is optional — reviews without a photo simply have photoUrl as null
    @PostMapping("/{id}/photo")
    public ResponseEntity<Map<String, String>> uploadReviewPhoto(@PathVariable UUID id, @RequestParam("file") MultipartFile file)
    {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/"))
        {
            return ResponseEntity.badRequest().body(Map.of("error", "File must be an image"));
        }

        try
        {
            String url = blobService.uploadImage(file);
            review.setPhotoUrl(url);
            reviewRepository.save(review);
            return ResponseEntity.ok(Map.of("url", url));
        }
        catch (IOException e)
        {
            return ResponseEntity.internalServerError().body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }
}