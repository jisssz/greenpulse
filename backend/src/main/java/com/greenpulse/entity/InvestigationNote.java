package com.greenpulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "investigation_notes")
public class InvestigationNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enforcement_case_id", nullable = false)
    private Long enforcementCaseId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "officer_id", nullable = false)
    private User officer;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String note;

    @Column(name = "is_internal")
    private Boolean isInternal = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public InvestigationNote() {}

    public InvestigationNote(Long enforcementCaseId, User officer, String note, Boolean isInternal) {
        this.enforcementCaseId = enforcementCaseId;
        this.officer = officer;
        this.note = note;
        this.isInternal = isInternal;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEnforcementCaseId() { return enforcementCaseId; }
    public void setEnforcementCaseId(Long enforcementCaseId) { this.enforcementCaseId = enforcementCaseId; }

    public User getOfficer() { return officer; }
    public void setOfficer(User officer) { this.officer = officer; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Boolean getIsInternal() { return isInternal; }
    public void setIsInternal(Boolean isInternal) { this.isInternal = isInternal; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
