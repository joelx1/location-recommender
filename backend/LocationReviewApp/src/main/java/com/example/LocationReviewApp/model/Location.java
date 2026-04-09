package com.example.LocationReviewApp.model;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;
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

    // Geographic coordinates stored as a PostGIS Point for map display and proximity search
    // 4326 = standard GPS coordinate system (used by Google Maps etc.)
    // Column is named "geo" in the database — mapped explicitly to avoid mismatch
    @Column(name = "geo", columnDefinition = "geography(Point, 4326)")
    private Point coordinates;

    // Links to the user who added this location
    // ManyToOne = many locations can be created by one user
    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Point getCoordinates() { return coordinates; }
    public void setCoordinates(Point coordinates) { this.coordinates = coordinates; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}