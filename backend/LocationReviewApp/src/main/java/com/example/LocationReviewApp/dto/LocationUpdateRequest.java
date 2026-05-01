package com.example.LocationReviewApp.dto;

// Represents the coordinates sent by the frontend on significant movement.
// Coordinates are used transiently for the proximity check — never persisted.
public class LocationUpdateRequest {

    private double latitude;
    private double longitude;

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
}