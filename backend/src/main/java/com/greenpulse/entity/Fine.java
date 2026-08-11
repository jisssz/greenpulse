package com.greenpulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fines")
public class Fine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "enforcement_case_id", nullable = false, unique = true)
    private Long enforcementCaseId;

    @Column(name = "challan_number", nullable = false, unique = true, length = 30)
    private String challanNumber;

    @Column(name = "violation_type", nullable = false, length = 100)
    private String violationType;

    @Column(name = "fine_amount", nullable = false)
    private Double fineAmount;

    @Column(length = 10)
    private String currency = "INR";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "issued_by", nullable = false)
    private User issuedBy;

    @Column(name = "issued_at", updatable = false)
    private LocalDateTime issuedAt = LocalDateTime.now();

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 30)
    private FineStatus paymentStatus = FineStatus.ISSUED;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "external_reference", length = 100)
    private String externalReference;

    public Fine() {}

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

    public User getIssuedBy() { return issuedBy; }
    public void setIssuedBy(User issuedBy) { this.issuedBy = issuedBy; }

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
