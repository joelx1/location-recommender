package com.example.LocationReviewApp.dto;

import java.util.UUID;

// Represents the data received when sending a friend request
// Callers send just the two user IDs; the controller looks up the User objects
public class FriendRequest {

    // The user sending the friend request
    private UUID requesterId;

    // The user receiving the friend request
    private UUID receiverId;

    public UUID getRequesterId() { return requesterId; }
    public void setRequesterId(UUID requesterId) { this.requesterId = requesterId; }

    public UUID getReceiverId() { return receiverId; }
    public void setReceiverId(UUID receiverId) { this.receiverId = receiverId; }
}