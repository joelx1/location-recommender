package com.example.LocationReviewApp.service;

import com.example.LocationReviewApp.model.User;
import com.example.LocationReviewApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private static final String FIREBASE_ISSUER_PREFIX = "https://securetoken.google.com/";

    @Autowired
    private UserRepository userRepository;

    public Optional<User> findFromJwt(Jwt jwt) {
        if (isFirebaseToken(jwt)) {
            return userRepository.findByUid(jwt.getSubject());
        }
        return userRepository.findByAzureOid(jwt.getSubject());
    }

    public boolean isFirebaseToken(Jwt jwt) {
        return jwt.getIssuer() != null &&
               jwt.getIssuer().toString().startsWith(FIREBASE_ISSUER_PREFIX);
    }
}
