package com.greenpulse.controller;

import com.greenpulse.dto.ApiResponse;
import com.greenpulse.dto.EnforcementDTOs.*;
import com.greenpulse.dto.GovernmentVerificationDTOs.MockVerificationRequest;
import com.greenpulse.entity.EnforcementCaseStatus;
import com.greenpulse.entity.GovernmentVerification;
import com.greenpulse.service.EnforcementService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enforcement")
public class EnforcementController {

    private final EnforcementService enforcementService;

    public EnforcementController(EnforcementService enforcementService) {
        this.enforcementService = enforcementService;
    }

    @PostMapping("/cases")
    @PreAuthorize("hasAnyRole('AUTHORITY_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<EnforcementCaseDTO>> createCase(
            @RequestBody CreateEnforcementCaseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        EnforcementCaseDTO dto = enforcementService.createCase(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Enforcement case created successfully", dto));
    }

    @GetMapping("/cases")
    public ResponseEntity<ApiResponse<Page<EnforcementCaseDTO>>> getCases(
            @RequestParam(required = false) EnforcementCaseStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<EnforcementCaseDTO> pageResult = enforcementService.getCases(status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(pageResult));
    }

    @GetMapping("/cases/{id}")
    public ResponseEntity<ApiResponse<EnforcementCaseDTO>> getCaseById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        EnforcementCaseDTO dto = enforcementService.getCaseById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/cases/{id}/mock-verify-identity")
    @PreAuthorize("hasAnyRole('AUTHORITY_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<GovernmentVerification>> requestMockVerification(
            @PathVariable Long id,
            @RequestBody MockVerificationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        GovernmentVerification result = enforcementService.requestMockGovernmentVerification(
                id, request.getVerificationType(), request.getQueryReference(), userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Simulated government verification completed", result));
    }

    @PostMapping("/cases/{id}/notes")
    @PreAuthorize("hasAnyRole('AUTHORITY_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<InvestigationNoteDTO>> addInvestigationNote(
            @PathVariable Long id,
            @RequestBody InvestigationNoteDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        InvestigationNoteDTO dto = enforcementService.addNote(id, request.getNote(), request.getIsInternal(), userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Investigation note added", dto));
    }

    @GetMapping("/cases/{id}/notes")
    public ResponseEntity<ApiResponse<List<InvestigationNoteDTO>>> getInvestigationNotes(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<InvestigationNoteDTO> notes = enforcementService.getNotes(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(notes));
    }

    @PatchMapping("/cases/{id}/confirm-violation")
    @PreAuthorize("hasAnyRole('AUTHORITY_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<EnforcementCaseDTO>> confirmViolation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        EnforcementCaseDTO dto = enforcementService.confirmViolation(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Violation confirmed by authority officer", dto));
    }
}
