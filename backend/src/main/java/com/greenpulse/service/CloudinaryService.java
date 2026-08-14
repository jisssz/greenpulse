package com.greenpulse.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${greenpulse.upload.dir:uploads}")
    private String uploadDir;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        // Fallback to CLOUDINARY_URL environment variable if set
        String cloudinaryUrl = System.getenv("CLOUDINARY_URL");
        if (StringUtils.hasText(cloudinaryUrl)) {
            try {
                // Log masked URL to safely check format in production logs
                String masked = cloudinaryUrl;
                if (cloudinaryUrl.startsWith("CLOUDINARY_URL=")) {
                    masked = "CLOUDINARY_URL=" + cloudinaryUrl.substring(15).replaceAll("(?<=cloudinary://[^:]+:)[^@]+", "******");
                } else if (cloudinaryUrl.contains("cloudinary://")) {
                    masked = cloudinaryUrl.replaceAll("(?<=cloudinary://[^:]+:)[^@]+", "******");
                } else {
                    masked = "[INVALID SCHEME - length: " + cloudinaryUrl.length() + "]";
                }
                System.out.println("Initializing Cloudinary with: " + masked);
                this.cloudinary = new Cloudinary(cloudinaryUrl);
                System.out.println("Cloudinary initialized successfully using CLOUDINARY_URL env variable.");
                return;
            } catch (Exception e) {
                System.err.println("Warning: Failed to initialize Cloudinary using CLOUDINARY_URL: " + e.getMessage());
            }
        }

        if (StringUtils.hasText(cloudName) && StringUtils.hasText(apiKey) && StringUtils.hasText(apiSecret)) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
            ));
            System.out.println("Cloudinary initialized successfully using properties.");
        } else {
            System.out.println("Warning: Cloudinary credentials not fully configured. Media storage will fall back to local disk storage.");
        }
    }

    public String uploadFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }

        if (this.cloudinary == null) {
            throw new IOException("Cloud storage (Cloudinary) is not configured. Set the CLOUDINARY_URL environment variable.");
        }

        try {
            Map<?, ?> uploadResult = this.cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            throw new IOException("Image upload to Cloudinary failed: " + e.getMessage(), e);
        }
    }
}
