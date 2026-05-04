package com.example.LocationReviewApp.controller;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.example.LocationReviewApp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @MockBean
    JwtDecoder jwtDecoder;

    @MockBean
    BlobServiceClient blobServiceClient;

    @MockBean
    BlobContainerClient blobContainerClient;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanUp() {
        // Remove test user before each test so they don't interfere with each other
        userRepository.findByAzureOid("test-oid-123")
                .ifPresent(userRepository::delete);
    }

    @Test
    void postAuthMe_firstLogin_createsAndReturnsUser() throws Exception {
        // jwt() from spring-security-test creates a fake validated JWT.
        // No real Entra connection needed — we're testing our logic, not Azure's.
        mockMvc.perform(post("/auth/me")
                .with(jwt().jwt(builder -> builder
                        .subject("test-oid-123")
                        .claim("email", "testuser@example.com")
                        .claim("given_name", "Test")
                        .claim("family_name", "User"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("Test User"))
                .andExpect(jsonPath("$.email").value("testuser@example.com"))
                .andExpect(jsonPath("$.username").value("Test User"));
    }

    @Test
    void postAuthMe_secondLogin_returnsExistingUser_notDuplicate() throws Exception {
        // First login — creates the user
        mockMvc.perform(post("/auth/me")
                .with(jwt().jwt(builder -> builder
                        .subject("test-oid-123")
                        .claim("email", "testuser@example.com")
                        .claim("given_name", "Test")
                        .claim("family_name", "User"))))
                .andExpect(status().isOk());

        // Second login with same OID — must return same user, not create a second row
        mockMvc.perform(post("/auth/me")
                .with(jwt().jwt(builder -> builder
                        .subject("test-oid-123")
                        .claim("email", "testuser@example.com")
                        .claim("given_name", "Test")
                        .claim("family_name", "User"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("Test User"));

        long count = userRepository.findAll().stream()
                .filter(u -> "test-oid-123".equals(u.getAzureOid()))
                .count();
        assert count == 1 : "Expected exactly 1 user row — got " + count;
    }

    @Test
    void postAuthMe_withoutToken_returns401() throws Exception {
        mockMvc.perform(post("/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
