package com.example.LocationReviewApp.dto;

// Represents the data received when creating a new location.
// Uses plain lat/lng doubles instead of a PostGIS Point
// so callers don't need to know about PostGIS internals.
public class LocationRequest {

    private String name;
    private String category;
    private String address;

    // Plain latitude and longitude — converted to a PostGIS Point in the controller
    private double latitude;
    private double longitude;

    // Optional — only present when the location was selected from Google Places.
    // When provided, the controller checks for an existing location with this ID
    // before inserting, returning the existing row instead of creating a duplicate.
    // Null for locations added manually inside the app.
    private String googlePlacesId;

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

    public String getGooglePlacesId() { return googlePlacesId; }
    public void setGooglePlacesId(String googlePlacesId) { this.googlePlacesId = googlePlacesId; }
}