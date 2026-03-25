package com.example.LocationReviewApp.repository;

import com.example.LocationReviewApp.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    // Returns all reviews for a given location
    List<Review> findByLocationId(UUID locationId);

    // Returns all reviews written by a given user
    List<Review> findByUserId(UUID userId);
}