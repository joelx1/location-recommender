package com.example.LocationReviewApp.controller;

import com.example.LocationReviewApp.model.Location;
import com.example.LocationReviewApp.repository.LocationRepository;
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
    @PostMapping
    public Location createLocation(@RequestBody Location location) {
        return locationRepository.save(location);
    }

    // DELETE /locations/{id} - deletes a location by its UUID
    @DeleteMapping("/{id}")
    public void deleteLocation(@PathVariable UUID id) {
        locationRepository.deleteById(id);
    }
}