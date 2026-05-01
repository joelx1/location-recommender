package com.example.LocationReviewApp.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.LocationReviewApp.dto.LocationSummary;
import com.example.LocationReviewApp.model.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {

    // Looks up a location by its Google Places ID.
    // Used by POST /locations to check for duplicates before inserting —
    // if a location with this Google place ID already exists, return it
    // instead of creating a second row for the same real-world place.
    Optional<Location> findByGooglePlacesId(String googlePlacesId);

    // Returns all locations within a given radius of a specified point using longitude & latitude
    // ST_DWithin on geography columns measures distance in metres.
    // "geo" is the PostGIS column storing the location as a Point.
    @Query(value = """
        SELECT * FROM locations
        WHERE ST_DWithin(
            geo,
            CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography),
            :radiusMetres
        )
        """, nativeQuery = true)
    List<Location> findNearby(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMetres") double radiusMetres
    );

    // Returns locations within a given radius, ranked by Bayesian average score (best first)
    //
    // Bayesian formula:
    //   (C * globalMean + sumOfRatings) / (C + reviewCount)
    //
    // Where:
    //   C = 5 — smoothing factor; ensures locations need ~5 reviews before ratings fully stabilise
    //   globalMean — average rating across all reviews in the database
    //   Locations with zero reviews default to global mean (so they rank mid-pack rather than extremes)
    //
    // SQL design notes:
    //   WITH global_avg — computes global mean once per query
    //   LEFT JOIN reviews — ensures locations with no reviews are still included
    //   ST_Y / ST_X — extracts latitude and longitude from PostGIS geometry
    //   GROUP BY includes all non-aggregated fields required by SQL standard
    //   ORDER BY "bayesianScore" — sorts highest-quality locations first
    @Query(value = """
        WITH global_avg AS (
            SELECT COALESCE(AVG(rating), 3.0) AS m FROM reviews
        )
        SELECT
            l.id                                                                     AS "id",
            l.name                                                                   AS "name",
            l.category                                                               AS "category",
            l.address                                                                AS "address",
            ST_Y(CAST(l.geo AS geometry))                                            AS "latitude",
            ST_X(CAST(l.geo AS geometry))                                            AS "longitude",
            COUNT(r.id)                                                              AS "reviewCount",
            COALESCE(AVG(r.rating), 0)                                               AS "averageRating",
            (5.0 * ga.m + COALESCE(SUM(r.rating), 0)) / (5.0 + COUNT(r.id))         AS "bayesianScore"
        FROM locations l
        LEFT JOIN reviews r ON r.location_id = l.id
        CROSS JOIN global_avg ga
        WHERE ST_DWithin(
            l.geo,
            CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography),
            :radiusMetres
        )
        GROUP BY l.id, l.name, l.category, l.address, l.geo, ga.m
        ORDER BY "bayesianScore" DESC
        """, nativeQuery = true)
    List<LocationSummary> findNearbyRanked(
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radiusMetres") double radiusMetres
    );

    // Searches locations by name or category (case-insensitive)
    //
    // ILIKE:
    //   PostgreSQL case-insensitive pattern matching
    //
    // '%' || :term || '%':
    //   Creates a "contains" search pattern (e.g. "bar" matches "Temple Bar Pub")
    //
    // SQL behavior notes:
    //   OR between name and category allows broader matching
    //   LEFT JOIN ensures locations with no reviews still appear
    //   Results are ranked using Bayesian score so higher-quality matches appear first
    @Query(value = """
        WITH global_avg AS (
            SELECT COALESCE(AVG(rating), 3.0) AS m FROM reviews
        )
        SELECT
            l.id                                                                     AS "id",
            l.name                                                                   AS "name",
            l.category                                                               AS "category",
            l.address                                                                AS "address",
            ST_Y(CAST(l.geo AS geometry))                                            AS "latitude",
            ST_X(CAST(l.geo AS geometry))                                            AS "longitude",
            COUNT(r.id)                                                              AS "reviewCount",
            COALESCE(AVG(r.rating), 0)                                               AS "averageRating",
            (5.0 * ga.m + COALESCE(SUM(r.rating), 0)) / (5.0 + COUNT(r.id))         AS "bayesianScore"
        FROM locations l
        LEFT JOIN reviews r ON r.location_id = l.id
        CROSS JOIN global_avg ga
        WHERE l.name ILIKE '%' || :term || '%'
           OR l.category ILIKE '%' || :term || '%'
        GROUP BY l.id, l.name, l.category, l.address, l.geo, ga.m
        ORDER BY "bayesianScore" DESC
        """, nativeQuery = true)
    List<LocationSummary> findBySearchTerm(@Param("term") String term);

    // Returns a single location by ID with aggregated review statistics
    //
    // Used for detailed location view (e.g. GET /locations/{id}/summary)
    //
    // Notes:
    //   CAST(:id AS uuid) is required because native queries pass parameters as strings
    //   LEFT JOIN ensures locations with no reviews still return a valid record
    //   Optional return allows controller to safely return 404 if missing
    @Query(value = """
        WITH global_avg AS (
            SELECT COALESCE(AVG(rating), 3.0) AS m FROM reviews
        )
        SELECT
            l.id                                                                     AS "id",
            l.name                                                                   AS "name",
            l.category                                                               AS "category",
            l.address                                                                AS "address",
            ST_Y(CAST(l.geo AS geometry))                                            AS "latitude",
            ST_X(CAST(l.geo AS geometry))                                            AS "longitude",
            COUNT(r.id)                                                              AS "reviewCount",
            COALESCE(AVG(r.rating), 0)                                               AS "averageRating",
            (5.0 * ga.m + COALESCE(SUM(r.rating), 0)) / (5.0 + COUNT(r.id))         AS "bayesianScore"
        FROM locations l
        LEFT JOIN reviews r ON r.location_id = l.id
        CROSS JOIN global_avg ga
        WHERE l.id = CAST(:id AS uuid)
        GROUP BY l.id, l.name, l.category, l.address, l.geo, ga.m
        """, nativeQuery = true)
    Optional<LocationSummary> findSummaryById(@Param("id") UUID id);

    // Returns nearby locations reviewed by accepted friends at 4+ stars,
// filtered to categories the user has also rated 4+ (preference filter applied)
// Used when user has 3 or more reviews
    @Query(value = """
    SELECT DISTINCT l.id, l.name, u.username
    FROM locations l
    JOIN reviews r ON r.location_id = l.id
    JOIN friendships f ON (
        (f.requester_id = :userId AND f.addressee_id = r.user_id)
        OR
        (f.addressee_id = :userId AND f.requester_id = r.user_id)
    )
    JOIN users u ON u.id = r.user_id
    WHERE f.status = 'ACCEPTED'
    AND ST_DWithin(l.geo, CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography), :radius)
    AND r.rating >= :minRating
    AND l.category IN (
        SELECT l2.category FROM reviews r2
        JOIN locations l2 ON l2.id = r2.location_id
        WHERE r2.user_id = :userId AND r2.rating >= :minRating
    )
    """, nativeQuery = true)
    List<Object[]> findNotifiableLocations(
            @Param("userId") UUID userId,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radius") double radius,
            @Param("minRating") int minRating);

    // Same as above but without the category preference filter
// Used during cold start — when user has fewer than 3 reviews
    @Query(value = """
    SELECT DISTINCT l.id, l.name, u.username
    FROM locations l
    JOIN reviews r ON r.location_id = l.id
    JOIN friendships f ON (
        (f.requester_id = :userId AND f.addressee_id = r.user_id)
        OR
        (f.addressee_id = :userId AND f.requester_id = r.user_id)
    )
    JOIN users u ON u.id = r.user_id
    WHERE f.status = 'ACCEPTED'
    AND ST_DWithin(l.geo, CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography), :radius)
    AND r.rating >= :minRating
    """, nativeQuery = true)
    List<Object[]> findNotifiableLocationsNoPreference(
            @Param("userId") UUID userId,
            @Param("lat") double lat,
            @Param("lng") double lng,
            @Param("radius") double radius,
            @Param("minRating") int minRating);
}