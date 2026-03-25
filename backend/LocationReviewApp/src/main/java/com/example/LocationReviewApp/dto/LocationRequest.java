package com.example.LocationReviewApp.dto;

import java.util.UUID;

// Represents the data received when creating a new location
// Uses plain lat/lng doubles instead of a PostGIS Point
// so callers don't need to know about PostGIS internals
public class LocationRequest {

    private String name;
    private String category;
    private String address;

    // Plain latitude and longitude from the caller
    // These get converted to a PostGIS Point in the controller
    private double latitude;
    private double longitude;

    // Just the user's ID, not the whole User object
    private UUID createdById;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }

    public UUID getCreatedById() { return createdById; }
    public void setCreatedById(UUID createdById) { this.createdById = createdById; }
}