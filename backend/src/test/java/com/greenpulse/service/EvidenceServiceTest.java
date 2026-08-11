package com.greenpulse.service;

import com.greenpulse.dto.EvidenceDTOs.EvidenceDTO;
import com.greenpulse.dto.EvidenceDTOs.SubmitEvidenceRequest;
import com.greenpulse.dto.EvidenceDTOs.VerifyEvidenceRequest;
import com.greenpulse.entity.*;
import com.greenpulse.repository.EvidenceRepository;
import com.greenpulse.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EvidenceServiceTest {

    @Mock
    private EvidenceRepository evidenceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private EvidenceService evidenceService;

    private User citizen;
    private User officer;

    @BeforeEach
    void setUp() {
        citizen = new User(4L, "Jane Doe", "citizen@greenpulse.demo", "hash", "+123", Role.CITIZEN);
        officer = new User(7L, "Vikram Roy", "officer@greenpulse.demo", "hash", "+123", Role.AUTHORITY_OFFICER);
    }

    @Test
    void testSubmitEvidence_ComputesSha256Hash() {
        SubmitEvidenceRequest request = new SubmitEvidenceRequest();
        request.setReportId(1L);
        request.setFileUrl("/uploads/illegal_dumping.jpg");
        request.setSourceType(EvidenceSourceType.CITIZEN_PHOTO);
        request.setDescription("Illegal dumping evidence");

        when(userRepository.findByEmail("citizen@greenpulse.demo")).thenReturn(Optional.of(citizen));
        when(evidenceRepository.count()).thenReturn(0L);
        when(evidenceRepository.save(any(Evidence.class))).thenAnswer(invocation -> {
            Evidence e = invocation.getArgument(0);
            e.setId(10L);
            return e;
        });

        EvidenceDTO result = evidenceService.submitEvidence(request, "citizen@greenpulse.demo");

        assertNotNull(result);
        assertEquals("GP-EVD-2026-000001", result.getEvidenceNumber());
        assertNotNull(result.getEvidenceHash());
        assertEquals(64, result.getEvidenceHash().length()); // SHA-256 hex string length
        assertEquals(EvidenceStatus.SUBMITTED, result.getVerificationStatus());
    }

    @Test
    void testVerifyEvidence_AuthorityOfficer() {
        Evidence evidence = new Evidence();
        evidence.setId(10L);
        evidence.setEvidenceNumber("GP-EVD-2026-000001");
        evidence.setSubmittedBy(citizen);
        evidence.setVerificationStatus(EvidenceStatus.SUBMITTED);
        evidence.setEvidenceHash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");

        VerifyEvidenceRequest verifyReq = new VerifyEvidenceRequest();
        verifyReq.setStatus(EvidenceStatus.VERIFIED);

        when(userRepository.findByEmail("officer@greenpulse.demo")).thenReturn(Optional.of(officer));
        when(evidenceRepository.findById(10L)).thenReturn(Optional.of(evidence));
        when(evidenceRepository.save(any(Evidence.class))).thenAnswer(inv -> inv.getArgument(0));

        EvidenceDTO result = evidenceService.verifyEvidence(10L, verifyReq, "officer@greenpulse.demo");

        assertNotNull(result);
        assertEquals(EvidenceStatus.VERIFIED, result.getVerificationStatus());
        assertEquals("Vikram Roy", result.getVerifiedByName());
    }
}
