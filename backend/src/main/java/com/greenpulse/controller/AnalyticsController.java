package com.greenpulse.controller;

import com.greenpulse.dto.AnalyticsDTOs.AnalyticsSummary;
import com.greenpulse.dto.AnalyticsDTOs.HotspotDTO;
import com.greenpulse.dto.ApiResponse;
import com.greenpulse.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummary>> getSummary() {
        AnalyticsSummary summary = analyticsService.getSummary();
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @GetMapping("/hotspots")
    public ResponseEntity<ApiResponse<List<HotspotDTO>>> getHotspotMap() {
        List<HotspotDTO> hotspots = analyticsService.getHotspotData();
        return ResponseEntity.ok(ApiResponse.success(hotspots));
    }
}
