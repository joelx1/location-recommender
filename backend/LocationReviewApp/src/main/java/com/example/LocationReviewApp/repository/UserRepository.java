package com.example.LocationReviewApp.repository;

import com.example.LocationReviewApp.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    // Used by AuthController to look up the DB user from the JWT subject claim
    Optional<User> findByAzureOid(String azureOid);

    // Case-insensitive username search for GET /users/search.
    // Matches anywhere in the username so "ack" finds "jack".
    // Excludes the calling user so they don't appear in their own results.
    //
    // Uses Pageable rather than JPQL LIMIT — LIMIT in JPQL is non-standard and
    // not supported in all Hibernate versions. The controller passes
    // PageRequest.of(0, 20) to cap results at 20.
    @Query("SELECT u FROM User u " +
            "WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :q, '%')) " +
            "AND u.id <> :excludeId " +
            "ORDER BY u.username ASC")
    List<User> searchByUsername(
            @Param("q") String q,
            @Param("excludeId") UUID excludeId,
            Pageable pageable);
}