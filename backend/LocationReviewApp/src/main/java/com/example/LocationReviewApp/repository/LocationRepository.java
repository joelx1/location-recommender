package com.example.LocationReviewApp.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.LocationReviewApp.model.Location;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID>
{

    // Returns all locations within a given radius of a specified point using longitude & latitude
    // ST_DWithin on geography columns measures in metres
    @Query(value = """
        SELECT * FROM locations
        WHERE ST_DWithin(
            coordinates,
            CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography),
            :radiusMetres
        )
        """, nativeQuery = true)
        
    List<Location> findNearby(
        @Param("lat") double lat,
        @Param("lng") double lng,
        @Param("radiusMetres") double radiusMetres
    );
}