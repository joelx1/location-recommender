package com.example.LocationReviewApp.dto;

import java.util.UUID;

// Represents the data received when adding a friend.
// Only the receiver's ID is needed — the requester is always derived from the JWT
// in the controller, so callers cannot send a request on behalf of someone else.
//
// Note: requesterId was removed. It was dead code — the controller never read it,
// and accepting it in the request body was misleading since it was always ignored.
public class FriendRequest {

    private UUID receiverId;

    public UUID getReceiverId() { return receiverId; }
    public void setReceiverId(UUID receiverId) { this.receiverId = receiverId; }
}