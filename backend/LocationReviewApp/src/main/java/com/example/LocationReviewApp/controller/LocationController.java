package com.example.LocationReviewApp.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.LocationReviewApp.dto.LocationRequest;
import com.example.LocationReviewApp.dto.LocationSummary;
import com.example.LocationReviewApp.model.FriendshipStatus;
import com.example.LocationReviewApp.model.Location;
import com.example.LocationReviewApp.model.Review;
import com.example.LocationReviewApp.model.User;
import com.example.LocationReviewApp.repository.LocationRepository;
import com.example.LocationReviewApp.repository.ReviewRepository;
import com.example.LocationReviewApp.repository.UserRepository;

@RestController
@RequestMapping("/locations")
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    // GET /locations — returns all locations in the database
    @GetMapping
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    // GET /locations/{id} — returns a single location by its UUID
    @GetMapping("/{id}")
    public Location getLocationById(@PathVariable UUID id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Location not found"));
    }

    // GET /locations/{id}/summary — returns a location with review stats
    // Use this instead of /{id} when you need reviewCount, averageRating, or bayesianScore
    @GetMapping("/{id}/summary")
    public LocationSummary getLocationSummary(@PathVariable UUID id) {
        return locationRepository.findSummaryById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Location not found"));
    }

    // GET /locations/{id}/social-summary?userId={currentUserId}
    // Returns how many of the current user's accepted friends have reviewed this location,
    // plus their usernames — used by the Place Details screen.
    //
    // Response shape:
    //   { "friendsReviewedCount": 2, "friendReviewerNames": ["Alice", "Bob"] }
    @GetMapping("/{id}/social-summary")
    public Map<String, Object> getSocialSummary(
            @PathVariable UUID id,
            @RequestParam UUID userId) {

        if (!locationRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found");
        }
        userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        List<User> friends = reviewRepository.findFriendsWhoReviewedLocation(
                id, userId, FriendshipStatus.ACCEPTED);

        List<String> names = friends.stream()
                .map(User::getUsername)
                .collect(Collectors.toList());

        return Map.of(
                "friendsReviewedCount", (long) friends.size(),
                "friendReviewerNames", names
        );
    }

    // POST /locations — creates a new location from the request body.
    // The creator is derived from the JWT — callers cannot create locations on behalf
    // of someone else.
    //
    // Google Places deduplication:
    // If googlePlacesId is provided in the request body, we check whether a location
    // with that ID already exists in the database before creating a new row.
    // If a match is found, the existing location is returned immediately (200 OK).
    // This prevents duplicate rows when multiple users select the same Google place.
    // If googlePlacesId is absent (manual entry), the check is skipped and the
    // location is created normally.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Location createLocation(@RequestBody LocationRequest request,
                                   @AuthenticationPrincipal Jwt jwt) {

        // Deduplication check — only runs when a Google Places ID was provided
        if (request.getGooglePlacesId() != null && !request.getGooglePlacesId().isBlank()) {
            Optional<Location> existing = locationRepository.findByGooglePlacesId(
                    request.getGooglePlacesId());
            if (existing.isPresent()) {
                // Return the existing location rather than creating a duplicate.
                // 200 rather than 201 — nothing was created.
                return existing.get();
            }
        }

        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        Point point = gf.createPoint(
                new Coordinate(request.getLongitude(), request.getLatitude()));

        // Derive the creator from the JWT — never trust the request body for identity
        User creator = userRepository.findByAzureOid(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Authenticated user not found — call /auth/me first"));

        Location location = new Location();
        location.setName(request.getName());
        location.setCategory(request.getCategory());
        location.setAddress(request.getAddress());
        location.setCoordinates(point);
        location.setGooglePlacesId(request.getGooglePlacesId());
        location.setCreatedBy(creator);

        return locationRepository.save(location);
    }

    // DELETE /locations/{id} — deletes a location by its UUID
    // Only the user who created the location can delete it (enforced via JWT).
    // Locations created before auth was added have no createdBy — treated as unowned.
    @DeleteMapping("/{id}")
    public void deleteLocation(@PathVariable UUID id,
                               @AuthenticationPrincipal Jwt jwt) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Location not found"));

        if (location.getCreatedBy() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You can only delete your own locations");
        }

        User requester = userRepository.findByAzureOid(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Authenticated user not found — call /auth/me first"));

        if (!requester.getId().equals(location.getCreatedBy().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You can only delete your own locations");
        }

        locationRepository.deleteById(id);
    }

    // GET /locations/{id}/reviews — returns all reviews for a location
    @GetMapping("/{id}/reviews")
    public List<Review> getReviewsByLocation(@PathVariable UUID id) {
        return reviewRepository.findByLocationId(id);
    }

    // GET /locations/nearby?lat=53.34&lng=-6.26&km=2
    // Returns all locations within the given radius of the provided coordinates
    @GetMapping("/nearby")
    public List<Location> getNearbyLocations(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5") double km) {
        double radiusMetres = km * 1000;
        return locationRepository.findNearby(lat, lng, radiusMetres);
    }

    // GET /locations/nearby/ranked?lat=53.34&lng=-6.26&km=2
    // Returns locations within the given radius, sorted by Bayesian average score (best first)
    @GetMapping("/nearby/ranked")
    public List<LocationSummary> getNearbyRanked(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "5") double km) {
        double radiusMetres = km * 1000;
        return locationRepository.findNearbyRanked(lat, lng, radiusMetres);
    }

    // GET /locations/search?q=temple
    // Searches for locations whose name or category contains the search term (case-insensitive)
    // Returns an empty list for blank queries rather than returning every location
    @GetMapping("/search")
    public List<LocationSummary> searchLocations(@RequestParam String q) {
        if (q == null || q.isBlank()) {
            return List.of();
        }
        return locationRepository.findBySearchTerm(q.trim());
    }
}