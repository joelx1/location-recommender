package com.example.LocationReviewApp.controller;

import com.example.LocationReviewApp.model.User;
import com.example.LocationReviewApp.repository.UserRepository;
import com.example.LocationReviewApp.service.UserService;
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

    @Autowired
    private UserService userService;

    // POST /auth/me
    // The frontend calls this after every login.
    // Returns the existing user if they've logged in before.
    // Creates a new user row if it's their first time — then returns them.
    //
    // @AuthenticationPrincipal Jwt jwt is populated automatically by Spring Security
    // from the validated Bearer token in the request. No manual parsing needed.
    @PostMapping("/me")
    public User getOrCreateUser(@AuthenticationPrincipal Jwt jwt) {
        return userService.findFromJwt(jwt)
                .orElseGet(() -> {
                    User newUser = new User();

                    if (userService.isFirebaseToken(jwt)) {
                        newUser.setUid(jwt.getSubject());
                        String email = jwt.getClaimAsString("email");
                        newUser.setEmail(email != null ? email : jwt.getSubject() + "@placeholder.com");
                        String name = jwt.getClaimAsString("name");
                        String username = (name != null && !name.isBlank())
                                ? name
                                : (email != null ? email.split("@")[0] : jwt.getSubject().substring(0, 8));
                        newUser.setUsername(username);
                    } else {
                        newUser.setAzureOid(jwt.getSubject());
                        String email = jwt.getClaimAsString("email");
                        newUser.setEmail(email != null ? email : jwt.getSubject() + "@placeholder.com");
                        String givenName = jwt.getClaimAsString("given_name");
                        String familyName = jwt.getClaimAsString("family_name");
                        String fallbackUsername = email != null ? email.split("@")[0] : jwt.getSubject().substring(0, 8);
                        String username = (givenName != null || familyName != null)
                                ? ((givenName != null ? givenName : "") + " " + (familyName != null ? familyName : "")).trim()
                                : fallbackUsername;
                        newUser.setUsername(username);
                    }

                    return userRepository.save(newUser);
                });
    }
}
