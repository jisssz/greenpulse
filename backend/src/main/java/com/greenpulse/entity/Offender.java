package com.greenpulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "offenders")
public class Offender {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enforcement_case_id", nullable = false, unique = true)
    private Long enforcementCaseId;

    @Column(name = "identity_status", length = 30)
    private String identityStatus = "IDENTITY_PENDING";

    @Column(name = "identification_method", length = 50)
    private String identificationMethod;

    @Column(name = "masked_reference", length = 100)
    private String maskedReference;

    @Column(name = "vehicle_reference", length = 50)
    private String vehicleReference;

    @Column(name = "verification_source", length = 100)
    private String verificationSource = "SIMULATED_AUTHORITY_ADAPTER";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    public Offender() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEnforcementCaseId() { return enforcementCaseId; }
    public void setEnforcementCaseId(Long enforcementCaseId) { this.enforcementCaseId = enforcementCaseId; }

    public String getIdentityStatus() { return identityStatus; }
    public void setIdentityStatus(String identityStatus) { this.identityStatus = identityStatus; }

    public String getIdentificationMethod() { return identificationMethod; }
    public void setIdentificationMethod(String identificationMethod) { this.identificationMethod = identificationMethod; }

    public String getMaskedReference() { return maskedReference; }
    public void setMaskedReference(String maskedReference) { this.maskedReference = maskedReference; }

    public String getVehicleReference() { return vehicleReference; }
    public void setVehicleReference(String vehicleReference) { this.vehicleReference = vehicleReference; }

    public String getVerificationSource() { return verificationSource; }
    public void setVerificationSource(String verificationSource) { this.verificationSource = verificationSource; }

    public User getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(User verifiedBy) { this.verifiedBy = verifiedBy; }

    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
}
