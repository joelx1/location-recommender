package com.example.LocationReviewApp.model;

import jakarta.persistence.*;
import org.locationtech.jts.geom.Point;
import java.time.Instant;
import java.util.UUID;

// Represents the 'locations' table in the database.
// A location is a place that can be reviewed (pub, restaurant, etc.)
@Entity
@Table(name = "locations")
public class Location {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    private String address;

    // Geographic coordinates stored as a PostGIS Point for map display and proximity search.
    // 4326 = standard GPS coordinate system (used by Google Maps etc.)
    @Column(name = "geo", columnDefinition = "geography(Point, 4326)")
    private Point coordinates;

    // Google Places unique place ID — populated when a location was imported from Google Places.
    // Null for locations created manually inside the app.
    //
    // The UNIQUE constraint (matching the V005 migration column google_place_id TEXT UNIQUE)
    // is the deduplication mechanism: if the frontend sends the same Google place twice,
    // the controller returns the existing row rather than attempting an insert that would
    // fail the constraint.
    @Column(name = "google_place_id", unique = true)
    private String googlePlacesId;

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

    public String getGooglePlacesId() { return googlePlacesId; }
    public void setGooglePlacesId(String googlePlacesId) { this.googlePlacesId = googlePlacesId; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}