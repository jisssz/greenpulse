package com.greenpulse.controller;

import com.greenpulse.dto.ApiResponse;
import com.greenpulse.dto.AuthDTOs.UserDTO;
import com.greenpulse.dto.ReportDTOs.*;
import com.greenpulse.entity.Priority;
import com.greenpulse.entity.ReportStatus;
import com.greenpulse.security.CustomUserDetails;
import com.greenpulse.service.ModeratorService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/moderator")
@PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
public class ModeratorController {

    private final ModeratorService moderatorService;

    public ModeratorController(ModeratorService moderatorService) {
        this.moderatorService = moderatorService;
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<Page<ReportDTO>>> getReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReportDTO> reports = moderatorService.getModeratorReports(status, categoryId, priority, search, page, size);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }

    @PatchMapping("/reports/{id}/verify")
    public ResponseEntity<ApiResponse<ReportDTO>> verifyReport(@PathVariable Long id,
                                                               @RequestParam(required = false) Priority priority,
                                                               @RequestParam(required = false) String comment,
                                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReportDTO report = moderatorService.verifyReport(id, priority, comment, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Report verified successfully", report));
    }

    @PatchMapping("/reports/{id}/reject")
    public ResponseEntity<ApiResponse<ReportDTO>> rejectReport(@PathVariable Long id,
                                                               @RequestParam String reason,
                                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReportDTO report = moderatorService.rejectReport(id, reason, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Report rejected", report));
    }

    @PatchMapping("/reports/{id}/priority")
    public ResponseEntity<ApiResponse<ReportDTO>> updatePriority(@PathVariable Long id,
                                                                 @Valid @RequestBody PriorityUpdateRequest request,
                                                                 @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReportDTO report = moderatorService.updatePriority(id, request.getPriority(), request.getComment(), userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Priority updated", report));
    }

    @PatchMapping("/reports/{id}/assign")
    public ResponseEntity<ApiResponse<ReportDTO>> assignWorker(@PathVariable Long id,
                                                               @Valid @RequestBody AssignWorkerRequest request,
                                                               @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReportDTO report = moderatorService.assignWorker(id, request.getWorkerId(), request.getComment(), userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Worker assigned successfully", report));
    }

    @GetMapping("/field-workers")
    public ResponseEntity<ApiResponse<List<UserDTO>>> getFieldWorkers() {
        List<UserDTO> workers = moderatorService.getAvailableFieldWorkers();
        return ResponseEntity.ok(ApiResponse.success(workers));
    }
}
