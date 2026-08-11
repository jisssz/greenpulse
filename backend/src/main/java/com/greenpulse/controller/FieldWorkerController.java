package com.greenpulse.controller;

import com.greenpulse.dto.ApiResponse;
import com.greenpulse.dto.ReportDTOs.ReportDTO;
import com.greenpulse.dto.ReportDTOs.ResolutionRequest;
import com.greenpulse.security.CustomUserDetails;
import com.greenpulse.service.FieldWorkerService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/field-worker")
@PreAuthorize("hasAnyRole('FIELD_WORKER', 'ADMIN')")
public class FieldWorkerController {

    private final FieldWorkerService fieldWorkerService;

    public FieldWorkerController(FieldWorkerService fieldWorkerService) {
        this.fieldWorkerService = fieldWorkerService;
    }

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<Page<ReportDTO>>> getAssignments(@RequestParam(defaultValue = "0") int page,
                                                                       @RequestParam(defaultValue = "10") int size,
                                                                       @AuthenticationPrincipal CustomUserDetails userDetails) {
        Page<ReportDTO> assignments = fieldWorkerService.getWorkerAssignments(userDetails.getUser(), page, size);
        return ResponseEntity.ok(ApiResponse.success(assignments));
    }

    @PatchMapping("/reports/{id}/start")
    public ResponseEntity<ApiResponse<ReportDTO>> startWork(@PathVariable Long id,
                                                           @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReportDTO report = fieldWorkerService.startWork(id, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Work marked in progress", report));
    }

    @PatchMapping("/reports/{id}/resolve")
    public ResponseEntity<ApiResponse<ReportDTO>> resolveReport(@PathVariable Long id,
                                                                @Valid @RequestBody ResolutionRequest request,
                                                                @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReportDTO report = fieldWorkerService.resolveReport(id, request, userDetails.getUser());
        return ResponseEntity.ok(ApiResponse.success("Report marked resolved and evidence submitted", report));
    }
}
