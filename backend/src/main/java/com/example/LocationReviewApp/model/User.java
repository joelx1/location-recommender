package com.example.LocationReviewApp.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

// Represents the 'users' table in the database
// Each instance of this class = one row in the users table
@Entity
@Table(name = "users")
public class User {

    // Unique ID automatically generated for each user
    @Id
    @GeneratedValue
    private UUID id;

    // Username must be unique - no two users can share one
    @Column(nullable = false, unique = true)
    private String username;

    // Email must be unique - no two users can share one
    @Column(nullable = false, unique = true)
    private String email;

    // Automatically set to the time the user was created
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}