package com.example.LocationReviewApp;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@SpringBootTest
class ApplicationTests {

    @MockBean
    JwtDecoder jwtDecoder;

    @MockBean
    BlobServiceClient blobServiceClient;

    @MockBean
    BlobContainerClient blobContainerClient;

    @Test
    void contextLoads() {
    }
}
