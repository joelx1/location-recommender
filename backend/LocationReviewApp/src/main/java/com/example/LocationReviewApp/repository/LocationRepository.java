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
public interface LocationRepository extends JpaRepository<Location, UUID>
{

    // Returns all locations within a given radius of a specified point using longitude & latitude
    // ST_DWithin on geography columns measures in metres
    // "geo" is the actual column name in the database for the PostGIS Point
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
    // Bayesian formula: (C * globalMean + sumOfRatings) / (C + reviewCount)
    //   C = 5 — a location needs roughly 5 reviews before its score is fully trusted
    //   globalMean — average rating across all reviews in the database
    //   Locations with zero reviews score at the global mean, sitting mid-pack rather than top or bottom
    //   COALESCE(AVG(reviews), 3.0) — if the database has no reviews at all, default global mean to 3.0
    //
    // SQL notes:
    //   WITH global_avg — CTE that computes the global mean once and shares it across all rows
    //   LEFT JOIN reviews — keeps locations with zero reviews in the results (INNER JOIN would drop them)
    //   ST_Y / ST_X — extracts latitude and longitude from the PostGIS Point so the frontend gets plain numbers
    //   Quoted aliases e.g. "reviewCount" — PostgreSQL lowercases unquoted identifiers, breaking projection
    //   matching; quotes preserve camelCase so Spring can match them to the LocationSummary getter names
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

    // Searches locations by name or category (case-insensitive) and returns them with review stats
    //
    // ILIKE = case-insensitive LIKE in PostgreSQL — "bar" matches "Temple Bar Pub", "Barcode" etc.
    // '%' || :term || '%' = contains match; || is PostgreSQL's string concat operator
    //   (we can't write LIKE '%:term%' — Spring would treat :term as a literal, not a parameter)
    // OR across name and category — searching "cafe" finds cafe-category locations even if
    //   the word doesn't appear in their name
    // Returns LocationSummary so the frontend gets review_count and average_rating in the same call
    // Results are ordered by Bayesian score so the best-reviewed matches appear first
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

    // Returns a single location by ID with review stats (review count, average rating, Bayesian score)
    // Used by GET /locations/{id}/summary so the Place Details screen gets everything in one call
    // Returns Optional so the controller can throw a 404 if the ID doesn't exist
    // CAST(:id AS uuid) — required because native queries pass parameters as strings;
    //   without the cast, PostgreSQL can't match the string to the uuid column type
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
}