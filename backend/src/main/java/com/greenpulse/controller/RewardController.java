package com.greenpulse.controller;

import com.greenpulse.dto.ApiResponse;
import com.greenpulse.dto.RewardDTOs.RewardDTO;
import com.greenpulse.dto.RewardDTOs.RewardPolicyDTO;
import com.greenpulse.dto.RewardDTOs.RewardSummaryDTO;
import com.greenpulse.service.RewardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<RewardDTO>>> getMyRewards(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<RewardDTO> list = rewardService.getMyRewards(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/my/summary")
    public ResponseEntity<ApiResponse<RewardSummaryDTO>> getMyRewardSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        RewardSummaryDTO summary = rewardService.getMyRewardSummary(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PostMapping("/{rewardId}/disburse")
    @PreAuthorize("hasAnyRole('AUTHORITY_OFFICER', 'ADMIN')")
    public ResponseEntity<ApiResponse<RewardDTO>> processRewardPayment(
            @PathVariable Long rewardId,
            @AuthenticationPrincipal UserDetails userDetails) {
        RewardDTO dto = rewardService.processRewardPayment(rewardId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Demo reward payout completed", dto));
    }

    @GetMapping("/policy")
    public ResponseEntity<ApiResponse<RewardPolicyDTO>> getActivePolicy() {
        RewardPolicyDTO policy = rewardService.getActivePolicy();
        return ResponseEntity.ok(ApiResponse.success(policy));
    }

    @PutMapping("/policy")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RewardPolicyDTO>> updateRewardPolicy(
            @RequestBody RewardPolicyDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        RewardPolicyDTO dto = rewardService.updateRewardPolicy(request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Demo reward policy updated", dto));
    }
}
