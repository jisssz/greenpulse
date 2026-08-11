package com.greenpulse.service;

import com.greenpulse.dto.EnforcementDTOs.CreateEnforcementCaseRequest;
import com.greenpulse.dto.EnforcementDTOs.EnforcementCaseDTO;
import com.greenpulse.dto.GovernmentVerificationDTOs.MockVerificationResponse;
import com.greenpulse.entity.*;
import com.greenpulse.repository.*;
import com.greenpulse.service.integration.GovernmentIntegrationService;
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
public class EnforcementServiceTest {

    @Mock
    private EnforcementCaseRepository enforcementCaseRepository;
    @Mock
    private EvidenceRepository evidenceRepository;
    @Mock
    private ReportRepository reportRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OffenderRepository offenderRepository;
    @Mock
    private InvestigationNoteRepository investigationNoteRepository;
    @Mock
    private GovernmentVerificationRepository governmentVerificationRepository;
    @Mock
    private FineRepository fineRepository;
    @Mock
    private RewardRepository rewardRepository;
    @Mock
    private GovernmentIntegrationService governmentIntegrationService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private EnforcementService enforcementService;

    private User officer;
    private Report report;

    @BeforeEach
    void setUp() {
        officer = new User(7L, "Vikram Roy", "officer@greenpulse.demo", "hash", "+123", Role.AUTHORITY_OFFICER);
        report = new Report();
        report.setId(1L);
        report.setTitle("Illegal Waste Dumping");
    }

    @Test
    void testCreateCase_GeneratesCaseNumber() {
        CreateEnforcementCaseRequest req = new CreateEnforcementCaseRequest();
        req.setReportId(1L);
        req.setViolationType("Illegal Industrial Waste Dumping");
        req.setLocation("100 Park Boulevard");

        when(userRepository.findByEmail("officer@greenpulse.demo")).thenReturn(Optional.of(officer));
        when(reportRepository.findById(1L)).thenReturn(Optional.of(report));
        when(enforcementCaseRepository.count()).thenReturn(0L);
        when(enforcementCaseRepository.save(any(EnforcementCase.class))).thenAnswer(inv -> {
            EnforcementCase ec = inv.getArgument(0);
            ec.setId(100L);
            return ec;
        });

        EnforcementCaseDTO result = enforcementService.createCase(req, "officer@greenpulse.demo");

        assertNotNull(result);
        assertEquals("GP-ENF-2026-000001", result.getCaseNumber());
        assertEquals("Illegal Industrial Waste Dumping", result.getViolationType());
        assertEquals(EnforcementCaseStatus.OPEN, result.getCaseStatus());
    }

    @Test
    void testRequestMockGovernmentVerification() {
        EnforcementCase ec = new EnforcementCase();
        ec.setId(100L);
        ec.setCaseNumber("GP-ENF-2026-000001");
        ec.setCaseStatus(EnforcementCaseStatus.OPEN);

        MockVerificationResponse mockResp = new MockVerificationResponse(
            "VERIFIED", "SIMULATED_AUTHORITY_SERVICE", "AUTH-DEMO-1029", "DEMO-REF-8849-XXXX", "Notice"
        );

        when(userRepository.findByEmail("officer@greenpulse.demo")).thenReturn(Optional.of(officer));
        when(enforcementCaseRepository.findById(100L)).thenReturn(Optional.of(ec));
        when(governmentIntegrationService.verifyVehicleOrIdentity("VEHICLE_LOOKUP", "KA-01-EQ-9921")).thenReturn(mockResp);
        when(governmentVerificationRepository.save(any(GovernmentVerification.class))).thenAnswer(inv -> inv.getArgument(0));

        GovernmentVerification gv = enforcementService.requestMockGovernmentVerification(100L, "VEHICLE_LOOKUP", "KA-01-EQ-9921", "officer@greenpulse.demo");

        assertNotNull(gv);
        assertEquals("VERIFIED", gv.getVerificationStatus());
        assertEquals("AUTH-DEMO-1029", gv.getExternalReference());
        assertEquals(EnforcementCaseStatus.OFFENDER_IDENTIFIED, ec.getCaseStatus());
    }
}
