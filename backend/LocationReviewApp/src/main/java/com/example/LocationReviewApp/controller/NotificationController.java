package com.example.LocationReviewApp.controller;

import com.example.LocationReviewApp.dto.LocationUpdateRequest;
import com.example.LocationReviewApp.model.User;
import com.example.LocationReviewApp.repository.UserRepository;
import com.example.LocationReviewApp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    // POST /notifications/check
    // Called by the frontend on significant movement.
    // Runs the proximity check and sends push notifications if qualifying
    // locations are found nearby. Coordinates are never persisted.
    @PostMapping("/check")
    public ResponseEntity<Void> checkNotifications(
            @RequestBody LocationUpdateRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        User user = userRepository.findByAzureOid(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Authenticated user not found — call /auth/me first"));

        notificationService.checkAndNotify(
                user,
                request.getLatitude(),
                request.getLongitude());

        return ResponseEntity.ok().build();
    }
}