package com.example.LocationReviewApp.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

// Represents the 'notification_log' table in the database.
// Records when a user was notified about a specific location.
// Used to enforce the 1 hour cooldown — before sending a notification,
// the backend checks this table and skips if one was already sent recently.
// Does NOT store the user's physical location — coordinates are never persisted.
@Entity
@Table(name = "notification_log")
public class NotificationLog {

    @Id
    @GeneratedValue
    private UUID id;

    // The user who received the notification
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The location the notification was about
    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    // When the notification was sent
    @Column(name = "notified_at")
    private Instant notifiedAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }

    public Instant getNotifiedAt() { return notifiedAt; }
    public void setNotifiedAt(Instant notifiedAt) { this.notifiedAt = notifiedAt; }
}