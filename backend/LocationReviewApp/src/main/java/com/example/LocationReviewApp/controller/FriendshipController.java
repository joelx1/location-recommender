package com.example.LocationReviewApp.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.LocationReviewApp.dto.FriendRequest;
import com.example.LocationReviewApp.model.Friendship;
import com.example.LocationReviewApp.model.FriendshipStatus;
import com.example.LocationReviewApp.model.User;
import com.example.LocationReviewApp.repository.FriendshipRepository;
import com.example.LocationReviewApp.repository.UserRepository;

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

    // POST /friends - sends a friend request from the authenticated user to another user
    // Body: { "receiverId": "uuid" }
    // The requester is derived from the JWT — callers cannot send requests as someone else.
    @PostMapping
    public Friendship sendFriendRequest(@RequestBody FriendRequest request,
                                        @AuthenticationPrincipal Jwt jwt) {

        // Derive the requester from the JWT — never trust the request body for identity
        User requester = userRepository.findByAzureOid(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found — call /auth/me first"));

        var receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receiver not found"));

        if (requester.getId().equals(receiver.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot send a friend request to yourself");
        }

        // Prevent duplicate requests (in either direction)
        friendshipRepository.findBetweenUsers(requester.getId(), receiver.getId())
                .ifPresent(f -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Friendship already exists"); });

        Friendship friendship = new Friendship();
        friendship.setRequester(requester);
        friendship.setReceiver(receiver);

        // Temporary use for testing
        friendship.setStatus(FriendshipStatus.ACCEPTED);
        // Status defaults to PENDING in the entity — no need to set it explicitly

        return friendshipRepository.save(friendship);
    }

    // PATCH /friends/{id} - accepts a pending friend request
    // The {id} is the friendship record's UUID.
    // The receiver is derived from the JWT — the caller must be the intended receiver.
    @PatchMapping("/{id}")
    public Friendship acceptFriendRequest(@PathVariable UUID id,
                                          @AuthenticationPrincipal Jwt jwt) {

        // Derive the receiver from the JWT — never trust a query parameter for identity
        User receiver = userRepository.findByAzureOid(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found — call /auth/me first"));

        // Only fetch the friendship if the caller is actually the receiver
        Friendship friendship = friendshipRepository.findByIdAndReceiverId(id, receiver.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Friendship not found or you are not the receiver"));

        if (friendship.getStatus() == FriendshipStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Friend request is already accepted");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        return friendshipRepository.save(friendship);
    }
}