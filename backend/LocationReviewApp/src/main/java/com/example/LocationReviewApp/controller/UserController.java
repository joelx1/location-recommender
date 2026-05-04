package com.example.LocationReviewApp.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
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

import com.example.LocationReviewApp.dto.FeedItem;
import com.example.LocationReviewApp.dto.UserSummary;
import com.example.LocationReviewApp.model.DeviceToken;
import com.example.LocationReviewApp.model.Friendship;
import com.example.LocationReviewApp.model.FriendshipStatus;
import com.example.LocationReviewApp.model.Review;
import com.example.LocationReviewApp.model.User;
import com.example.LocationReviewApp.repository.DeviceTokenRepository;
import com.example.LocationReviewApp.repository.FriendshipRepository;
import com.example.LocationReviewApp.repository.ReviewRepository;
import com.example.LocationReviewApp.repository.UserRepository;
import com.example.LocationReviewApp.service.AzureBlobService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Autowired
    private AzureBlobService blobService;

    @Autowired
    private DeviceTokenRepository deviceTokenRepository;

    @Autowired
    private UserService userService;

    // GET /users — returns all users in the database
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // GET /users/search?q=sometext
    // Case-insensitive username search — used by the Home screen people-search.
    // Returns up to 20 results as slim UserSummary objects (id, username, profilePic, bio).
    // Excludes the calling user so they don't appear in their own results.
    // Returns an empty list for blank queries rather than returning all users.
    //
    // IMPORTANT: this route must be declared before /{id} in the file. Spring MVC maps
    // routes top-to-bottom, so if /{id} appears first, the literal string "search" gets
    // passed to UUID.fromString() and throws a 400 before this method is ever reached.
    @GetMapping("/search")
    public List<UserSummary> searchUsers(
            @RequestParam String q,
            @AuthenticationPrincipal Jwt jwt) {

        if (q == null || q.isBlank()) {
            return List.of();
        }

        User caller = userService.findFromJwt(jwt)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Authenticated user not found — call /auth/me first"));

        return userRepository
                .searchByUsername(q.trim(), caller.getId(), PageRequest.of(0, 20))
                .stream()
                .map(UserSummary::from)
                .collect(Collectors.toList());
    }

    // GET /users/{id} — returns a single user by their UUID
    @GetMapping("/{id}")
    public User getUserById(@PathVariable UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
    }

    // PATCH /users/{id} — partially updates a user's profile
    // Only fields present in the request body are updated — omitted fields are left unchanged.
    // Only the account owner can update their own profile (enforced via JWT).
    @PatchMapping("/{id}")
    public User updateUser(@PathVariable UUID id,
                           @RequestBody User updates,
                           @AuthenticationPrincipal Jwt jwt) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        User requester = userService.findFromJwt(jwt)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Authenticated user not found — call /auth/me first"));

        if (!requester.getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You can only update your own profile");
        }

        if (updates.getUsername() != null) user.setUsername(updates.getUsername());
        if (updates.getEmail() != null)    user.setEmail(updates.getEmail());
        if (updates.getBio() != null)      user.setBio(updates.getBio());

        return userRepository.save(user);
    }

    // DELETE /users/{id} — deletes a user by their UUID
    // Only the account owner can delete their own account (enforced via JWT).
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable UUID id,
                           @AuthenticationPrincipal Jwt jwt) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        User requester = userService.findFromJwt(jwt)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Authenticated user not found — call /auth/me first"));

        if (!requester.getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You can only delete your own account");
        }

        userRepository.deleteById(id);
    }

    // GET /users/{id}/reviews — returns all reviews written by a user
    @GetMapping("/{id}/reviews")
    public List<Review> getReviewsByUser(@PathVariable UUID id) {
        return reviewRepository.findByUserId(id);
    }

    // GET /users/{id}/friends — returns all accepted friends for a user
    // Checks both directions of the friendship row (user may be requester or receiver).
    @GetMapping("/{id}/friends")
    public List<User> getFriends(@PathVariable UUID id) {
        List<Friendship> friendships = friendshipRepository
                .findByUserIdAndStatus(id, FriendshipStatus.ACCEPTED);

        return friendships.stream()
                .map(f -> f.getRequester().getId().equals(id)
                        ? f.getReceiver()
                        : f.getRequester())
                .collect(Collectors.toList());
    }

    // GET /users/{id}/feed — returns reviews posted by the user's friends, newest first.
    //
    // Returns List<FeedItem> — a flat shape with all fields the feed card needs.
    // This is a breaking change from the previous List<Review> response which returned
    // deeply nested user and location objects.
    //
    // New shape per item:
    //   id, userId, username, profilePic,
    //   locationId, locationName, locationCategory, locationAddress,
    //   rating, body, photoUrl, createdAt
    @GetMapping("/{id}/feed")
    public List<FeedItem> getFeed(@PathVariable UUID id) {
        return reviewRepository.findFeedForUser(id, FriendshipStatus.ACCEPTED)
                .stream()
                .map(FeedItem::from)
                .collect(Collectors.toList());
    }

    // GET /users/{id}/friendship-status?with={otherUserId}
    // Returns the friendship status between two users.
    // Possible values: "NONE", "ACCEPTED"
    // (PENDING no longer occurs in normal flow — kept in case any legacy records exist)
    @GetMapping("/{id}/friendship-status")
    public Map<String, String> getFriendshipStatus(
            @PathVariable UUID id,
            @RequestParam UUID with) {

        userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));
        userRepository.findById(with)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Other user not found"));

        String status = friendshipRepository.findBetweenUsers(id, with)
                .map(f -> f.getStatus().name())
                .orElse("NONE");

        return Map.of("status", status);
    }

    // POST /users/{id}/profile-picture — uploads a profile picture to Azure Blob Storage.
    // Only the account owner can upload their own profile picture (enforced via JWT).
    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Jwt jwt) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        User requester = userService.findFromJwt(jwt)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Authenticated user not found — call /auth/me first"));

        if (!requester.getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only update your own profile picture"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File must be an image"));
        }

        try {
            String url = blobService.uploadImage(file);
            user.setProfilePic(url);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("url", url));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    // POST /users/{id}/device-token — registers an Expo push token for a user.
    // Called by the app on launch after the user grants notification permissions.
    // Returns 200 if the token is already registered, 201 if newly added.
    // The caller must be the account owner (enforced via JWT).
    @PostMapping("/{id}/device-token")
    public ResponseEntity<Void> registerDeviceToken(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Jwt jwt) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        User requester = userService.findFromJwt(jwt)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Authenticated user not found — call /auth/me first"));

        if (!requester.getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only register tokens for your own account");
        }

        String token = body.get("token");
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Token must not be blank");
        }

        // If already registered, return 200 — nothing to do
        if (deviceTokenRepository.existsByUserIdAndToken(id, token)) {
            return ResponseEntity.ok().build();
        }

        DeviceToken deviceToken = new DeviceToken();
        deviceToken.setUser(user);
        deviceToken.setToken(token);
        deviceTokenRepository.save(deviceToken);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
