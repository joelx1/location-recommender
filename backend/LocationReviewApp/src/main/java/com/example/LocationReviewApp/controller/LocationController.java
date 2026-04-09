package com.example.LocationReviewApp.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.LocationReviewApp.dto.LocationRequest;
import com.example.LocationReviewApp.dto.LocationSummary;
import com.example.LocationReviewApp.model.FriendshipStatus;
import com.example.LocationReviewApp.model.Location;
import com.example.LocationReviewApp.model.Review;
import com.example.LocationReviewApp.repository.LocationRepository;
import com.example.LocationReviewApp.repository.ReviewRepository;
import com.example.LocationReviewApp.repository.UserRepository;

// Handles all API requests related to locations
// Base URL for all endpoints in this controller: /locations
@RestController
@RequestMapping("/locations")
public class LocationController {

    // Injects the LocationRepository so we can query the database
    @Autowired
    private LocationRepository locationRepository;

    // Injects ReviewRepository to fetch reviews for a location
    @Autowired
    private ReviewRepository reviewRepository;

    // Injects UserRepository to look up the user who created a location
    @Autowired
    private UserRepository userRepository;

    // GET /locations - returns all locations in the database
    @GetMapping
    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    // GET /locations/{id} - returns a single location by its UUID
    // Returns the full Location entity including coordinates as GeoJSON
    @GetMapping("/{id}")
    public Location getLocationById(@PathVariable UUID id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));
    }

    // GET /locations/{id}/summary - returns a location with review stats
    // Use this instead of /{id} when you need reviewCount, averageRating, or bayesianScore
    // e.g. the Place Details screen — saves making a second call to /reviews
    // Note: coordinates are returned as flat latitude/longitude numbers rather than GeoJSON
    @GetMapping("/{id}/summary")
    public LocationSummary getLocationSummary(@PathVariable UUID id) {
        return locationRepository.findSummaryById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found"));
    }

    // GET /locations/{id}/social-summary?userId={currentUserId}
    // Returns how many of the current user's accepted friends have reviewed this location
    // Used by the Place Details screen to show e.g. "3 of your friends have been here"
    // Returns 0 if the location exists but none of the user's friends have reviewed it
    @GetMapping("/{id}/social-summary")
    public Map<String, Long> getSocialSummary(
            @PathVariable UUID id,
            @RequestParam UUID userId) {

        // Verify both the location and the user exist before querying
        if (!locationRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Location not found");
        }
        userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        long count = reviewRepository.countFriendsReviewedLocation(id, userId, FriendshipStatus.ACCEPTED);
        return Map.of("friendsReviewedCount", count);
    }

    // POST /locations - creates a new location from the request body
    // Accepts plain lat/lng and converts to a PostGIS Point
    @PostMapping
    public Location createLocation(@RequestBody LocationRequest request) {
        GeometryFactory gf = new GeometryFactory(new PrecisionModel(), 4326);
        Point point = gf.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));

        Location location = new Location();
        location.setName(request.getName());
        location.setCategory(request.getCategory());
        location.setAddress(request.getAddress());
        location.setCoordinates(point);

        if (request.getCreatedById() != null) {
            userRepository.findById(request.getCreatedById())
                    .ifPresent(location::setCreatedBy);
        }

        return locationRepository.save(location);
    }

    // DELETE /locations/{id} - deletes a location by its UUID
    @DeleteMapping("/{id}")
    public void deleteLocation(@PathVariable UUID id) {
        locationRepository.deleteById(id);
    }

    // GET /locations/{id}/reviews - returns all reviews for a location
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
    // Each result includes: id, name, category, address, latitude, longitude,
    // reviewCount, averageRating, and bayesianScore
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
    // Returns the same shape as /nearby/ranked — includes review count, average rating, and lat/lng
    // Results are ordered by Bayesian score so the best-reviewed matches appear first
    // Returns an empty list for blank queries rather than returning every location
    @GetMapping("/search")
    public List<LocationSummary> searchLocations(@RequestParam String q) {
        if (q == null || q.isBlank()) {
            return List.of();
        }
        return locationRepository.findBySearchTerm(q.trim());
    }
}