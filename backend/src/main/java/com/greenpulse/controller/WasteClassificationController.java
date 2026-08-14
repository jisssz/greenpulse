package com.greenpulse.controller;

import com.greenpulse.dto.ApiResponse;
import com.greenpulse.entity.User;
import com.greenpulse.entity.WastePrediction;
import com.greenpulse.repository.WastePredictionRepository;
import com.greenpulse.security.CustomUserDetails;
import com.greenpulse.service.CloudinaryService;
import com.greenpulse.service.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClientException;

@RestController
@RequestMapping("/api/ai")
public class WasteClassificationController {

    @Value("${greenpulse.ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    private final WastePredictionRepository predictionRepository;
    private final CloudinaryService cloudinaryService;
    private final NotificationService notificationService;
    private final JdbcTemplate jdbcTemplate;
    private final RestTemplate restTemplate;

    public WasteClassificationController(WastePredictionRepository predictionRepository,
                                         CloudinaryService cloudinaryService,
                                         NotificationService notificationService,
                                         JdbcTemplate jdbcTemplate) {
        this.predictionRepository = predictionRepository;
        this.cloudinaryService = cloudinaryService;
        this.notificationService = notificationService;
        this.jdbcTemplate = jdbcTemplate;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5_000);
        requestFactory.setReadTimeout(25_000);
        this.restTemplate = new RestTemplate(requestFactory);
    }

    @PostConstruct
    public void initTable() {
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS waste_predictions (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY," +
                "user_id BIGINT NOT NULL," +
                "image_url VARCHAR(512) NOT NULL," +
                "predicted_category VARCHAR(100) NOT NULL," +
                "confidence DOUBLE NOT NULL," +
                "recyclable BOOLEAN NOT NULL," +
                "recommended_bin VARCHAR(100) NOT NULL," +
                "eco_points INT NOT NULL DEFAULT 10," +
                "status VARCHAR(30) NOT NULL DEFAULT 'AUTO_APPROVED'," +
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
                ")");
            
            // Safely alter table to add columns that may be missing from the original schema
            try {
                jdbcTemplate.execute("ALTER TABLE waste_predictions ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'AUTO_APPROVED'");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("ALTER TABLE waste_predictions ADD COLUMN condition_status VARCHAR(100)");
            } catch (Exception ignored) {}
            try {
                jdbcTemplate.execute("ALTER TABLE waste_predictions ADD COLUMN material_type VARCHAR(150)");
            } catch (Exception ignored) {}

            System.out.println("waste_predictions table auto-initialized successfully.");
        } catch (Exception e) {
            System.err.println("Warning: Could not auto-initialize waste_predictions table: " + e.getMessage());
        }
    }

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @PostMapping("/classify")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    public ResponseEntity<?> classifyWaste(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();

        // 1. File Validation
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Please upload an image file"));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File size exceeds maximum limit of 5MB"));
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        if (originalFilename.contains("..")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid file path specified"));
        }

        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFilename.substring(dotIndex).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(fileExtension)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only image formats (JPG, JPEG, PNG) are allowed"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid content type. Only image files are allowed."));
        }

        try {
            byte[] imageBytes = file.getBytes();
            if (!isRecognizedImage(imageBytes)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("The uploaded file is not a readable image."));
            }

            // 2. Send the original bytes to the ML service before creating any
            // stored record. A failed AI request must not create an orphaned
            // upload or a fabricated prediction.
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Wrap file bytes in a Resource to send via RestTemplate
            ByteArrayResource fileResource = new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return originalFilename;
                }
            };
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String targetUrl = aiServiceUrl + "/predict-waste";

            Map<String, Object> aiResponse;
            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(targetUrl, requestEntity, Map.class);
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    aiResponse = (Map<String, Object>) response.getBody();
                } else {
                    return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(ApiResponse.error("AI service returned no classification. Please try again shortly."));
                }
            } catch (RestClientException e) {
                System.err.println("FastAPI AI microservice unavailable: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("AI service is temporarily unavailable. No scan was saved; please try again shortly. (" + e.getMessage() + ")"));
            }

            // Extract prediction attributes
            String category = (String) aiResponse.get("category");
            Double confidence = Double.valueOf(aiResponse.get("confidence").toString());
            Boolean recyclable = Boolean.valueOf(String.valueOf(aiResponse.get("recyclable")));
            String recommendedBin = (String) aiResponse.get("recommended_bin");
            String condition = (String) aiResponse.get("condition");
            String materialType = (String) aiResponse.get("material_type");
            boolean requiresHumanReview = Boolean.parseBoolean(String.valueOf(aiResponse.get("requires_human_review")));
            String modelQualityStatus = String.valueOf(aiResponse.getOrDefault("model_quality_status", "UNKNOWN"));

            if (category == null || recommendedBin == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error("AI service returned an incomplete classification. No scan was saved."));
            }

            // 3. Persist the image only after a usable classification arrives.
            String imageUrl = cloudinaryService.uploadFile(file);

            // Calculate eco points points logic
            int points = 10; // default
            if ("Plastic".equalsIgnoreCase(category)) points = 10;
            else if ("Metal".equalsIgnoreCase(category)) points = 20;
            else if ("Electronic Waste".equalsIgnoreCase(category)) points = 50;
            else if ("Hazardous Waste".equalsIgnoreCase(category)) points = 40;
            else if ("Paper".equalsIgnoreCase(category)) points = 10;
            else if ("Glass".equalsIgnoreCase(category)) points = 15;
            else if ("Organic Waste".equalsIgnoreCase(category)) points = 10;

            // 4. Save prediction record to database
            WastePrediction prediction = new WastePrediction();
            prediction.setUser(user);
            prediction.setImageUrl(imageUrl);
            prediction.setPredictedCategory(category);
            prediction.setConfidence(confidence);
            prediction.setRecyclable(recyclable);
            prediction.setRecommendedBin(recommendedBin);
            prediction.setConditionStatus(condition != null ? condition : "Recyclable");
            prediction.setMaterialType(materialType != null ? materialType : "Mixed Material");
            
            // Confidence handling threshold
            if (!requiresHumanReview && confidence >= 85.0) {
                prediction.setStatus("AUTO_APPROVED");
                prediction.setEcoPoints(points);
            } else {
                prediction.setStatus("PENDING_VERIFICATION");
                prediction.setEcoPoints(0);
            }
            
            prediction.setCreatedAt(LocalDateTime.now());

            WastePrediction saved = predictionRepository.save(prediction);

            // 5. Send real notification to Citizen
            if ("AUTO_APPROVED".equals(prediction.getStatus())) {
                notificationService.createNotification(
                    user.getId(),
                    "AI Classification Success! 🌱",
                    "Successfully classified item as " + category + " (" + confidence + "% confidence). Earned +" + points + " Eco Points!",
                    "REWARD"
                );
            } else {
                notificationService.createNotification(
                    user.getId(),
                    "AI Classification Pending ⚠️",
                    requiresHumanReview
                        ? "This model is currently in supervised QA. Your item was submitted to the municipal desk for validation."
                        : "AI confidence is low (" + confidence + "%). Item submitted to municipal desk for validation.",
                    "INFO"
                );
            }

            // 6. Build enriched response with Grad-CAM heatmap if available
            Map<String, Object> responseData = new java.util.LinkedHashMap<>();
            responseData.put("id", saved.getId());
            responseData.put("imageUrl", saved.getImageUrl());
            responseData.put("predictedCategory", saved.getPredictedCategory());
            responseData.put("confidence", saved.getConfidence());
            responseData.put("recyclable", saved.getRecyclable());
            responseData.put("recommendedBin", saved.getRecommendedBin());
            responseData.put("conditionStatus", saved.getConditionStatus());
            responseData.put("materialType", saved.getMaterialType());
            responseData.put("ecoPoints", saved.getEcoPoints());
            responseData.put("status", saved.getStatus());
            responseData.put("createdAt", saved.getCreatedAt());
            responseData.put("modelQualityStatus", modelQualityStatus);
            responseData.put("requiresHumanReview", requiresHumanReview);
            // Pass through Grad-CAM heatmap from AI service (not stored in DB)
            if (aiResponse != null && aiResponse.containsKey("grad_cam_heatmap")) {
                responseData.put("gradCamHeatmap", aiResponse.get("grad_cam_heatmap"));
            }
            if (aiResponse != null && aiResponse.get("recommended_action") != null) {
                responseData.put("recommendedAction", aiResponse.get("recommended_action"));
            }

            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>success("Waste classified successfully", responseData));

        } catch (IOException e) {
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to read image bytes: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error("AI service communication failed: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<WastePrediction>>> getPredictionHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        List<WastePrediction> history = predictionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Prediction history fetched", history));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRecyclingStats(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        List<WastePrediction> list = predictionRepository.findByUserId(user.getId());

        int totalScans = list.size();
        int totalPoints = list.stream().mapToInt(WastePrediction::getEcoPoints).sum();
        
        // Calculate waste diverted in kg based on categories
        double totalKg = 0.0;
        for (WastePrediction p : list) {
            String cat = p.getPredictedCategory();
            if ("Plastic".equalsIgnoreCase(cat)) totalKg += 0.5;
            else if ("Metal".equalsIgnoreCase(cat)) totalKg += 1.5;
            else if ("Electronic Waste".equalsIgnoreCase(cat)) totalKg += 4.5;
            else if ("Hazardous Waste".equalsIgnoreCase(cat)) totalKg += 0.8;
            else if ("Paper".equalsIgnoreCase(cat)) totalKg += 0.3;
            else if ("Glass".equalsIgnoreCase(cat)) totalKg += 1.2;
            else if ("Organic Waste".equalsIgnoreCase(cat)) totalKg += 2.0;
            else totalKg += 1.0;
        }

        double accuracy = 0.0;
        if (totalScans > 0) {
            accuracy = list.stream().mapToDouble(WastePrediction::getConfidence).average().orElse(0.0);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalScans", totalScans);
        stats.put("ecoPointsEarned", totalPoints);
        stats.put("wasteDivertedKg", Math.round(totalKg * 10.0) / 10.0);
        stats.put("recyclingAccuracy", Math.round(accuracy * 10.0) / 10.0);

        return ResponseEntity.ok(ApiResponse.success("Recycling statistics calculated", stats));
    }

    @GetMapping("/intelligence")
    @PreAuthorize("hasAnyRole('AUTHORITY_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAIIntelligence(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // Authority intelligence endpoint
        List<WastePrediction> list = predictionRepository.findAll();
        
        // Calculate category distributions
        Map<String, Integer> categoryDistribution = new HashMap<>();
        for (WastePrediction p : list) {
            categoryDistribution.put(p.getPredictedCategory(), categoryDistribution.getOrDefault(p.getPredictedCategory(), 0) + 1);
        }

        // Return a mock-fallback intelligence dataset if total entries are too low
        if (list.size() < 5) {
            categoryDistribution.put("Plastic", 45);
            categoryDistribution.put("Metal", 18);
            categoryDistribution.put("Organic Waste", 32);
            categoryDistribution.put("Electronic Waste", 12);
            categoryDistribution.put("Paper", 22);
        }

        Map<String, Object> intelligence = new HashMap<>();
        intelligence.put("categoryTrends", categoryDistribution);
        intelligence.put("scanVolumeByMonth", Arrays.asList(
            Map.of("month", "May", "scans", 120),
            Map.of("month", "Jun", "scans", 180),
            Map.of("month", "Jul", "scans", 240),
            Map.of("month", "Aug", "scans", 310)
        ));
        intelligence.put("illegalDumpingRiskIndices", Arrays.asList(
            Map.of("location", "West Gate, Thrissur", "risk", "HIGH"),
            Map.of("location", "Marine Drive, Mumbai", "risk", "MEDIUM"),
            Map.of("location", "Bannerghatta, Bangalore", "risk", "CRITICAL")
        ));

        return ResponseEntity.ok(ApiResponse.success("AI Environmental Intelligence calculated", intelligence));
    }

    @GetMapping("/review-queue")
    @PreAuthorize("hasAnyRole('AUTHORITY_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<WastePrediction>>> getReviewQueue() {
        List<WastePrediction> list = predictionRepository.findByStatus("PENDING_VERIFICATION");
        return ResponseEntity.ok(ApiResponse.success("AI review queue fetched", list));
    }

    @PostMapping("/review/{id}/action")
    @PreAuthorize("hasAnyRole('AUTHORITY_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<WastePrediction>> reviewPrediction(
            @PathVariable("id") Long id,
            @RequestParam("action") String action,
            @RequestParam(value = "category", required = false) String correctedCategory) {
        
        WastePrediction prediction = predictionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Prediction record not found"));

        if (!"PENDING_VERIFICATION".equals(prediction.getStatus())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Prediction is already processed."));
        }

        if ("APPROVE".equalsIgnoreCase(action)) {
            prediction.setStatus("APPROVED");
            if (correctedCategory != null && !correctedCategory.isBlank()) {
                prediction.setPredictedCategory(correctedCategory);
            }
            
            // Recalculate and award points to citizen user
            int points = 10;
            String cat = prediction.getPredictedCategory();
            if ("Plastic".equalsIgnoreCase(cat)) points = 10;
            else if ("Metal".equalsIgnoreCase(cat)) points = 20;
            else if ("Electronic Waste".equalsIgnoreCase(cat)) points = 50;
            else if ("Hazardous Waste".equalsIgnoreCase(cat)) points = 40;
            else if ("Paper".equalsIgnoreCase(cat)) points = 10;
            else if ("Glass".equalsIgnoreCase(cat)) points = 15;
            else if ("Organic Waste".equalsIgnoreCase(cat)) points = 10;

            prediction.setEcoPoints(points);
            
            notificationService.createNotification(
                prediction.getUser().getId(),
                "AI Prediction Approved! 🌱",
                "Your submitted waste item has been verified as " + prediction.getPredictedCategory() + ". Earned +" + points + " Eco Points!",
                "REWARD"
            );
        } else {
            prediction.setStatus("REJECTED");
            prediction.setEcoPoints(0);
            notificationService.createNotification(
                prediction.getUser().getId(),
                "AI Prediction Rejected ❌",
                "Your waste submission was reviewed and rejected by the authority desk.",
                "INFO"
            );
        }

        WastePrediction saved = predictionRepository.save(prediction);
        return ResponseEntity.ok(ApiResponse.success("AI prediction reviewed successfully", saved));
    }

    private boolean isRecognizedImage(byte[] bytes) throws IOException {
        try (ByteArrayInputStream stream = new ByteArrayInputStream(bytes)) {
            BufferedImage image = ImageIO.read(stream);
            if (image != null) {
                return true;
            }
        }

        // Java's standard ImageIO runtime does not decode WebP, while Pillow in
        // the AI service does. Verify its container signature before forwarding.
        return bytes.length >= 12
            && bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
            && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
    }
}
