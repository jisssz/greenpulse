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
}
