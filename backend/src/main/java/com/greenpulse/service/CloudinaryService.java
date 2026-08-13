package com.greenpulse.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

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

        // Check if Cloudinary is configured
        if (this.cloudinary != null) {
            try {
                Map<?, ?> uploadResult = this.cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
                return (String) uploadResult.get("secure_url");
            } catch (Exception e) {
                System.err.println("Cloudinary upload failed, falling back to local storage: " + e.getMessage());
            }
        }

        // Local storage fallback
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFilename.substring(dotIndex).toLowerCase();
        }

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String newFilename = UUID.randomUUID().toString() + fileExtension;
        Path targetLocation = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(newFilename);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + newFilename;
    }
}
