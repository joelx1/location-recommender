package com.example.LocationReviewApp.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

// Represents the 'friendships' table in the database.
// A friendship is a mutual connection between two users — there is no pending/request
// flow in the MVP. Tapping "Add Friend" on the frontend creates an ACCEPTED friendship
// immediately, so both users see each other's content straight away.
//
// The status field is kept so future features (e.g. private accounts) can reintroduce
// a pending state without a schema change — just a code change in the controller.
@Entity
@Table(name = "friendships")
public class Friendship {

    @Id
    @GeneratedValue
    private UUID id;

    // The user who initiated the connection
    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    // The user who was added
    // Column is named "addressee_id" in the database — mapped explicitly to avoid mismatch
    @ManyToOne
    @JoinColumn(name = "addressee_id", nullable = false)
    private User receiver;

    // MVP default is ACCEPTED — friendships are mutual and immediate.
    // Previously defaulted to PENDING when a request/accept flow existed.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendshipStatus status = FriendshipStatus.ACCEPTED;

    @Column(name = "created_at")
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