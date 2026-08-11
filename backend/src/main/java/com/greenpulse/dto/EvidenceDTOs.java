package com.greenpulse.dto;

import com.greenpulse.entity.Evidence;
import com.greenpulse.entity.EvidenceSourceType;
import com.greenpulse.entity.EvidenceStatus;

import java.time.LocalDateTime;

public class EvidenceDTOs {

    public static class EvidenceDTO {
        private Long id;
        private String evidenceNumber;
        private Long reportId;
        private EvidenceSourceType sourceType;
        private Long submittedById;
        private String submittedByName;
        private LocalDateTime capturedAt;
        private Double latitude;
        private Double longitude;
        private String fileUrl;
        private String thumbnailUrl;
        private String description;
        private String evidenceHash;
        private EvidenceStatus verificationStatus;
        private String verifiedByName;
        private LocalDateTime verifiedAt;
        private String rejectionReason;
        private LocalDateTime createdAt;

        public static EvidenceDTO fromEntity(Evidence evidence) {
            EvidenceDTO dto = new EvidenceDTO();
            dto.setId(evidence.getId());
            dto.setEvidenceNumber(evidence.getEvidenceNumber());
            dto.setReportId(evidence.getReportId());
            dto.setSourceType(evidence.getSourceType());
            dto.setSubmittedById(evidence.getSubmittedBy() != null ? evidence.getSubmittedBy().getId() : null);
            dto.setSubmittedByName(evidence.getSubmittedBy() != null ? evidence.getSubmittedBy().getName() : "Anonymous");
            dto.setCapturedAt(evidence.getCapturedAt());
            dto.setLatitude(evidence.getLatitude());
            dto.setLongitude(evidence.getLongitude());
            dto.setFileUrl(evidence.getFileUrl());
            dto.setThumbnailUrl(evidence.getThumbnailUrl());
            dto.setDescription(evidence.getDescription());
            dto.setEvidenceHash(evidence.getEvidenceHash());
            dto.setVerificationStatus(evidence.getVerificationStatus());
            dto.setVerifiedByName(evidence.getVerifiedBy() != null ? evidence.getVerifiedBy().getName() : null);
            dto.setVerifiedAt(evidence.getVerifiedAt());
            dto.setRejectionReason(evidence.getRejectionReason());
            dto.setCreatedAt(evidence.getCreatedAt());
            return dto;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEvidenceNumber() { return evidenceNumber; }
        public void setEvidenceNumber(String evidenceNumber) { this.evidenceNumber = evidenceNumber; }

        public Long getReportId() { return reportId; }
        public void setReportId(Long reportId) { this.reportId = reportId; }

        public EvidenceSourceType getSourceType() { return sourceType; }
        public void setSourceType(EvidenceSourceType sourceType) { this.sourceType = sourceType; }

        public Long getSubmittedById() { return submittedById; }
        public void setSubmittedById(Long submittedById) { this.submittedById = submittedById; }

        public String getSubmittedByName() { return submittedByName; }
        public void setSubmittedByName(String submittedByName) { this.submittedByName = submittedByName; }

        public LocalDateTime getCapturedAt() { return capturedAt; }
        public void setCapturedAt(LocalDateTime capturedAt) { this.capturedAt = capturedAt; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getEvidenceHash() { return evidenceHash; }
        public void setEvidenceHash(String evidenceHash) { this.evidenceHash = evidenceHash; }

        public EvidenceStatus getVerificationStatus() { return verificationStatus; }
        public void setVerificationStatus(EvidenceStatus verificationStatus) { this.verificationStatus = verificationStatus; }

        public String getVerifiedByName() { return verifiedByName; }
        public void setVerifiedByName(String verifiedByName) { this.verifiedByName = verifiedByName; }

        public LocalDateTime getVerifiedAt() { return verifiedAt; }
        public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

        public String getRejectionReason() { return rejectionReason; }
        public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class SubmitEvidenceRequest {
        private Long reportId;
        private EvidenceSourceType sourceType = EvidenceSourceType.CITIZEN_PHOTO;
        private Double latitude;
        private Double longitude;
        private String fileUrl;
        private String description;

        public Long getReportId() { return reportId; }
        public void setReportId(Long reportId) { this.reportId = reportId; }

        public EvidenceSourceType getSourceType() { return sourceType; }
        public void setSourceType(EvidenceSourceType sourceType) { this.sourceType = sourceType; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public String getFileUrl() { return fileUrl; }
        public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    public static class VerifyEvidenceRequest {
        private EvidenceStatus status;
        private String rejectionReason;

        public EvidenceStatus getStatus() { return status; }
        public void setStatus(EvidenceStatus status) { this.status = status; }

        public String getRejectionReason() { return rejectionReason; }
        public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    }
}
