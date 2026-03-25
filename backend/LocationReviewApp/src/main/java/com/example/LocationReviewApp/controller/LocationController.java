package com.example.LocationReviewApp.controller;

import com.example.LocationReviewApp.dto.LocationRequest;
import com.example.LocationReviewApp.model.Location;
import com.example.LocationReviewApp.model.Review;
import com.example.LocationReviewApp.repository.LocationRepository;
import com.example.LocationReviewApp.repository.ReviewRepository;
import com.example.LocationReviewApp.repository.UserRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

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
    @GetMapping("/{id}")
    public Location getLocationById(@PathVariable UUID id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found"));
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
}