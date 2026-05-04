package com.example.LocationReviewApp.repository;

import com.example.LocationReviewApp.model.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {

    // Checks whether a user has already been notified about a specific location
    // within the last hour — used to enforce the 1 hour cooldown before sending.
    // Returns true if a notification was already sent and should be skipped.
    @Query("SELECT COUNT(n) > 0 FROM NotificationLog n " +
            "WHERE n.user.id = :userId " +
            "AND n.location.id = :locationId " +
            "AND n.notifiedAt > :cutoff")
    boolean existsRecentNotification(
            @Param("userId") UUID userId,
            @Param("locationId") UUID locationId,
            @Param("cutoff") java.time.Instant cutoff);
}