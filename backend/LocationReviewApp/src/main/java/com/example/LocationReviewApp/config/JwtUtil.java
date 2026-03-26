package com.example.LocationReviewApp.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

// This is our token factory - it creates and reads JWT tokens
// Think of it like a wax seal, only we can make it but anyone can verify it's genuine
// TODO: this whole class gets deleted when we switch to Azure Entra ID

@Component
public class JwtUtil 
{
    private final SecretKey key;
    private final long expirationMs;

    // Pulls the secret and expiry time from application.properties when the app starts
    public JwtUtil
    (
        @Value("${app.jwt.secret}") String secret,
        @Value("${app.jwt.expiration-ms}") long expirationMs
    ) 
    {
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMs = expirationMs;
    }

    // Creates a signed token for a given username
    // The token contains who you are and when it expires
    public String generateToken(String username) 
    {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    // Reads the username back out of a token
    // Used by JwtFilter to figure out who is making the request
    public String extractUsername(String token) 
    {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Checks if a token is valid and not expired
    // Returns false if the token has been tampered with or has expired
    public boolean isValid(String token) 
    {
        try 
        {
            extractUsername(token);
            return true;
        } 
        catch (JwtException e) 
        {
            return false;
        }
    }
}