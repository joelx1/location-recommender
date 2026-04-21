package com.example.LocationReviewApp.config;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    // Prevents Spring from calling out to Azure on startup to fetch OIDC discovery/JWK keys
    @MockBean
    JwtDecoder jwtDecoder;

    // Prevents AzureBlobConfig from trying to connect to Azure Blob Storage
    @MockBean
    BlobServiceClient blobServiceClient;

    @MockBean
    BlobContainerClient blobContainerClient;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void requestWithoutToken_returns401() throws Exception {
        // Before this change, GET /users returned 200 with no token.
        // After this change, it must return 401.
        mockMvc.perform(get("/users"))
               .andExpect(status().isUnauthorized());
    }
}
