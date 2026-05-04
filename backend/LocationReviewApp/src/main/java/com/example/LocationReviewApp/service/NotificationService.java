package com.example.LocationReviewApp.service;

import com.example.LocationReviewApp.model.DeviceToken;
import com.example.LocationReviewApp.model.Location;
import com.example.LocationReviewApp.model.NotificationLog;
import com.example.LocationReviewApp.model.User;
import com.example.LocationReviewApp.repository.DeviceTokenRepository;
import com.example.LocationReviewApp.repository.LocationRepository;
import com.example.LocationReviewApp.repository.NotificationLogRepository;
import com.example.LocationReviewApp.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class NotificationService {

    // Agreed parameters — confirmed 2026-04-17
    private static final double RADIUS_METRES = 250.0;
    private static final int MIN_RATING = 4;
    private static final int COOLDOWN_HOURS = 1;
    private static final int COLD_START_REVIEW_THRESHOLD = 3;

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    @Autowired
    private DeviceTokenRepository deviceTokenRepository;

    @Autowired
    private NotificationLogRepository notificationLogRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    // Called by NotificationController when the frontend sends a location update.
    // Runs the proximity check, sends notifications, cleans up stale tokens,
    // and writes to notification_log for each successful send.
    public void checkAndNotify(User user, double lat, double lng) {

        List<DeviceToken> tokens = deviceTokenRepository.findByUserId(user.getId());

        // No point running the query if the user has no registered devices
        if (tokens.isEmpty()) return;

        // Cold start check — if user has fewer than 3 reviews, skip the
        // category preference filter so they still receive notifications
        long userReviewCount = reviewRepository.countByUserId(user.getId());
        boolean applyPreferenceFilter = userReviewCount >= COLD_START_REVIEW_THRESHOLD;

        // Run the proximity query to find qualifying locations
        List<Object[]> nearbyLocations = applyPreferenceFilter
                ? locationRepository.findNotifiableLocations(
                user.getId(), lat, lng, RADIUS_METRES, MIN_RATING)
                : locationRepository.findNotifiableLocationsNoPreference(
                user.getId(), lat, lng, RADIUS_METRES, MIN_RATING);

        Instant cooldownCutoff = Instant.now().minus(COOLDOWN_HOURS, ChronoUnit.HOURS);

        for (Object[] row : nearbyLocations) {
            UUID locationId = (UUID) row[0];
            String locationName = (String) row[1];
            String reviewedByUsername = (String) row[2];

            // Enforce cooldown — skip if already notified about this location recently
            if (notificationLogRepository.existsRecentNotification(
                    user.getId(), locationId, cooldownCutoff)) {
                continue;
            }

            // Send notification to every device the user has registered
            for (DeviceToken deviceToken : tokens) {
                boolean success = sendExpoPushNotification(
                        deviceToken.getToken(),
                        "Friend reviewed a place nearby",
                        reviewedByUsername + " rated " + locationName + " 4★ or above — you're nearby!");

                if (!success) {
                    // Token is stale — clean it up
                    deviceTokenRepository.deleteByToken(deviceToken.getToken());
                } else {
                    // Log the notification so the cooldown works next time
                    NotificationLog log = new NotificationLog();
                    log.setUser(user);
                    Location location = new Location();
                    location.setId(locationId);
                    log.setLocation(location);
                    notificationLogRepository.save(log);
                }
            }
        }
    }

    // Sends a single push notification via the Expo Push API.
    // Returns true if send succeeded, false if the token is stale (DeviceNotRegistered).
    // Uses Java's built-in HttpClient — no extra dependencies needed.
    private boolean sendExpoPushNotification(String token, String title, String body) {
        try {
            String json = new ObjectMapper().writeValueAsString(
                    Map.of("to", token, "title", title, "body", body));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(EXPO_PUSH_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofString());

            // Check for DeviceNotRegistered in the response body
            return !response.body().contains("DeviceNotRegistered");

        } catch (Exception e) {
            // Log but don't crash — notification failure should never break the app
            System.err.println("Failed to send push notification to token " + token + ": " + e.getMessage());
            return false;
        }
    }
}