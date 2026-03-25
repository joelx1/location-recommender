package com.example.LocationReviewApp.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

// Represents the 'reviews' table in the database
// A review links a user to a location with a rating and optional comment
@Entity
@Table(name = "reviews")
public class Review {

    // Unique ID automatically generated for each review
    @Id
    @GeneratedValue
    private UUID id;

    // The user who wrote this review
    // ManyToOne = many reviews can belong to one user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The location being reviewed
    // ManyToOne = many reviews can belong to one location
    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    // Rating must be between 1 and 5
    @Column(nullable = false)
    private int rating;

    // Optional written review
    private String body;

    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}