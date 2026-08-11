package com.greenpulse.controller;

import com.greenpulse.dto.ApiResponse;
import com.greenpulse.dto.EvidenceDTOs.EvidenceDTO;
import com.greenpulse.dto.EvidenceDTOs.SubmitEvidenceRequest;
import com.greenpulse.dto.EvidenceDTOs.VerifyEvidenceRequest;
import com.greenpulse.entity.EvidenceStatus;
import com.greenpulse.service.EvidenceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evidence")
public class EvidenceController {

    private final EvidenceService evidenceService;

    public EvidenceController(EvidenceService evidenceService) {
        this.evidenceService = evidenceService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EvidenceDTO>> submitEvidence(
            @RequestBody SubmitEvidenceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        EvidenceDTO dto = evidenceService.submitEvidence(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Evidence submitted successfully with cryptographic integrity hash", dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EvidenceDTO>> getEvidenceById(@PathVariable Long id) {
        EvidenceDTO dto = evidenceService.getEvidenceById(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/report/{reportId}")
    public ResponseEntity<ApiResponse<List<EvidenceDTO>>> getEvidenceForReport(@PathVariable Long reportId) {
        List<EvidenceDTO> list = evidenceService.getEvidenceForReport(reportId);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MODERATOR', 'AUTHORITY_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Page<EvidenceDTO>>> getEvidenceByStatus(
            @RequestParam(required = false, defaultValue = "SUBMITTED") EvidenceStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<EvidenceDTO> dtoPage = evidenceService.getEvidenceByStatus(status, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(dtoPage));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('MODERATOR', 'AUTHORITY_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<EvidenceDTO>> verifyEvidence(
            @PathVariable Long id,
            @RequestBody VerifyEvidenceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        EvidenceDTO dto = evidenceService.verifyEvidence(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Evidence verification status updated", dto));
    }
}
