package com.greenpulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enforcement_cases")
public class EnforcementCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_number", nullable = false, unique = true, length = 30)
    private String caseNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "report_id")
    private Report report;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "evidence_id")
    private Evidence evidence;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_officer_id")
    private User assignedOfficer;

    @Column(name = "violation_type", nullable = false, length = 100)
    private String violationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "case_status", nullable = false, length = 40)
    private EnforcementCaseStatus caseStatus = EnforcementCaseStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Priority priority = Priority.HIGH;

    private String location;

    @Column(name = "opened_at", updatable = false)
    private LocalDateTime openedAt = LocalDateTime.now();

    @Column(name = "investigated_at")
    private LocalDateTime investigatedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public EnforcementCase() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

    public Report getReport() { return report; }
    public void setReport(Report report) { this.report = report; }

    public Evidence getEvidence() { return evidence; }
    public void setEvidence(Evidence evidence) { this.evidence = evidence; }

    public User getAssignedOfficer() { return assignedOfficer; }
    public void setAssignedOfficer(User assignedOfficer) { this.assignedOfficer = assignedOfficer; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
