package com.greenpulse.service;

import com.greenpulse.dto.EnforcementDTOs.FineDTO;
import com.greenpulse.dto.EnforcementDTOs.IssueChallanRequest;
import com.greenpulse.dto.RewardDTOs.RewardDTO;
import com.greenpulse.entity.*;
import com.greenpulse.repository.*;
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
public class FineAndRewardServiceTest {

    @Mock
    private FineRepository fineRepository;
    @Mock
    private EnforcementCaseRepository enforcementCaseRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RewardRepository rewardRepository;
    @Mock
    private RewardPolicyRepository rewardPolicyRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private RewardService mockRewardService;

    @InjectMocks
    private FineService fineService;

    private RewardService realRewardService;

    private User officer;
    private User citizen;
    private EnforcementCase enforcementCase;
    private Evidence evidence;
    private Fine finePaid;
    private RewardPolicy policy;

    @BeforeEach
    void setUp() {
        officer = new User(7L, "Vikram Roy", "officer@greenpulse.demo", "hash", "+123", Role.AUTHORITY_OFFICER);
        citizen = new User(4L, "Jane Doe", "citizen@greenpulse.demo", "hash", "+123", Role.CITIZEN);
        
        evidence = new Evidence();
        evidence.setId(10L);
        evidence.setSubmittedBy(citizen);

        enforcementCase = new EnforcementCase();
        enforcementCase.setId(100L);
        enforcementCase.setCaseNumber("GP-ENF-2026-000001");
        enforcementCase.setViolationType("Illegal Industrial Waste Dumping");
        enforcementCase.setEvidence(evidence);

        finePaid = new Fine();
        finePaid.setId(50L);
        finePaid.setChallanNumber("GP-CHL-2026-000001");
        finePaid.setFineAmount(10000.0); // ₹10,000 fine -> 10% is ₹1,000, but cap is ₹500
        finePaid.setEnforcementCaseId(100L);
        finePaid.setPaymentStatus(FineStatus.PAID);

        policy = new RewardPolicy();
        policy.setName("Standard Policy");
        policy.setRewardPercentage(10.0);
        policy.setMaximumReward(500.0);
        policy.setEnabled(true);

        realRewardService = new RewardService(
            rewardRepository, rewardPolicyRepository, enforcementCaseRepository,
            fineRepository, userRepository, notificationService, auditLogService
        );
    }

    @Test
    void testIssueChallan_GeneratesChallanNumber() {
        IssueChallanRequest req = new IssueChallanRequest();
        req.setFineAmount(3000.0);
        req.setViolationType("Illegal Industrial Waste Dumping");

        when(userRepository.findByEmail("officer@greenpulse.demo")).thenReturn(Optional.of(officer));
        when(enforcementCaseRepository.findById(100L)).thenReturn(Optional.of(enforcementCase));
        when(fineRepository.count()).thenReturn(0L);
        when(fineRepository.save(any(Fine.class))).thenAnswer(inv -> {
            Fine f = inv.getArgument(0);
            f.setId(50L);
            return f;
        });

        FineDTO result = fineService.issueChallan(100L, req, "officer@greenpulse.demo");

        assertNotNull(result);
        assertEquals("GP-CHL-2026-000001", result.getChallanNumber());
        assertEquals(3000.0, result.getFineAmount());
        assertEquals(FineStatus.ISSUED, result.getPaymentStatus());
    }

    @Test
    void testMarkFinePaid_TriggersRewardCalculation() {
        Fine fine = new Fine();
        fine.setId(50L);
        fine.setChallanNumber("GP-CHL-2026-000001");
        fine.setFineAmount(3000.0);
        fine.setEnforcementCaseId(100L);
        fine.setPaymentStatus(FineStatus.ISSUED);

        when(userRepository.findByEmail("officer@greenpulse.demo")).thenReturn(Optional.of(officer));
        when(fineRepository.findById(50L)).thenReturn(Optional.of(fine));
        when(fineRepository.save(any(Fine.class))).thenAnswer(inv -> inv.getArgument(0));
        when(enforcementCaseRepository.findById(100L)).thenReturn(Optional.of(enforcementCase));

        FineDTO result = fineService.markFinePaid(50L, "DEMO-PAY-99", "officer@greenpulse.demo");

        assertNotNull(result);
        assertEquals(FineStatus.PAID, result.getPaymentStatus());
        verify(mockRewardService, times(1)).calculateAndCreateReward(100L, 50L);
    }

    @Test
    void testCalculateAndCreateReward_EnforcesMaximumCapLimit() {
        when(enforcementCaseRepository.findById(100L)).thenReturn(Optional.of(enforcementCase));
        when(fineRepository.findById(50L)).thenReturn(Optional.of(finePaid));
        when(rewardRepository.existsByEnforcementCaseIdAndContributorId(100L, 4L)).thenReturn(false);
        when(rewardPolicyRepository.findByEnabledTrue()).thenReturn(Optional.of(policy));
        when(rewardRepository.save(any(Reward.class))).thenAnswer(inv -> inv.getArgument(0));

        RewardDTO reward = realRewardService.calculateAndCreateReward(100L, 50L);

        assertNotNull(reward);
        assertEquals(1000.0, reward.getEligibleAmount()); // 10% of 10,000 = 1,000
        assertEquals(500.0, reward.getApprovedAmount()); // Capped at max ₹500!
        assertEquals(RewardStatus.APPROVED, reward.getPaymentStatus());
    }

    @Test
    void testCalculateAndCreateReward_RejectsUnpaidFine() {
        Fine unpaidFine = new Fine();
        unpaidFine.setId(51L);
        unpaidFine.setPaymentStatus(FineStatus.ISSUED);

        when(enforcementCaseRepository.findById(100L)).thenReturn(Optional.of(enforcementCase));
        when(fineRepository.findById(51L)).thenReturn(Optional.of(unpaidFine));

        assertThrows(IllegalArgumentException.class, () -> {
            realRewardService.calculateAndCreateReward(100L, 51L);
        });
    }
}
