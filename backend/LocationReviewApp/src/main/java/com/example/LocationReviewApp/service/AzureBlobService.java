package com.example.LocationReviewApp.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.models.BlobHttpHeaders;

@Service
public class AzureBlobService
{
    private final BlobContainerClient containerClient;

    public AzureBlobService(BlobContainerClient containerClient)
    {
        this.containerClient = containerClient;
    }

    public String uploadImage(MultipartFile file) throws IOException
    {
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
        String blobName = UUID.randomUUID() + "_" + originalFilename;
        BlobClient blobClient = containerClient.getBlobClient(blobName);
        BlobHttpHeaders headers = new BlobHttpHeaders().setContentType(file.getContentType());
        blobClient.upload(file.getInputStream(), file.getSize(), true);
        blobClient.setHttpHeaders(headers);
        return blobClient.getBlobUrl();
    }

    public void deleteImage(String blobName)
    {
        BlobClient blobClient = containerClient.getBlobClient(blobName);
        if (blobClient.exists()) blobClient.delete();
    }
}
