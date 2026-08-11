package com.greenpulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "government_verifications")
public class GovernmentVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enforcement_case_id", nullable = false)
    private Long enforcementCaseId;

    @Column(name = "verification_type", nullable = false, length = 50)
    private String verificationType;

    @Column(nullable = false, length = 100)
    private String provider = "SIMULATED_AUTHORITY_ADAPTER";

    @Column(name = "external_reference", nullable = false, length = 100)
    private String externalReference;

    @Column(name = "verification_status", nullable = false, length = 30)
    private String verificationStatus = "VERIFIED";

    @Column(name = "requested_at", updatable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    public GovernmentVerification() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEnforcementCaseId() { return enforcementCaseId; }
    public void setEnforcementCaseId(Long enforcementCaseId) { this.enforcementCaseId = enforcementCaseId; }

    public String getVerificationType() { return verificationType; }
    public void setVerificationType(String verificationType) { this.verificationType = verificationType; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getExternalReference() { return externalReference; }
    public void setExternalReference(String externalReference) { this.externalReference = externalReference; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public User getRequestedBy() { return requestedBy; }
    public void setRequestedBy(User requestedBy) { this.requestedBy = requestedBy; }
}
