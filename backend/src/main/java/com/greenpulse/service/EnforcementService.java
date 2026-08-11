package com.greenpulse.service;

import com.greenpulse.dto.EnforcementDTOs.*;
import com.greenpulse.dto.GovernmentVerificationDTOs.MockVerificationResponse;
import com.greenpulse.dto.RewardDTOs.RewardDTO;
import com.greenpulse.entity.*;
import com.greenpulse.exception.ResourceNotFoundException;
import com.greenpulse.exception.UnauthorizedException;
import com.greenpulse.repository.*;
import com.greenpulse.service.integration.GovernmentIntegrationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnforcementService {

    private final EnforcementCaseRepository enforcementCaseRepository;
    private final EvidenceRepository evidenceRepository;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final OffenderRepository offenderRepository;
    private final InvestigationNoteRepository investigationNoteRepository;
    private final GovernmentVerificationRepository governmentVerificationRepository;
    private final FineRepository fineRepository;
    private final RewardRepository rewardRepository;
    private final GovernmentIntegrationService governmentIntegrationService;
    private final AuditLogService auditLogService;

    public EnforcementService(EnforcementCaseRepository enforcementCaseRepository,
                              EvidenceRepository evidenceRepository,
                              ReportRepository reportRepository,
                              UserRepository userRepository,
                              OffenderRepository offenderRepository,
                              InvestigationNoteRepository investigationNoteRepository,
                              GovernmentVerificationRepository governmentVerificationRepository,
                              FineRepository fineRepository,
                              RewardRepository rewardRepository,
                              GovernmentIntegrationService governmentIntegrationService,
                              AuditLogService auditLogService) {
        this.enforcementCaseRepository = enforcementCaseRepository;
        this.evidenceRepository = evidenceRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.offenderRepository = offenderRepository;
        this.investigationNoteRepository = investigationNoteRepository;
        this.governmentVerificationRepository = governmentVerificationRepository;
        this.fineRepository = fineRepository;
        this.rewardRepository = rewardRepository;
        this.governmentIntegrationService = governmentIntegrationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public EnforcementCaseDTO createCase(CreateEnforcementCaseRequest request, String officerEmail) {
        User officer = userRepository.findByEmail(officerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", officerEmail));

        if (officer.getRole() != Role.AUTHORITY_OFFICER && officer.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only authority officers or admins can create enforcement cases");
        }

        EnforcementCase enforcementCase = new EnforcementCase();
        long count = enforcementCaseRepository.count() + 1;
        enforcementCase.setCaseNumber(String.format("GP-ENF-2026-%06d", count));
        
        if (request.getReportId() != null) {
            Report report = reportRepository.findById(request.getReportId())
                    .orElseThrow(() -> new ResourceNotFoundException("Report", "id", request.getReportId()));
            enforcementCase.setReport(report);
        }
        
        if (request.getEvidenceId() != null) {
            Evidence evidence = evidenceRepository.findById(request.getEvidenceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Evidence", "id", request.getEvidenceId()));
            enforcementCase.setEvidence(evidence);
        }

        enforcementCase.setAssignedOfficer(officer);
        enforcementCase.setViolationType(request.getViolationType());
        enforcementCase.setLocation(request.getLocation());
        enforcementCase.setCaseStatus(EnforcementCaseStatus.OPEN);

        EnforcementCase saved = enforcementCaseRepository.save(enforcementCase);
        auditLogService.logAction(officer.getId(), "ENFORCEMENT_CASE_CREATED", "ENFORCEMENT_CASE", saved.getId(), "{\"caseNumber\":\"" + saved.getCaseNumber() + "\"}");

        return EnforcementCaseDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<EnforcementCaseDTO> getCases(EnforcementCaseStatus status, Pageable pageable) {
        Page<EnforcementCase> page = (status != null) ?
                enforcementCaseRepository.findByCaseStatus(status, pageable) :
                enforcementCaseRepository.findAll(pageable);

        return page.map(c -> {
            EnforcementCaseDTO dto = EnforcementCaseDTO.fromEntity(c);
            fineRepository.findByEnforcementCaseId(c.getId()).ifPresent(f -> dto.setFine(FineDTO.fromEntity(f)));
            rewardRepository.findByEnforcementCaseId(c.getId()).ifPresent(r -> dto.setReward(RewardDTO.fromEntity(r)));
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public EnforcementCaseDTO getCaseById(Long id, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));

        EnforcementCase c = enforcementCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EnforcementCase", "id", id));

        EnforcementCaseDTO dto = EnforcementCaseDTO.fromEntity(c);

        // Include fine & reward summary
        fineRepository.findByEnforcementCaseId(c.getId()).ifPresent(f -> dto.setFine(FineDTO.fromEntity(f)));
        rewardRepository.findByEnforcementCaseId(c.getId()).ifPresent(r -> dto.setReward(RewardDTO.fromEntity(r)));

        // Privacy rule: Only Authority Officers / Admins see offender data
        if (currentUser.getRole() == Role.AUTHORITY_OFFICER || currentUser.getRole() == Role.ADMIN) {
            offenderRepository.findByEnforcementCaseId(c.getId()).ifPresent(o -> dto.setOffender(OffenderDTO.fromEntity(o)));
        }

        return dto;
    }

    @Transactional
    public GovernmentVerification requestMockGovernmentVerification(Long caseId, String verificationType, String queryReference, String officerEmail) {
        User officer = userRepository.findByEmail(officerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", officerEmail));

        if (officer.getRole() != Role.AUTHORITY_OFFICER && officer.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only authority officers can perform government identity lookups");
        }

        EnforcementCase c = enforcementCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("EnforcementCase", "id", caseId));

        MockVerificationResponse mockResponse = governmentIntegrationService.verifyVehicleOrIdentity(verificationType, queryReference);

        GovernmentVerification gv = new GovernmentVerification();
        gv.setEnforcementCaseId(caseId);
        gv.setVerificationType(verificationType);
        gv.setProvider(mockResponse.getSource());
        gv.setExternalReference(mockResponse.getReference());
        gv.setVerificationStatus(mockResponse.getVerificationStatus());
        gv.setRequestedBy(officer);
        GovernmentVerification savedGv = governmentVerificationRepository.save(gv);

        // Update Offender Record with Masked Reference (No raw Aadhaar data)
        Offender offender = offenderRepository.findByEnforcementCaseId(caseId).orElse(new Offender());
        offender.setEnforcementCaseId(caseId);
        offender.setIdentityStatus("OFFENDER_IDENTIFIED");
        offender.setIdentificationMethod(verificationType);
        offender.setMaskedReference(mockResponse.getMaskedIdentity());
        offender.setVehicleReference(queryReference);
        offender.setVerifiedBy(officer);
        offender.setVerifiedAt(LocalDateTime.now());
        offenderRepository.save(offender);

        c.setCaseStatus(EnforcementCaseStatus.OFFENDER_IDENTIFIED);
        c.setInvestigatedAt(LocalDateTime.now());
        enforcementCaseRepository.save(c);

        auditLogService.logAction(officer.getId(), "GOVERNMENT_VERIFICATION_REQUESTED", "ENFORCEMENT_CASE", caseId, "{\"ref\":\"" + mockResponse.getReference() + "\"}");

        return savedGv;
    }

    @Transactional
    public InvestigationNoteDTO addNote(Long caseId, String noteText, Boolean isInternal, String officerEmail) {
        User officer = userRepository.findByEmail(officerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", officerEmail));

        if (officer.getRole() != Role.AUTHORITY_OFFICER && officer.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only authority officers or admins can add investigation notes");
        }

        InvestigationNote note = new InvestigationNote(caseId, officer, noteText, isInternal != null ? isInternal : true);
        InvestigationNote saved = investigationNoteRepository.save(note);

        return InvestigationNoteDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<InvestigationNoteDTO> getNotes(Long caseId, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));

        List<InvestigationNote> notes;
        if (currentUser.getRole() == Role.AUTHORITY_OFFICER || currentUser.getRole() == Role.ADMIN) {
            notes = investigationNoteRepository.findByEnforcementCaseIdOrderByCreatedAtAsc(caseId);
        } else {
            notes = investigationNoteRepository.findByEnforcementCaseIdAndIsInternalFalseOrderByCreatedAtAsc(caseId);
        }

        return notes.stream().map(InvestigationNoteDTO::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public EnforcementCaseDTO confirmViolation(Long caseId, String officerEmail) {
        User officer = userRepository.findByEmail(officerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", officerEmail));

        if (officer.getRole() != Role.AUTHORITY_OFFICER && officer.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only authority officers can confirm violations");
        }

        EnforcementCase c = enforcementCaseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("EnforcementCase", "id", caseId));

        c.setCaseStatus(EnforcementCaseStatus.VIOLATION_CONFIRMED);
        EnforcementCase updated = enforcementCaseRepository.save(c);

        auditLogService.logAction(officer.getId(), "VIOLATION_CONFIRMED", "ENFORCEMENT_CASE", caseId, null);

        return EnforcementCaseDTO.fromEntity(updated);
    }
}
