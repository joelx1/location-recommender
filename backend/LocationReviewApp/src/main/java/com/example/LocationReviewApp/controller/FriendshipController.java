package com.example.LocationReviewApp.controller;

import com.example.LocationReviewApp.dto.FriendRequest;
import com.example.LocationReviewApp.model.Friendship;
import com.example.LocationReviewApp.model.FriendshipStatus;
import com.example.LocationReviewApp.repository.FriendshipRepository;
import com.example.LocationReviewApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

// Handles all API requests related to friendships
// Base URL for all endpoints in this controller: /friends
@RestController
@RequestMapping("/friends")
public class FriendshipController {

    // Injects the FriendshipRepository so we can query the database
    @Autowired
    private FriendshipRepository friendshipRepository;

    // Injects UserRepository to look up requester and receiver by ID
    @Autowired
    private UserRepository userRepository;

    // POST /friends - sends a friend request from one user to another
    // Body: { "requesterId": "uuid", "receiverId": "uuid" }
    @PostMapping
    public Friendship sendFriendRequest(@RequestBody FriendRequest request) {

        // Make sure both users actually exist
        var requester = userRepository.findById(request.getRequesterId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Requester not found"));
        var receiver = userRepository.findById(request.getReceiverId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver not found"));

        // Prevent duplicate requests (in either direction)
        friendshipRepository.findBetweenUsers(requester.getId(), receiver.getId()).ifPresent(f -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Friendship already exists"); });

        Friendship friendship = new Friendship();
        friendship.setRequester(requester);
        friendship.setReceiver(receiver);
        // Status defaults to PENDING in the entity — no need to set it explicitly

        return friendshipRepository.save(friendship);
    }

    // PATCH /friends/{id} - accepts a pending friend request
    // The {id} is the friendship record's UUID
    // Only the receiver of the original request should be able to accept it
    // TODO: once Azure Entra ID auth is in place, derive receiverId from the JWT token
    //  rather than requiring it as a query parameter
    @PatchMapping("/{id}")
    public Friendship acceptFriendRequest(
            @PathVariable UUID id,
            @RequestParam UUID receiverId) {

        // Only fetch the friendship if the caller is actually the receiver
        Friendship friendship = friendshipRepository.findByIdAndReceiverId(id, receiverId).orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Friendship not found or you are not the receiver"));

        if (friendship.getStatus() == FriendshipStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Friend request is already accepted");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        return friendshipRepository.save(friendship);
    }
}