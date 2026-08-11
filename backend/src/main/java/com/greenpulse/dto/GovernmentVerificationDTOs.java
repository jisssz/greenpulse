package com.greenpulse.dto;

import com.greenpulse.entity.GovernmentVerification;

import java.time.LocalDateTime;

public class GovernmentVerificationDTOs {

    public static class GovernmentVerificationDTO {
        private Long id;
        private Long enforcementCaseId;
        private String verificationType;
        private String provider;
        private String externalReference;
        private String verificationStatus;
        private LocalDateTime requestedAt;
        private LocalDateTime completedAt;
        private String requestedByName;

        public static GovernmentVerificationDTO fromEntity(GovernmentVerification gv) {
            GovernmentVerificationDTO dto = new GovernmentVerificationDTO();
            dto.setId(gv.getId());
            dto.setEnforcementCaseId(gv.getEnforcementCaseId());
            dto.setVerificationType(gv.getVerificationType());
            dto.setProvider(gv.getProvider());
            dto.setExternalReference(gv.getExternalReference());
            dto.setVerificationStatus(gv.getVerificationStatus());
            dto.setRequestedAt(gv.getRequestedAt());
            dto.setCompletedAt(gv.getCompletedAt());
            dto.setRequestedByName(gv.getRequestedBy() != null ? gv.getRequestedBy().getName() : null);
            return dto;
        }

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

        public String getRequestedByName() { return requestedByName; }
        public void setRequestedByName(String requestedByName) { this.requestedByName = requestedByName; }
    }

    public static class MockVerificationRequest {
        private String verificationType; // e.g. VEHICLE_REGISTRATION, COMMERCIAL_REGISTRATION
        private String queryReference; // e.g. KA-01-EQ-9921

        public String getVerificationType() { return verificationType; }
        public void setVerificationType(String verificationType) { this.verificationType = verificationType; }

        public String getQueryReference() { return queryReference; }
        public void setQueryReference(String queryReference) { this.queryReference = queryReference; }
    }

    public static class MockVerificationResponse {
        private String verificationStatus;
        private String source;
        private String reference;
        private String maskedIdentity;
        private String notice;

        public MockVerificationResponse(String verificationStatus, String source, String reference, String maskedIdentity, String notice) {
            this.verificationStatus = verificationStatus;
            this.source = source;
            this.reference = reference;
            this.maskedIdentity = maskedIdentity;
            this.notice = notice;
        }

        public String getVerificationStatus() { return verificationStatus; }
        public String getSource() { return source; }
        public String getReference() { return reference; }
        public String getMaskedIdentity() { return maskedIdentity; }
        public String getNotice() { return notice; }
    }
}
