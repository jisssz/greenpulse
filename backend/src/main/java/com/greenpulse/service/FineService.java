package com.greenpulse.service;

import com.greenpulse.dto.EnforcementDTOs.FineDTO;
import com.greenpulse.dto.EnforcementDTOs.IssueChallanRequest;
import com.greenpulse.entity.*;
import com.greenpulse.exception.ResourceNotFoundException;
import com.greenpulse.exception.UnauthorizedException;
import com.greenpulse.repository.EnforcementCaseRepository;
import com.greenpulse.repository.FineRepository;
import com.greenpulse.repository.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class FineService {

    private final FineRepository fineRepository;
    private final EnforcementCaseRepository enforcementCaseRepository;
    private final UserRepository userRepository;
    private final RewardService rewardService;
    private final AuditLogService auditLogService;

    public FineService(FineRepository fineRepository,
                       EnforcementCaseRepository enforcementCaseRepository,
                       UserRepository userRepository,
                       @Lazy RewardService rewardService,
                       AuditLogService auditLogService) {
        this.fineRepository = fineRepository;
        this.enforcementCaseRepository = enforcementCaseRepository;
        this.userRepository = userRepository;
        this.rewardService = rewardService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public FineDTO issueChallan(Long caseId, IssueChallanRequest request, String officerEmail) {
        User officer = userRepository.findByEmail(officerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", officerEmail));

        if (officer.getRole() != Role.AUTHORITY_OFFICER && officer.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only authority officers can issue fines/challans");
        }

        EnforcementCase c = enforcementCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("EnforcementCase", "id", caseId));

        Fine fine = fineRepository.findByEnforcementCaseId(caseId).orElse(new Fine());
        fine.setEnforcementCaseId(caseId);
        long count = fineRepository.count() + 1;
        fine.setChallanNumber(String.format("GP-CHL-2026-%06d", count));
        fine.setViolationType(request.getViolationType() != null ? request.getViolationType() : c.getViolationType());
        fine.setFineAmount(request.getFineAmount() != null ? request.getFineAmount() : 1000.0);
        fine.setCurrency("INR");
        fine.setIssuedBy(officer);
        fine.setDueDate(LocalDateTime.now().plusDays(15));
        fine.setPaymentStatus(FineStatus.ISSUED);
        fine.setExternalReference(request.getExternalReference() != null ? request.getExternalReference() : "DEMO-EXT-CHL-" + count);

        Fine saved = fineRepository.save(fine);

        c.setCaseStatus(EnforcementCaseStatus.FINE_ISSUED);
        enforcementCaseRepository.save(c);

        auditLogService.logAction(officer.getId(), "CHALLAN_ISSUED", "FINE", saved.getId(), "{\"challanNumber\":\"" + saved.getChallanNumber() + "\", \"amount\":" + saved.getFineAmount() + "}");

        return FineDTO.fromEntity(saved);
    }

    @Transactional
    public FineDTO markFinePaid(Long fineId, String paymentRef, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Fine", "id", fineId));

        fine.setPaymentStatus(FineStatus.PAID);
        fine.setPaidAt(LocalDateTime.now());
        fine.setExternalReference(paymentRef != null ? paymentRef : "DEMO-PAY-2026-" + System.currentTimeMillis());
        Fine saved = fineRepository.save(fine);

        EnforcementCase c = enforcementCaseRepository.findById(fine.getEnforcementCaseId()).orElse(null);
        if (c != null) {
            c.setCaseStatus(EnforcementCaseStatus.FINE_PAID);
            enforcementCaseRepository.save(c);
        }

        auditLogService.logAction(user.getId(), "FINE_PAID", "FINE", saved.getId(), "{\"ref\":\"" + fine.getExternalReference() + "\"}");

        // TRIGGER REWARD CALCULATION FOR CITIZEN CONTRIBUTOR
        if (c != null) {
            rewardService.calculateAndCreateReward(c.getId(), saved.getId());
        }

        return FineDTO.fromEntity(saved);
    }
}
