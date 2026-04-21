package com.example.LocationReviewApp.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.example.LocationReviewApp.model.Friendship;
import com.example.LocationReviewApp.model.FriendshipStatus;
import com.example.LocationReviewApp.model.Review;
import com.example.LocationReviewApp.model.User;
import com.example.LocationReviewApp.repository.FriendshipRepository;
import com.example.LocationReviewApp.repository.ReviewRepository;
import com.example.LocationReviewApp.repository.UserRepository;
import com.example.LocationReviewApp.service.AzureBlobService;

// Handles all API requests related to users
// Base URL for all endpoints in this controller: /users
@RestController
@RequestMapping("/users")
public class UserController {

    // Injects the UserRepository so we can query the database
    @Autowired
    private UserRepository userRepository;

    // Injects ReviewRepository to fetch reviews written by a user
    @Autowired
    private ReviewRepository reviewRepository;

    // Injects FriendshipRepository to fetch friends and feed
    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private AzureBlobService blobService;

    // GET /users - returns all users in the database
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET /users/{id} - returns a single user by their UUID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    // PATCH /users/{id} - partially updates a user's profile
    // Only fields present in the request body are updated — omitted fields are left unchanged
    // Updatable fields: username, email, bio
    // Note: username and email are unique columns — if the new value is already taken by another
    // user, the database will reject the save.
    @PatchMapping("/{id}")
    public User updateUser(@PathVariable UUID id, @RequestBody User updates,
                           @AuthenticationPrincipal Jwt jwt) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Only the account owner can update their own profile
        if (!user.getAzureOid().equals(jwt.getSubject())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own profile");
        }

        // Only apply a field if it was actually included in the request (non-null)
        if (updates.getUsername() != null) user.setUsername(updates.getUsername());
        if (updates.getEmail() != null)    user.setEmail(updates.getEmail());
        if (updates.getBio() != null)      user.setBio(updates.getBio());

        return userRepository.save(user);
    }

    // DELETE /users/{id} - deletes a user by their UUID
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Only the account owner can delete their own account
        if (!user.getAzureOid().equals(jwt.getSubject())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own account");
        }

        userRepository.deleteById(id);
    }

    // GET /users/{id}/reviews - returns all reviews written by a user
    @GetMapping("/{id}/reviews")
    public List<Review> getReviewsByUser(@PathVariable UUID id) {
        return reviewRepository.findByUserId(id);
    }

    // GET /users/{id}/friends - returns all accepted friends for a user
    // A friendship is bidirectional, so we check both sides and return the *other* user in each pair
    @GetMapping("/{id}/friends")
    public List<User> getFriends(@PathVariable UUID id) {
        List<Friendship> friendships = friendshipRepository.findByUserIdAndStatus(id, FriendshipStatus.ACCEPTED);

        return friendships.stream()
                .map(f -> f.getRequester().getId().equals(id) ? f.getReceiver() : f.getRequester())
                .collect(Collectors.toList());
    }

    // GET /users/{id}/feed - returns reviews posted by a user's friends, newest first
    @GetMapping("/{id}/feed")
    public List<Review> getFeed(@PathVariable UUID id) {
        return reviewRepository.findFeedForUser(id, FriendshipStatus.ACCEPTED);
    }

    // GET /users/{id}/friendship-status?with={otherUserId}
    // Returns the friendship status between two users from the perspective of the logged-in user
    // Used by the Friend Profile screen to determine which button state to show:
    //   NONE     → show "Add Friend"
    //   PENDING  → show "Request Sent" (or "Respond" if they are the receiver)
    //   ACCEPTED → show "Friends"
    // Reuses findBetweenUsers which checks both directions, so order of {id} and ?with= doesn't matter
    @GetMapping("/{id}/friendship-status")
    public Map<String, String> getFriendshipStatus(
            @PathVariable UUID id,
            @RequestParam UUID with) {

        // Verify both users exist before querying — gives a clear 404 rather than just returning NONE
        userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        userRepository.findById(with)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Other user not found"));

        String status = friendshipRepository.findBetweenUsers(id, with)
                .map(f -> f.getStatus().name())  // returns "PENDING" or "ACCEPTED" from the enum
                .orElse("NONE");                 // no record found means no relationship exists

        return Map.of("status", status);
    }

    // POST /users/{id}/profile-picture - uploads a profile picture to Azure Blob Storage
    // stores the returned blob URL in the database
    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(@PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Jwt jwt)
    {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Only the account owner can upload their own profile picture
        if (!user.getAzureOid().equals(jwt.getSubject())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only update your own profile picture"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/"))
        {
            return ResponseEntity.badRequest().body(Map.of("error", "File must be an image"));
        }

        try
        {
            String url = blobService.uploadImage(file);
            user.setProfilePic(url);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("url", url));
        }
        catch (IOException e)
        {
            return ResponseEntity.internalServerError().body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }
}