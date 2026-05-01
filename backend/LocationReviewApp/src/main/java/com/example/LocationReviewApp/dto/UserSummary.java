package com.example.LocationReviewApp.dto;

import com.example.LocationReviewApp.model.User;
import java.util.UUID;

// Slim projection of a User — returned by GET /users/search.
//
// Contains exactly what the Home screen people-search card needs:
//   - id (to navigate to the friend profile screen)
//   - username (primary display text)
//   - profilePic (avatar)
//   - bio (subtitle / secondary text, may be null)
//
// Deliberately excludes email, createdAt, and azureOid.
public class UserSummary {

    private UUID id;
    private String username;
    private String profilePic;
    private String bio;

    public UserSummary() {}

    public static UserSummary from(User user) {
        UserSummary dto = new UserSummary();
        dto.id = user.getId();
        dto.username = user.getUsername();
        dto.profilePic = user.getProfilePic();
        dto.bio = user.getBio();
        return dto;
    }

    public UUID getId() { return id; }
    public String getUsername() { return username; }
    public String getProfilePic() { return profilePic; }
    public String getBio() { return bio; }
}