package com.example.LocationReviewApp.controller;

import com.example.LocationReviewApp.dto.FriendRequest;
import com.example.LocationReviewApp.model.Friendship;
import com.example.LocationReviewApp.model.FriendshipStatus;
import com.example.LocationReviewApp.model.User;
import com.example.LocationReviewApp.repository.FriendshipRepository;
import com.example.LocationReviewApp.repository.UserRepository;
import com.example.LocationReviewApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

// Handles all API requests related to friendships.
// Base URL for all endpoints in this controller: /friends
@RestController
@RequestMapping("/friends")
public class FriendshipController {

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    // POST /friends — adds a friend, creating the relationship as ACCEPTED immediately.
    //
    // MVP decision: no pending/request flow. Tapping "Add Friend" on the frontend
    // connects both users instantly. Both users appear in each other's feed and friend
    // lists straight away.
    //
    // The requester is always derived from the JWT — callers cannot add friends on
    // behalf of someone else.
    //
    // Body: { "receiverId": "uuid" }
    @PostMapping
    public Friendship sendFriendRequest(@RequestBody FriendRequest request,
                                        @AuthenticationPrincipal Jwt jwt) {

        // Derive the requester from the JWT — never trust the request body for identity
        User requester = userService.findFromJwt(jwt)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Authenticated user not found — call /auth/me first"));

        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (requester.getId().equals(receiver.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "You cannot add yourself as a friend");
        }

        // Prevent duplicates in either direction before creating
        friendshipRepository.findBetweenUsers(requester.getId(), receiver.getId())
                .ifPresent(f -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT, "Friendship already exists");
                });

        Friendship friendship = new Friendship();
        friendship.setRequester(requester);
        friendship.setReceiver(receiver);
        // Explicitly set ACCEPTED even though it is now the entity default,
        // so the intent is clear to anyone reading this code.
        friendship.setStatus(FriendshipStatus.ACCEPTED);

        return friendshipRepository.save(friendship);
    }

    // PATCH /friends/{id} — kept for backwards compatibility only.
    //
    // This endpoint was used to accept a pending friend request in the old request/accept
    // flow. It is no longer needed now that POST /friends creates ACCEPTED directly.
    // It can be removed once the frontend confirms it is no longer calling this endpoint.
    @PatchMapping("/{id}")
    public Friendship acceptFriendRequest(@PathVariable UUID id,
                                          @AuthenticationPrincipal Jwt jwt) {

        // Derive the receiver from the JWT — never trust a query parameter for identity
        User receiver = userService.findFromJwt(jwt)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Authenticated user not found — call /auth/me first"));

        Friendship friendship = friendshipRepository.findByIdAndReceiverId(id, receiver.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Friendship not found or you are not the receiver"));

        if (friendship.getStatus() == FriendshipStatus.ACCEPTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Friendship is already accepted");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        return friendshipRepository.save(friendship);
    }
}