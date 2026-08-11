package com.greenpulse.dto;

import com.greenpulse.entity.Reward;
import com.greenpulse.entity.RewardPolicy;
import com.greenpulse.entity.RewardStatus;

import java.time.LocalDateTime;

public class RewardDTOs {

    public static class RewardDTO {
        private Long id;
        private Long enforcementCaseId;
        private Long contributorId;
        private String contributorName;
        private Long fineId;
        private Double rewardPercentage;
        private Double eligibleAmount;
        private Double approvedAmount;
        private RewardStatus paymentStatus;
        private String paymentReference;
        private LocalDateTime approvedAt;
        private LocalDateTime paidAt;
        private String fraudFlag;

        public static RewardDTO fromEntity(Reward reward) {
            RewardDTO dto = new RewardDTO();
            dto.setId(reward.getId());
            dto.setEnforcementCaseId(reward.getEnforcementCaseId());
            dto.setContributorId(reward.getContributor() != null ? reward.getContributor().getId() : null);
            dto.setContributorName(reward.getContributor() != null ? reward.getContributor().getName() : null);
            dto.setFineId(reward.getFineId());
            dto.setRewardPercentage(reward.getRewardPercentage());
            dto.setEligibleAmount(reward.getEligibleAmount());
            dto.setApprovedAmount(reward.getApprovedAmount());
            dto.setPaymentStatus(reward.getPaymentStatus());
            dto.setPaymentReference(reward.getPaymentReference());
            dto.setApprovedAt(reward.getApprovedAt());
            dto.setPaidAt(reward.getPaidAt());
            dto.setFraudFlag(reward.getFraudFlag());
            return dto;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getEnforcementCaseId() { return enforcementCaseId; }
        public void setEnforcementCaseId(Long enforcementCaseId) { this.enforcementCaseId = enforcementCaseId; }

        public Long getContributorId() { return contributorId; }
        public void setContributorId(Long contributorId) { this.contributorId = contributorId; }

        public String getContributorName() { return contributorName; }
        public void setContributorName(String contributorName) { this.contributorName = contributorName; }

        public Long getFineId() { return fineId; }
        public void setFineId(Long fineId) { this.fineId = fineId; }

        public Double getRewardPercentage() { return rewardPercentage; }
        public void setRewardPercentage(Double rewardPercentage) { this.rewardPercentage = rewardPercentage; }

        public Double getEligibleAmount() { return eligibleAmount; }
        public void setEligibleAmount(Double eligibleAmount) { this.eligibleAmount = eligibleAmount; }

        public Double getApprovedAmount() { return approvedAmount; }
        public void setApprovedAmount(Double approvedAmount) { this.approvedAmount = approvedAmount; }

        public RewardStatus getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(RewardStatus paymentStatus) { this.paymentStatus = paymentStatus; }

        public String getPaymentReference() { return paymentReference; }
        public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

        public LocalDateTime getApprovedAt() { return approvedAt; }
        public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

        public LocalDateTime getPaidAt() { return paidAt; }
        public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

        public String getFraudFlag() { return fraudFlag; }
        public void setFraudFlag(String fraudFlag) { this.fraudFlag = fraudFlag; }
    }

    public static class RewardPolicyDTO {
        private Long id;
        private String name;
        private Double rewardPercentage;
        private Double maximumReward;
        private Double minimumFine;
        private Boolean enabled;

        public static RewardPolicyDTO fromEntity(RewardPolicy policy) {
            RewardPolicyDTO dto = new RewardPolicyDTO();
            dto.setId(policy.getId());
            dto.setName(policy.getName());
            dto.setRewardPercentage(policy.getRewardPercentage());
            dto.setMaximumReward(policy.getMaximumReward());
            dto.setMinimumFine(policy.getMinimumFine());
            dto.setEnabled(policy.getEnabled());
            return dto;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Double getRewardPercentage() { return rewardPercentage; }
        public void setRewardPercentage(Double rewardPercentage) { this.rewardPercentage = rewardPercentage; }

        public Double getMaximumReward() { return maximumReward; }
        public void setMaximumReward(Double maximumReward) { this.maximumReward = maximumReward; }

        public Double getMinimumFine() { return minimumFine; }
        public void setMinimumFine(Double minimumFine) { this.minimumFine = minimumFine; }

        public Boolean getEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    }

    public static class RewardSummaryDTO {
        private Double totalEarned;
        private long verifiedContributions;
        private long pendingRewards;
        private long paidRewards;

        public RewardSummaryDTO(Double totalEarned, long verifiedContributions, long pendingRewards, long paidRewards) {
            this.totalEarned = totalEarned;
            this.verifiedContributions = verifiedContributions;
            this.pendingRewards = pendingRewards;
            this.paidRewards = paidRewards;
        }

        public Double getTotalEarned() { return totalEarned; }
        public long getVerifiedContributions() { return verifiedContributions; }
        public long getPendingRewards() { return pendingRewards; }
        public long getPaidRewards() { return paidRewards; }
    }
}
