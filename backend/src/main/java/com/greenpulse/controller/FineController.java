package com.greenpulse.controller;

import com.greenpulse.dto.ApiResponse;
import com.greenpulse.dto.EnforcementDTOs.FineDTO;
import com.greenpulse.dto.EnforcementDTOs.IssueChallanRequest;
import com.greenpulse.service.FineService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    private final FineService fineService;

    public FineController(FineService fineService) {
        this.fineService = fineService;
    }

    @PostMapping("/cases/{caseId}/issue-challan")
    @PreAuthorize("hasAnyRole('AUTHORITY_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<FineDTO>> issueChallan(
            @PathVariable Long caseId,
            @RequestBody IssueChallanRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        FineDTO dto = fineService.issueChallan(caseId, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Demo challan issued successfully", dto));
    }

    @PostMapping("/{fineId}/pay")
    public ResponseEntity<ApiResponse<FineDTO>> markFinePaid(
            @PathVariable Long fineId,
            @RequestParam(required = false) String paymentRef,
            @AuthenticationPrincipal UserDetails userDetails) {
        FineDTO dto = fineService.markFinePaid(fineId, paymentRef, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Demo fine marked as PAID. Citizen reward calculated automatically.", dto));
    }
}
