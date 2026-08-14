package com.greenpulse.controller;

import com.greenpulse.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> checkHealth() {
        Map<String, String> status = Map.of(
            "status", "UP",
            "service", "GreenPulse API",
            "version", "1.0.0"
        );
        return ResponseEntity.ok(ApiResponse.success("Service is healthy", status));
    }

    @GetMapping("/test-ai")
    public ResponseEntity<?> testAiConnection(@org.springframework.web.bind.annotation.RequestParam("url") String url) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(Map.of(
                "url", url,
                "status", response.getStatusCode().toString(),
                "body", response.getBody() != null ? response.getBody() : "empty"
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "url", url,
                "error", e.getMessage() != null ? e.getMessage() : "unknown error",
                "exceptionClass", e.getClass().getName()
            ));
        }
    }
}
