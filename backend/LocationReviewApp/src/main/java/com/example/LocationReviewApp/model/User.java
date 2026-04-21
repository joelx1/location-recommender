package com.example.LocationReviewApp.model;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

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

    // The user's Azure Object ID — read from the 'sub' claim in their JWT token.
    // Set once on first login. Used to look up which DB user a token belongs to.
    @Column(unique = true)
    private String azureOid;

    // Stores a user's bio with a 500 char limit
    @Column(length = 500)
    private String bio;
    // stores a URL once blob storage is added
    private String profilePic;

    // Automatically set to the time the user was created
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAzureOid() { return azureOid; }
    public void setAzureOid(String azureOid) { this.azureOid = azureOid; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}