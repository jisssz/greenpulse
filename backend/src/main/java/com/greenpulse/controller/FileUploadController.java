package com.greenpulse.controller;

import com.greenpulse.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @Value("${greenpulse.upload.dir:uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".webp", ".gif");

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Please select a file to upload"));
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        
        // Prevent path traversal
        if (originalFilename.contains("..")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid file path specified"));
        }

        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFilename.substring(dotIndex).toLowerCase();
        }

        // Validate image file extension
        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Security error: Only image files (.jpg, .jpeg, .png, .webp) are allowed"));
        }

        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String newFilename = UUID.randomUUID().toString() + fileExtension;
            Path targetLocation = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(newFilename);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileUrl = "/uploads/" + newFilename;
            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", fileUrl));
        } catch (IOException ex) {
            return ResponseEntity.status(500).body(ApiResponse.error("Could not store file: " + ex.getMessage()));
        }
    }
}
