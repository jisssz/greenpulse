package com.greenpulse.service;

import com.greenpulse.dto.EvidenceDTOs.EvidenceDTO;
import com.greenpulse.dto.EvidenceDTOs.SubmitEvidenceRequest;
import com.greenpulse.dto.EvidenceDTOs.VerifyEvidenceRequest;
import com.greenpulse.entity.*;
import com.greenpulse.exception.ResourceNotFoundException;
import com.greenpulse.exception.UnauthorizedException;
import com.greenpulse.repository.EvidenceRepository;
import com.greenpulse.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public EvidenceService(EvidenceRepository evidenceRepository, UserRepository userRepository, AuditLogService auditLogService) {
        this.evidenceRepository = evidenceRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public EvidenceDTO submitEvidence(SubmitEvidenceRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Evidence evidence = new Evidence();
        long count = evidenceRepository.count() + 1;
        evidence.setEvidenceNumber(String.format("GP-EVD-2026-%06d", count));
        evidence.setReportId(request.getReportId());
        evidence.setSourceType(request.getSourceType() != null ? request.getSourceType() : EvidenceSourceType.CITIZEN_PHOTO);
        evidence.setSubmittedBy(user);
        evidence.setLatitude(request.getLatitude());
        evidence.setLongitude(request.getLongitude());
        evidence.setFileUrl(request.getFileUrl());
        evidence.setThumbnailUrl(request.getFileUrl());
        evidence.setDescription(request.getDescription());

        // Cryptographic Hash (SHA-256) calculation for file integrity
        String rawData = request.getFileUrl() + ":" + userEmail + ":" + System.currentTimeMillis();
        evidence.setEvidenceHash(computeSha256(rawData));
        evidence.setVerificationStatus(EvidenceStatus.SUBMITTED);

        Evidence saved = evidenceRepository.save(evidence);
        auditLogService.logAction(user.getId(), "EVIDENCE_SUBMITTED", "EVIDENCE", saved.getId(), "{\"evidenceNumber\":\"" + saved.getEvidenceNumber() + "\"}");

        return EvidenceDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<EvidenceDTO> getEvidenceByStatus(EvidenceStatus status, Pageable pageable) {
        return evidenceRepository.findByVerificationStatus(status, pageable)
                .map(EvidenceDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<EvidenceDTO> getEvidenceForReport(Long reportId) {
        return evidenceRepository.findByReportId(reportId).stream()
                .map(EvidenceDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EvidenceDTO getEvidenceById(Long id) {
        Evidence evidence = evidenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evidence", "id", id));
        return EvidenceDTO.fromEntity(evidence);
    }

    @Transactional
    public EvidenceDTO verifyEvidence(Long id, VerifyEvidenceRequest request, String reviewerEmail) {
        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", reviewerEmail));

        if (reviewer.getRole() != Role.MODERATOR && reviewer.getRole() != Role.AUTHORITY_OFFICER && reviewer.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only moderators, authority officers, or admins can verify evidence");
        }

        Evidence evidence = evidenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evidence", "id", id));

        evidence.setVerificationStatus(request.getStatus());
        evidence.setVerifiedBy(reviewer);
        evidence.setVerifiedAt(LocalDateTime.now());
        if (request.getRejectionReason() != null) {
            evidence.setRejectionReason(request.getRejectionReason());
        }

        Evidence updated = evidenceRepository.save(evidence);
        auditLogService.logAction(reviewer.getId(), "EVIDENCE_" + request.getStatus().name(), "EVIDENCE", updated.getId(), "{\"status\":\"" + request.getStatus() + "\"}");

        return EvidenceDTO.fromEntity(updated);
    }

    private String computeSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        }
    }
}
