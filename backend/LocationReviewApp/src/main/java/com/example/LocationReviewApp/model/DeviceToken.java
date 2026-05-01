package com.example.LocationReviewApp.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

// Represents the 'device_tokens' table in the database.
// Stores Expo push tokens so the backend knows where to send notifications.
// A user can have multiple tokens — one per device (phone, tablet etc).
// Tokens are deleted automatically when the user is deleted (ON DELETE CASCADE in DB).
@Entity
@Table(name = "device_tokens")
public class DeviceToken {

    @Id
    @GeneratedValue
    private UUID id;

    // The user this token belongs to
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The Expo push token string e.g. ExponentPushToken[xxxxxx]
    // Unique per user/device combination — enforced by DB constraint
    @Column(nullable = false)
    private String token;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}