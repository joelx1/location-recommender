package com.example.LocationReviewApp.dto;

import com.example.LocationReviewApp.model.Review;
import java.time.Instant;
import java.util.UUID;

// Flat projection of a Review — returned by GET /users/{id}/feed.
//
// Why this exists: Review.java has nested User and Location objects. Returning the raw
// entity serialises the full user object (including email) and the full location object
// (including raw PostGIS coordinates) inside every feed item — more data than the frontend
// needs, and the wrong shape for what the frontend integration doc expects.
//
// This DTO flattens everything the feed card needs into one level:
//   - who wrote it (username, profilePic)
//   - what they reviewed (locationId, locationName)
//   - the review itself (rating, body, photoUrl, createdAt)
//
// BREAKING CHANGE: Switching the feed endpoint from List<Review> to List<FeedItemDto>
// changes the response shape entirely. Coordinate with the frontend team before merging.
public class FeedItem {

    private UUID id;

    // Author fields — flattened from review.user
    private UUID userId;
    private String username;
    private String profilePic;

    // Location fields — flattened from review.location
    private UUID locationId;
    private String locationName;
    private String locationCategory;
    private String locationAddress;

    // Review fields
    private int rating;
    private String body;
    private String photoUrl;
    private Instant createdAt;

    public FeedItem() {}

    // Factory method — maps from a fully-loaded Review entity.
    // Assumes review.getUser() and review.getLocation() are not null (enforced by DB constraints).
    public static FeedItem from(Review review) {
        FeedItem dto = new FeedItem();
        dto.id = review.getId();

        dto.userId = review.getUser().getId();
        dto.username = review.getUser().getUsername();
        dto.profilePic = review.getUser().getProfilePic();

        dto.locationId = review.getLocation().getId();
        dto.locationName = review.getLocation().getName();
        dto.locationCategory = review.getLocation().getCategory();
        dto.locationAddress = review.getLocation().getAddress();

        dto.rating = review.getRating();
        dto.body = review.getBody();
        dto.photoUrl = review.getPhotoUrl();
        dto.createdAt = review.getCreatedAt();

        return dto;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getProfilePic() { return profilePic; }
    public UUID getLocationId() { return locationId; }
    public String getLocationName() { return locationName; }
    public String getLocationCategory() { return locationCategory; }
    public String getLocationAddress() { return locationAddress; }
    public int getRating() { return rating; }
    public String getBody() { return body; }
    public String getPhotoUrl() { return photoUrl; }
    public Instant getCreatedAt() { return createdAt; }
}