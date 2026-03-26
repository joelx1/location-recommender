package com.example.LocationReviewApp.controller;

import com.example.LocationReviewApp.config.JwtUtil;
import com.example.LocationReviewApp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Handles login requests and hands back a JWT token
// This is the only public endpoint in the app - everything else requires a token
// TODO: this gets retired when we switch to Azure Entra ID (Microsoft handles login instead)

@RestController
@RequestMapping("/auth")
public class AuthController
{
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AuthController(JwtUtil jwtUtil, UserRepository userRepository)
    {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    // POST /auth/login
    // Send { "username": "felix" } and get back { "token": "eyJ..." }
    // NOTE: no password check yet - User doesn't have a password field at this stage
    // That gets added properly when Entra ID takes over
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body)
    {
        String username = body.get("username");

        // Check if this username actually exists in our database
        boolean exists = userRepository.findByUsername(username).isPresent();

        if (!exists)
        {
            // Return 401 if we don't recognise the username
            return ResponseEntity.status(401).body(Map.of("error", "User not found"));
        }

        // Username exists - generate and return a token
        String token = jwtUtil.generateToken(username);
        return ResponseEntity.ok(Map.of("token", token));
    }
}