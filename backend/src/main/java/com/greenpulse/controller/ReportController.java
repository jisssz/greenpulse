package com.greenpulse.controller;

import com.greenpulse.dto.ApiResponse;
import com.greenpulse.dto.CommentDTOs.CommentDTO;
import com.greenpulse.dto.CommentDTOs.CreateCommentRequest;
import com.greenpulse.dto.ReportDTOs.*;
import com.greenpulse.entity.User;
import com.greenpulse.security.CustomUserDetails;
import com.greenpulse.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReportDTO>> createReport(@Valid @RequestBody CreateReportRequest request,
                                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReportDTO report = reportService.createReport(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Report submitted successfully", report));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<ReportDTO>>> getMyReports(@RequestParam(defaultValue = "0") int page,
                                                                     @RequestParam(defaultValue = "10") int size,
                                                                     @AuthenticationPrincipal CustomUserDetails userDetails) {
        Page<ReportDTO> reports = reportService.getMyReports(userDetails.getUsername(), page, size);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportDTO>> getReportById(@PathVariable Long id,
                                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReportDTO report = reportService.getReportById(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/duplicates")
    public ResponseEntity<ApiResponse<List<ReportDTO>>> checkDuplicates(@RequestParam Double latitude,
                                                                         @RequestParam Double longitude) {
        List<ReportDTO> duplicates = reportService.checkNearbyDuplicates(latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success(duplicates));
    }

    @PostMapping("/{id}/verify-resolution")
    public ResponseEntity<ApiResponse<ReportDTO>> confirmResolution(@PathVariable Long id,
                                                                      @Valid @RequestBody ResolutionVerificationRequest request,
                                                                      @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReportDTO report = reportService.confirmResolution(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resolution feedback recorded", report));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentDTO>> addComment(@PathVariable Long id,
                                                               @Valid @RequestBody CreateCommentRequest request,
                                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        CommentDTO comment = reportService.addComment(id, request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Comment added", comment));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<List<CommentDTO>>> getComments(@PathVariable Long id,
                                                                     @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<CommentDTO> comments = reportService.getComments(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success(comments));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<StatusHistoryDTO>>> getReportHistory(@PathVariable Long id) {
        List<StatusHistoryDTO> history = reportService.getReportHistory(id);
        return ResponseEntity.ok(ApiResponse.success(history));
    }
}
