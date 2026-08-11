package com.greenpulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_status_history")
public class ReportStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_id", nullable = false)
    private Long reportId;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 30)
    private ReportStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30)
    private ReportStatus newStatus;

    @Column(name = "changed_by", nullable = false)
    private Long changedBy;

    @Column(length = 500)
    private String comment;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ReportStatusHistory() {}

    public ReportStatusHistory(Long reportId, ReportStatus oldStatus, ReportStatus newStatus, Long changedBy, String comment) {
        this.reportId = reportId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
        this.comment = comment;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getReportId() { return reportId; }
    public void setReportId(Long reportId) { this.reportId = reportId; }

    public ReportStatus getOldStatus() { return oldStatus; }
    public void setOldStatus(ReportStatus oldStatus) { this.oldStatus = oldStatus; }

    public ReportStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ReportStatus newStatus) { this.newStatus = newStatus; }

    public Long getChangedBy() { return changedBy; }
    public void setChangedBy(Long changedBy) { this.changedBy = changedBy; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
