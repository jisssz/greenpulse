package com.greenpulse.dto;

import com.greenpulse.entity.ImageType;
import com.greenpulse.entity.Priority;
import com.greenpulse.entity.ReportStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class ReportDTOs {

    public static class CreateReportRequest {
        @NotBlank(message = "Title is required")
        @Size(min = 5, max = 150, message = "Title must be between 5 and 150 characters")
        private String title;

        @NotBlank(message = "Description is required")
        @Size(min = 20, message = "Description must be at least 20 characters long")
        private String description;

        @NotNull(message = "Category ID is required")
        private Long categoryId;

        @NotNull(message = "Latitude is required")
        private Double latitude;

        @NotNull(message = "Longitude is required")
        private Double longitude;

        @NotBlank(message = "Address is required")
        private String address;

        private String imageUrl;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    public static class UpdateStatusRequest {
        @NotNull(message = "Status is required")
        private ReportStatus status;

        private String comment;

        public ReportStatus getStatus() { return status; }
        public void setStatus(ReportStatus status) { this.status = status; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class PriorityUpdateRequest {
        @NotNull(message = "Priority is required")
        private Priority priority;

        private String comment;

        public Priority getPriority() { return priority; }
        public void setPriority(Priority priority) { this.priority = priority; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class AssignWorkerRequest {
        @NotNull(message = "Worker ID is required")
        private Long workerId;

        private String comment;

        public Long getWorkerId() { return workerId; }
        public void setWorkerId(Long workerId) { this.workerId = workerId; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class ResolutionRequest {
        private String resolutionNotes;
        private String afterImageUrl;

        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

        public String getAfterImageUrl() { return afterImageUrl; }
        public void setAfterImageUrl(String afterImageUrl) { this.afterImageUrl = afterImageUrl; }
    }

    public static class ResolutionVerificationRequest {
        @NotNull(message = "Resolution confirmation is required")
        private Boolean isResolved;

        private String feedback;

        public Boolean getIsResolved() { return isResolved; }
        public void setIsResolved(Boolean isResolved) { this.isResolved = isResolved; }

        public String getFeedback() { return feedback; }
        public void setFeedback(String feedback) { this.feedback = feedback; }
    }

    public static class ReportDTO {
        private Long id;
        private String reportNumber;
        private String title;
        private String description;
        private Long categoryId;
        private String categoryName;
        private String categoryIcon;
        private Long citizenId;
        private String citizenName;
        private String citizenEmail;
        private Long assignedToId;
        private String assignedToName;
        private Double latitude;
        private Double longitude;
        private String address;
        private Priority priority;
        private ReportStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime verifiedAt;
        private LocalDateTime resolvedAt;
        private LocalDateTime closedAt;
        private String thumbnailUrl;
        private List<ReportImageDTO> images;

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getReportNumber() { return reportNumber; }
        public void setReportNumber(String reportNumber) { this.reportNumber = reportNumber; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

        public String getCategoryIcon() { return categoryIcon; }
        public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }

        public Long getCitizenId() { return citizenId; }
        public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }

        public String getCitizenName() { return citizenName; }
        public void setCitizenName(String citizenName) { this.citizenName = citizenName; }

        public String getCitizenEmail() { return citizenEmail; }
        public void setCitizenEmail(String citizenEmail) { this.citizenEmail = citizenEmail; }

        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }

        public String getAssignedToName() { return assignedToName; }
        public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public Priority getPriority() { return priority; }
        public void setPriority(Priority priority) { this.priority = priority; }

        public ReportStatus getStatus() { return status; }
        public void setStatus(ReportStatus status) { this.status = status; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

        public LocalDateTime getVerifiedAt() { return verifiedAt; }
        public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }

        public LocalDateTime getResolvedAt() { return resolvedAt; }
        public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

        public LocalDateTime getClosedAt() { return closedAt; }
        public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public List<ReportImageDTO> getImages() { return images; }
        public void setImages(List<ReportImageDTO> images) { this.images = images; }
    }

    public static class ReportImageDTO {
        private Long id;
        private String imageUrl;
        private ImageType imageType;
        private Long uploadedBy;
        private LocalDateTime createdAt;

        public ReportImageDTO() {}

        public ReportImageDTO(Long id, String imageUrl, ImageType imageType, Long uploadedBy, LocalDateTime createdAt) {
            this.id = id;
            this.imageUrl = imageUrl;
            this.imageType = imageType;
            this.uploadedBy = uploadedBy;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public ImageType getImageType() { return imageType; }
        public void setImageType(ImageType imageType) { this.imageType = imageType; }

        public Long getUploadedBy() { return uploadedBy; }
        public void setUploadedBy(Long uploadedBy) { this.uploadedBy = uploadedBy; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class StatusHistoryDTO {
        private Long id;
        private ReportStatus oldStatus;
        private ReportStatus newStatus;
        private Long changedBy;
        private String changedByName;
        private String comment;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public ReportStatus getOldStatus() { return oldStatus; }
        public void setOldStatus(ReportStatus oldStatus) { this.oldStatus = oldStatus; }

        public ReportStatus getNewStatus() { return newStatus; }
        public void setNewStatus(ReportStatus newStatus) { this.newStatus = newStatus; }

        public Long getChangedBy() { return changedBy; }
        public void setChangedBy(Long changedBy) { this.changedBy = changedBy; }

        public String getChangedByName() { return changedByName; }
        public void setChangedByName(String changedByName) { this.changedByName = changedByName; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
