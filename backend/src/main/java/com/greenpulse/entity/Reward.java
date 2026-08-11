package com.greenpulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rewards")
public class Reward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enforcement_case_id", nullable = false)
    private Long enforcementCaseId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contributor_id", nullable = false)
    private User contributor;

    @Column(name = "fine_id", nullable = false)
    private Long fineId;

    @Column(name = "reward_percentage", nullable = false)
    private Double rewardPercentage;

    @Column(name = "eligible_amount", nullable = false)
    private Double eligibleAmount;

    @Column(name = "approved_amount", nullable = false)
    private Double approvedAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private RewardStatus paymentStatus = RewardStatus.PENDING;

    @Column(name = "payment_reference", length = 100)
    private String paymentReference;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "fraud_flag", length = 30)
    private String fraudFlag = "NORMAL";

    public Reward() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEnforcementCaseId() { return enforcementCaseId; }
    public void setEnforcementCaseId(Long enforcementCaseId) { this.enforcementCaseId = enforcementCaseId; }

    public User getContributor() { return contributor; }
    public void setContributor(User contributor) { this.contributor = contributor; }

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
