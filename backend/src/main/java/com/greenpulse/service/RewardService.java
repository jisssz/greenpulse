package com.greenpulse.service;

import com.greenpulse.dto.RewardDTOs.RewardDTO;
import com.greenpulse.dto.RewardDTOs.RewardPolicyDTO;
import com.greenpulse.dto.RewardDTOs.RewardSummaryDTO;
import com.greenpulse.entity.*;
import com.greenpulse.exception.ResourceNotFoundException;
import com.greenpulse.exception.UnauthorizedException;
import com.greenpulse.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RewardService {

    private final RewardRepository rewardRepository;
    private final RewardPolicyRepository rewardPolicyRepository;
    private final EnforcementCaseRepository enforcementCaseRepository;
    private final FineRepository fineRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public RewardService(RewardRepository rewardRepository,
                         RewardPolicyRepository rewardPolicyRepository,
                         EnforcementCaseRepository enforcementCaseRepository,
                         FineRepository fineRepository,
                         UserRepository userRepository,
                         NotificationService notificationService,
                         AuditLogService auditLogService) {
        this.rewardRepository = rewardRepository;
        this.rewardPolicyRepository = rewardPolicyRepository;
        this.enforcementCaseRepository = enforcementCaseRepository;
        this.fineRepository = fineRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public RewardDTO calculateAndCreateReward(Long enforcementCaseId, Long fineId) {
        EnforcementCase c = enforcementCaseRepository.findById(enforcementCaseId)
                .orElseThrow(() -> new ResourceNotFoundException("EnforcementCase", "id", enforcementCaseId));

        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Fine", "id", fineId));

        if (fine.getPaymentStatus() != FineStatus.PAID) {
            throw freshIllegalStateException("Reward cannot be created until fine is PAID");
        }

        User contributor = null;
        if (c.getEvidence() != null) {
            contributor = c.getEvidence().getSubmittedBy();
        } else if (c.getReport() != null) {
            contributor = c.getReport().getCitizen();
        }

        if (contributor == null) {
            return null; // No citizen contributor to reward
        }

        // Fraud prevention check: Ensure duplicate rewards are not created for the same case & contributor
        if (rewardRepository.existsByEnforcementCaseIdAndContributorId(enforcementCaseId, contributor.getId())) {
            return rewardRepository.findByEnforcementCaseId(enforcementCaseId).map(RewardDTO::fromEntity).orElse(null);
        }

        RewardPolicy policy = rewardPolicyRepository.findByEnabledTrue().orElse(null);
        double percentage = (policy != null) ? policy.getRewardPercentage() : 10.0;
        double maxCap = (policy != null) ? policy.getMaximumReward() : 500.0;

        double eligible = fine.getFineAmount() * (percentage / 100.0);
        double approved = Math.min(eligible, maxCap);

        Reward reward = new Reward();
        reward.setEnforcementCaseId(enforcementCaseId);
        reward.setContributor(contributor);
        reward.setFineId(fineId);
        reward.setRewardPercentage(percentage);
        reward.setEligibleAmount(eligible);
        reward.setApprovedAmount(approved);
        reward.setPaymentStatus(RewardStatus.APPROVED);
        reward.setApprovedAt(LocalDateTime.now());
        reward.setFraudFlag("NORMAL");

        Reward saved = rewardRepository.save(reward);

        c.setCaseStatus(EnforcementCaseStatus.REWARD_PENDING);
        enforcementCaseRepository.save(c);

        notificationService.createNotification(
            contributor.getId(),
            "Citizen Reward Approved!",
            "Your verified contribution to case " + c.getCaseNumber() + " earned a reward of ₹" + approved + ".",
            "REWARD"
        );

        auditLogService.logAction(contributor.getId(), "REWARD_CALCULATED", "REWARD", saved.getId(), "{\"amount\":" + approved + "}");

        return RewardDTO.fromEntity(saved);
    }

    @Transactional
    public RewardDTO processRewardPayment(Long rewardId, String approverEmail) {
        User approver = userRepository.findByEmail(approverEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", approverEmail));

        if (approver.getRole() != Role.AUTHORITY_OFFICER && approver.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only authority officers or admins can disburse rewards");
        }

        Reward reward = rewardRepository.findById(rewardId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward", "id", rewardId));

        reward.setPaymentStatus(RewardStatus.PAID);
        reward.setPaymentReference("DEMO-REWARD-2026-" + System.currentTimeMillis());
        reward.setPaidAt(LocalDateTime.now());

        Reward saved = rewardRepository.save(reward);

        EnforcementCase c = enforcementCaseRepository.findById(reward.getEnforcementCaseId()).orElse(null);
        if (c != null) {
            c.setCaseStatus(EnforcementCaseStatus.REWARD_PAID);
            c.setClosedAt(LocalDateTime.now());
            enforcementCaseRepository.save(c);
        }

        notificationService.createNotification(
            reward.getContributor().getId(),
            "Citizen Reward Paid!",
            "Your reward of ₹" + reward.getApprovedAmount() + " has been successfully transferred. Ref: " + reward.getPaymentReference(),
            "REWARD"
        );

        auditLogService.logAction(approver.getId(), "REWARD_PAID", "REWARD", saved.getId(), "{\"ref\":\"" + saved.getPaymentReference() + "\"}");

        return RewardDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<RewardDTO> getMyRewards(String citizenEmail) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", citizenEmail));

        return rewardRepository.findByContributorId(citizen.getId()).stream()
                .map(RewardDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RewardSummaryDTO getMyRewardSummary(String citizenEmail) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", citizenEmail));

        List<Reward> rewards = rewardRepository.findByContributorId(citizen.getId());
        double totalEarned = rewards.stream()
                .filter(r -> r.getPaymentStatus() == RewardStatus.PAID)
                .mapToDouble(Reward::getApprovedAmount)
                .sum();

        long verifiedCount = rewards.size();
        long pending = rewards.stream().filter(r -> r.getPaymentStatus() == RewardStatus.PENDING || r.getPaymentStatus() == RewardStatus.APPROVED).count();
        long paid = rewards.stream().filter(r -> r.getPaymentStatus() == RewardStatus.PAID).count();

        return new RewardSummaryDTO(totalEarned, verifiedCount, pending, paid);
    }

    @Transactional
    public RewardPolicyDTO updateRewardPolicy(RewardPolicyDTO request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", adminEmail));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only system admins can configure reward policies");
        }

        RewardPolicy policy = rewardPolicyRepository.findByEnabledTrue().orElse(new RewardPolicy());
        policy.setName(request.getName() != null ? request.getName() : "Standard Community Environmental Incentive Policy");
        policy.setRewardPercentage(request.getRewardPercentage());
        policy.setMaximumReward(request.getMaximumReward());
        policy.setMinimumFine(request.getMinimumFine());
        policy.setEnabled(request.getEnabled() != null ? request.getEnabled() : true);

        RewardPolicy saved = rewardPolicyRepository.save(policy);
        return RewardPolicyDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public RewardPolicyDTO getActivePolicy() {
        RewardPolicy policy = rewardPolicyRepository.findByEnabledTrue()
                .orElseThrow(() -> new ResourceNotFoundException("RewardPolicy", "enabled", true));
        return RewardPolicyDTO.fromEntity(policy);
    }

    private RuntimeException freshIllegalStateException(String msg) {
        return new IllegalArgumentException(msg);
    }
}
