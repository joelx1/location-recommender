package com.example.LocationReviewApp.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

// Represents the 'locations' table in the database
// A location is a place that can be reviewed (pub, restaurant, etc.)
@Entity
@Table(name = "locations")
public class Location {

    // Unique ID automatically generated for each location
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    // Category of the location e.g. "bar", "restaurant", "cafe"
    @Column(nullable = false)
    private String category;

    private String address;

    // Geographic coordinates for map display and proximity search
    private double latitude;
    private double longitude;

    // Links to the user who added this location
    // ManyToOne = many locations can be created by one user
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

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

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}