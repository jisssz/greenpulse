package com.greenpulse.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class CommentDTOs {

    public static class CreateCommentRequest {
        @NotBlank(message = "Comment cannot be empty")
        private String comment;

        private Boolean isInternal = false;

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }

        public Boolean getIsInternal() { return isInternal; }
        public void setIsInternal(Boolean isInternal) { this.isInternal = isInternal; }
    }

    public static class CommentDTO {
        private Long id;
        private Long reportId;
        private Long userId;
        private String userName;
        private String userRole;
        private String comment;
        private Boolean isInternal;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public Long getReportId() { return reportId; }
        public void setReportId(Long reportId) { this.reportId = reportId; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }

        public String getUserRole() { return userRole; }
        public void setUserRole(String userRole) { this.userRole = userRole; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }

        public Boolean getIsInternal() { return isInternal; }
        public void setIsInternal(Boolean isInternal) { this.isInternal = isInternal; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
