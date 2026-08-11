package com.greenpulse.dto;

import com.greenpulse.entity.*;

import java.time.LocalDateTime;

public class EnforcementDTOs {

    public static class EnforcementCaseDTO {
        private Long id;
        private String caseNumber;
        private Long reportId;
        private String reportTitle;
        private Long evidenceId;
        private String evidenceUrl;
        private String evidenceHash;
        private Long assignedOfficerId;
        private String assignedOfficerName;
        private String violationType;
        private EnforcementCaseStatus caseStatus;
        private Priority priority;
        private String location;
        private LocalDateTime openedAt;
        private LocalDateTime investigatedAt;
        private LocalDateTime closedAt;
        private OffenderDTO offender;
        private FineDTO fine;
        private RewardDTOs.RewardDTO reward;

        public static EnforcementCaseDTO fromEntity(EnforcementCase caseEntity) {
            EnforcementCaseDTO dto = new EnforcementCaseDTO();
            dto.setId(caseEntity.getId());
            dto.setCaseNumber(caseEntity.getCaseNumber());
            dto.setReportId(caseEntity.getReport() != null ? caseEntity.getReport().getId() : null);
            dto.setReportTitle(caseEntity.getReport() != null ? caseEntity.getReport().getTitle() : null);
            dto.setEvidenceId(caseEntity.getEvidence() != null ? caseEntity.getEvidence().getId() : null);
            dto.setEvidenceUrl(caseEntity.getEvidence() != null ? caseEntity.getEvidence().getFileUrl() : null);
            dto.setEvidenceHash(caseEntity.getEvidence() != null ? caseEntity.getEvidence().getEvidenceHash() : null);
            dto.setAssignedOfficerId(caseEntity.getAssignedOfficer() != null ? caseEntity.getAssignedOfficer().getId() : null);
            dto.setAssignedOfficerName(caseEntity.getAssignedOfficer() != null ? caseEntity.getAssignedOfficer().getName() : null);
            dto.setViolationType(caseEntity.getViolationType());
            dto.setCaseStatus(caseEntity.getCaseStatus());
            dto.setPriority(caseEntity.getPriority());
            dto.setLocation(caseEntity.getLocation());
            dto.setOpenedAt(caseEntity.getOpenedAt());
            dto.setInvestigatedAt(caseEntity.getInvestigatedAt());
            dto.setClosedAt(caseEntity.getClosedAt());
            return dto;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getCaseNumber() { return caseNumber; }
        public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

        public Long getReportId() { return reportId; }
        public void setReportId(Long reportId) { this.reportId = reportId; }

        public String getReportTitle() { return reportTitle; }
        public void setReportTitle(String reportTitle) { this.reportTitle = reportTitle; }

        public Long getEvidenceId() { return evidenceId; }
        public void setEvidenceId(Long evidenceId) { this.evidenceId = evidenceId; }

        public String getEvidenceUrl() { return evidenceUrl; }
        public void setEvidenceUrl(String evidenceUrl) { this.evidenceUrl = evidenceUrl; }

        public String getEvidenceHash() { return evidenceHash; }
        public void setEvidenceHash(String evidenceHash) { this.evidenceHash = evidenceHash; }

        public Long getAssignedOfficerId() { return assignedOfficerId; }
        public void setAssignedOfficerId(Long assignedOfficerId) { this.assignedOfficerId = assignedOfficerId; }

        public String getAssignedOfficerName() { return assignedOfficerName; }
        public void setAssignedOfficerName(String assignedOfficerName) { this.assignedOfficerName = assignedOfficerName; }

        public String getViolationType() { return violationType; }
        public void setViolationType(String violationType) { this.violationType = violationType; }

        public EnforcementCaseStatus getCaseStatus() { return caseStatus; }
        public void setCaseStatus(EnforcementCaseStatus caseStatus) { this.caseStatus = caseStatus; }

        public Priority getPriority() { return priority; }
        public void setPriority(Priority priority) { this.priority = priority; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public LocalDateTime getOpenedAt() { return openedAt; }
        public void setOpenedAt(LocalDateTime openedAt) { this.openedAt = openedAt; }

        public LocalDateTime getInvestigatedAt() { return investigatedAt; }
        public void setInvestigatedAt(LocalDateTime investigatedAt) { this.investigatedAt = investigatedAt; }

        public LocalDateTime getClosedAt() { return closedAt; }
        public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }

        public OffenderDTO getOffender() { return offender; }
        public void setOffender(OffenderDTO offender) { this.offender = offender; }

        public FineDTO getFine() { return fine; }
        public void setFine(FineDTO fine) { this.fine = fine; }

        public RewardDTOs.RewardDTO getReward() { return reward; }
        public void setReward(RewardDTOs.RewardDTO reward) { this.reward = reward; }
    }

    public static class CreateEnforcementCaseRequest {
        private Long reportId;
        private Long evidenceId;
        private String violationType;
        private String location;

        public Long getReportId() { return reportId; }
        public void setReportId(Long reportId) { this.reportId = reportId; }

        public Long getEvidenceId() { return evidenceId; }
        public void setEvidenceId(Long evidenceId) { this.evidenceId = evidenceId; }

        public String getViolationType() { return violationType; }
        public void setViolationType(String violationType) { this.violationType = violationType; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
    }

    public static class OffenderDTO {
        private Long id;
        private Long enforcementCaseId;
        private String identityStatus;
        private String identificationMethod;
        private String maskedReference;
        private String vehicleReference;
        private String verificationSource;
        private String verifiedByName;
        private LocalDateTime verifiedAt;

        public static OffenderDTO fromEntity(Offender offender) {
            OffenderDTO dto = new OffenderDTO();
            dto.setId(offender.getId());
            dto.setEnforcementCaseId(offender.getEnforcementCaseId());
            dto.setIdentityStatus(offender.getIdentityStatus());
            dto.setIdentificationMethod(offender.getIdentificationMethod());
            dto.setMaskedReference(offender.getMaskedReference());
            dto.setVehicleReference(offender.getVehicleReference());
            dto.setVerificationSource(offender.getVerificationSource());
            dto.setVerifiedByName(offender.getVerifiedBy() != null ? offender.getVerifiedBy().getName() : null);
            dto.setVerifiedAt(offender.getVerifiedAt());
            return dto;
        }

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

        public String getVerifiedByName() { return verifiedByName; }
        public void setVerifiedByName(String verifiedByName) { this.verifiedByName = verifiedByName; }

        public LocalDateTime getVerifiedAt() { return verifiedAt; }
        public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
    }

    public static class InvestigationNoteDTO {
        private Long id;
        private Long enforcementCaseId;
        private String officerName;
        private String note;
        private Boolean isInternal;
        private LocalDateTime createdAt;

        public static InvestigationNoteDTO fromEntity(InvestigationNote noteEntity) {
            InvestigationNoteDTO dto = new InvestigationNoteDTO();
            dto.setId(noteEntity.getId());
            dto.setEnforcementCaseId(noteEntity.getEnforcementCaseId());
            dto.setOfficerName(noteEntity.getOfficer() != null ? noteEntity.getOfficer().getName() : "Authority Officer");
            dto.setNote(noteEntity.getNote());
            dto.setIsInternal(noteEntity.getIsInternal());
            dto.setCreatedAt(noteEntity.getCreatedAt());
            return dto;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getEnforcementCaseId() { return enforcementCaseId; }
        public void setEnforcementCaseId(Long enforcementCaseId) { this.enforcementCaseId = enforcementCaseId; }

        public String getOfficerName() { return officerName; }
        public void setOfficerName(String officerName) { this.officerName = officerName; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }

        public Boolean getIsInternal() { return isInternal; }
        public void setIsInternal(Boolean isInternal) { this.isInternal = isInternal; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class FineDTO {
        private Long id;
        private Long enforcementCaseId;
        private String challanNumber;
        private String violationType;
        private Double fineAmount;
        private String currency;
        private String issuedByName;
        private LocalDateTime issuedAt;
        private LocalDateTime dueDate;
        private FineStatus paymentStatus;
        private LocalDateTime paidAt;
        private String externalReference;

        public static FineDTO fromEntity(Fine fine) {
            FineDTO dto = new FineDTO();
            dto.setId(fine.getId());
            dto.setEnforcementCaseId(fine.getEnforcementCaseId());
            dto.setChallanNumber(fine.getChallanNumber());
            dto.setViolationType(fine.getViolationType());
            dto.setFineAmount(fine.getFineAmount());
            dto.setCurrency(fine.getCurrency());
            dto.setIssuedByName(fine.getIssuedBy() != null ? fine.getIssuedBy().getName() : null);
            dto.setIssuedAt(fine.getIssuedAt());
            dto.setDueDate(fine.getDueDate());
            dto.setPaymentStatus(fine.getPaymentStatus());
            dto.setPaidAt(fine.getPaidAt());
            dto.setExternalReference(fine.getExternalReference());
            return dto;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getEnforcementCaseId() { return enforcementCaseId; }
        public void setEnforcementCaseId(Long enforcementCaseId) { this.enforcementCaseId = enforcementCaseId; }

        public String getChallanNumber() { return challanNumber; }
        public void setChallanNumber(String challanNumber) { this.challanNumber = challanNumber; }

        public String getViolationType() { return violationType; }
        public void setViolationType(String violationType) { this.violationType = violationType; }

        public Double getFineAmount() { return fineAmount; }
        public void setFineAmount(Double fineAmount) { this.fineAmount = fineAmount; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getIssuedByName() { return issuedByName; }
        public void setIssuedByName(String issuedByName) { this.issuedByName = issuedByName; }

        public LocalDateTime getIssuedAt() { return issuedAt; }
        public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

        public LocalDateTime getDueDate() { return dueDate; }
        public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

        public FineStatus getPaymentStatus() { return paymentStatus; }
        public void setPaymentStatus(FineStatus paymentStatus) { this.paymentStatus = paymentStatus; }

        public LocalDateTime getPaidAt() { return paidAt; }
        public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

        public String getExternalReference() { return externalReference; }
        public void setExternalReference(String externalReference) { this.externalReference = externalReference; }
    }

    public static class IssueChallanRequest {
        private String violationType;
        private Double fineAmount;
        private String externalReference;

        public String getViolationType() { return violationType; }
        public void setViolationType(String violationType) { this.violationType = violationType; }

        public Double getFineAmount() { return fineAmount; }
        public void setFineAmount(Double fineAmount) { this.fineAmount = fineAmount; }

        public String getExternalReference() { return externalReference; }
        public void setExternalReference(String externalReference) { this.externalReference = externalReference; }
    }
}
