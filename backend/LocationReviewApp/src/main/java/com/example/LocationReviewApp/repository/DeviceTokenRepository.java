package com.example.LocationReviewApp.repository;

import com.example.LocationReviewApp.model.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DeviceTokenRepository extends JpaRepository<DeviceToken, UUID> {

    // Returns all tokens registered for a given user
    // Used when sending notifications — we send to every device the user has registered
    List<DeviceToken> findByUserId(UUID userId);

    // Checks whether a specific token is already registered for a user
    // Used on registration to avoid hitting the DB unique constraint
    boolean existsByUserIdAndToken(UUID userId, String token);

    // Deletes a token by its string value
    // Called when Expo returns DeviceNotRegistered — the token is stale and should be removed
    void deleteByToken(String token);
}