package com.example.LocationReviewApp.dto;

import java.util.UUID;

// Projection returned by the GET /locations/nearby/ranked endpoint
// Spring Data automatically maps query result columns to these getters
// by matching the quoted SQL aliases to the method names
public interface LocationSummary {

    UUID getId();
    String getName();
    String getCategory();
    String getAddress();

    // Latitude and longitude extracted from the PostGIS Point column
    // so the frontend receives plain numbers instead of a GeoJSON object
    Double getLatitude();
    Double getLongitude();

    // Number of reviews this location has received
    Integer getReviewCount();

    // Plain average of all ratings (0 if no reviews)
    Double getAverageRating();

    // Bayesian average score — pulls locations with few reviews toward the global mean
    // Formula: (C * globalMean + sumOfRatings) / (C + reviewCount), where C = 5
    // A location needs roughly 5 reviews before its score reflects its actual ratings
    Double getBayesianScore();
}
