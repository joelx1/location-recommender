package com.example.LocationReviewApp.controller;

import com.example.LocationReviewApp.model.User;
import com.example.LocationReviewApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // POST /auth/me
    // The frontend calls this after every login.
    // Returns the existing user if they've logged in before.
    // Creates a new user row if it's their first time — then returns them.
    //
    // @AuthenticationPrincipal Jwt jwt is populated automatically by Spring Security
    // from the validated Bearer token in the request. No manual parsing needed.
    @PostMapping("/me")
    public User getOrCreateUser(@AuthenticationPrincipal Jwt jwt) {
        // 'sub' is the Azure Object ID — unique per Entra user, never changes
        String azureOid = jwt.getSubject();

        return userRepository.findByAzureOid(azureOid)
                .orElseGet(() -> {
                    // First login — provision a new user row
                    User newUser = new User();
                    newUser.setAzureOid(azureOid);

                    // Entra External ID returns email as a single "email" claim
                    String email = jwt.getClaimAsString("email");
                    newUser.setEmail(email != null ? email : azureOid + "@placeholder.com");

                    // Build display name from given_name + family_name claims
                    // Fall back to email prefix if neither is present
                    String givenName = jwt.getClaimAsString("given_name");
                    String familyName = jwt.getClaimAsString("family_name");
                    String fallbackUsername = email != null
                            ? email.split("@")[0]
                            : azureOid.substring(0, 8);
                    String username = (givenName != null || familyName != null)
                            ? ((givenName != null ? givenName : "") + " " + (familyName != null ? familyName : "")).trim()
                            : fallbackUsername;
                    newUser.setUsername(username);

                    return userRepository.save(newUser);
                });
    }
}
