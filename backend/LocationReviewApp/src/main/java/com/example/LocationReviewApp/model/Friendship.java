package com.example.LocationReviewApp.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

// Represents the 'friendships' table in the database
// A friendship links two users and tracks whether the request has been accepted
@Entity
@Table(name = "friendships")
public class Friendship {

    // Unique ID automatically generated for each friendship record
    @Id
    @GeneratedValue
    private UUID id;

    // The user who sent the friend request
    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    // The user who received the friend request
    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    // Whether this request is still pending or has been accepted
    // Stored as a string ("PENDING" / "ACCEPTED") in the database
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendshipStatus status = FriendshipStatus.PENDING;

    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getRequester() { return requester; }
    public void setRequester(User requester) { this.requester = requester; }

    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }

    public FriendshipStatus getStatus() { return status; }
    public void setStatus(FriendshipStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}