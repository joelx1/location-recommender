package com.example.LocationReviewApp.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.LocationReviewApp.service.AzureBlobService;

@RestController
@RequestMapping("/api/images")
public class ImageUploadController
{
    private final AzureBlobService blobService;

    public ImageUploadController(AzureBlobService blobService)
    {
        this.blobService = blobService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file)
    {
        if (file.isEmpty())
        {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }   

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/"))
        {
            return ResponseEntity.badRequest().body(Map.of("error", "File must be an image (jpeg, png, gif, webp, etc.)"));
        }

        try
        {
            String imageUrl = blobService.uploadImage(file);
            return ResponseEntity.ok(Map.of("url", imageUrl));
        }
        catch (IOException e)
        {
            return ResponseEntity.internalServerError().body(Map.of("error", "Upload failed: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{blobName}")
    public ResponseEntity<Map<String, String>> deleteImage(@PathVariable String blobName)
    {
        blobService.deleteImage(blobName);
        return ResponseEntity.ok(Map.of("message", "Deleted: " + blobName));
    }
}