package com.greenpulse.service;

import com.greenpulse.dto.ReportDTOs.ReportDTO;
import com.greenpulse.entity.*;
import com.greenpulse.exception.InvalidStatusTransitionException;
import com.greenpulse.repository.ReportRepository;
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
public class ModeratorServiceTest {

    @Mock
    private ReportRepository reportRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ReportService reportService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ModeratorService moderatorService;

    private User moderator;
    private User worker;
    private Report sampleReport;

    @BeforeEach
    void setUp() {
        moderator = new User(2L, "Sarah Jenkins", "moderator@greenpulse.demo", "hash", "+123", Role.MODERATOR);
        worker = new User(3L, "Alex Rivera", "worker@greenpulse.demo", "hash", "+456", Role.FIELD_WORKER);
        
        Category cat = new Category(1L, "Illegal Dumping", "Desc", "AlertTriangle");
        User citizen = new User(4L, "Jane Doe", "citizen@greenpulse.demo", "hash", "+789", Role.CITIZEN);

        sampleReport = new Report();
        sampleReport.setId(1L);
        sampleReport.setReportNumber("GP-2026-000001");
        sampleReport.setTitle("Illegal Dumping");
        sampleReport.setDescription("Trash accumulation");
        sampleReport.setCategory(cat);
        sampleReport.setCitizen(citizen);
        sampleReport.setLatitude(37.7749);
        sampleReport.setLongitude(-122.4194);
        sampleReport.setAddress("100 Main St");
        sampleReport.setPriority(Priority.MEDIUM);
        sampleReport.setStatus(ReportStatus.SUBMITTED);
    }

    @Test
    void testVerifyReport_Success() {
        when(reportRepository.findById(1L)).thenReturn(Optional.of(sampleReport));
        when(reportRepository.save(any(Report.class))).thenReturn(sampleReport);
        when(reportService.mapToDTO(any())).thenReturn(new ReportDTO());

        ReportDTO result = moderatorService.verifyReport(1L, Priority.HIGH, "Verified on site", moderator);

        assertNotNull(result);
        assertEquals(ReportStatus.VERIFIED, sampleReport.getStatus());
        assertEquals(Priority.HIGH, sampleReport.getPriority());
        verify(reportRepository, times(1)).save(sampleReport);
    }

    @Test
    void testVerifyReport_InvalidStatusTransition_Fails() {
        // If status is already CLOSED, attempting to verify must fail
        sampleReport.setStatus(ReportStatus.CLOSED);
        when(reportRepository.findById(1L)).thenReturn(Optional.of(sampleReport));

        assertThrows(InvalidStatusTransitionException.class, () -> {
            moderatorService.verifyReport(1L, Priority.HIGH, "Attempt verify closed", moderator);
        });
    }

    @Test
    void testAssignWorker_Success() {
        sampleReport.setStatus(ReportStatus.VERIFIED);
        when(reportRepository.findById(1L)).thenReturn(Optional.of(sampleReport));
        when(userRepository.findById(3L)).thenReturn(Optional.of(worker));
        when(reportRepository.save(any(Report.class))).thenReturn(sampleReport);
        when(reportService.mapToDTO(any())).thenReturn(new ReportDTO());

        ReportDTO result = moderatorService.assignWorker(1L, 3L, "Dispatch team", moderator);

        assertNotNull(result);
        assertEquals(ReportStatus.ASSIGNED, sampleReport.getStatus());
        assertEquals(worker, sampleReport.getAssignedTo());
    }
}
