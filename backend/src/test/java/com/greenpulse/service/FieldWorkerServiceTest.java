package com.greenpulse.service;

import com.greenpulse.dto.ReportDTOs.ReportDTO;
import com.greenpulse.dto.ReportDTOs.ResolutionRequest;
import com.greenpulse.entity.*;
import com.greenpulse.exception.InvalidStatusTransitionException;
import com.greenpulse.exception.UnauthorizedException;
import com.greenpulse.repository.ReportImageRepository;
import com.greenpulse.repository.ReportRepository;
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
public class FieldWorkerServiceTest {

    @Mock
    private ReportRepository reportRepository;
    @Mock
    private ReportImageRepository reportImageRepository;
    @Mock
    private ReportService reportService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private FieldWorkerService fieldWorkerService;

    private User worker;
    private User otherWorker;
    private Report sampleReport;

    @BeforeEach
    void setUp() {
        worker = new User(3L, "Alex Rivera", "worker@greenpulse.demo", "hash", "+123", Role.FIELD_WORKER);
        otherWorker = new User(5L, "Marcus Vance", "worker2@greenpulse.demo", "hash", "+456", Role.FIELD_WORKER);
        User citizen = new User(4L, "Jane Doe", "citizen@greenpulse.demo", "hash", "+789", Role.CITIZEN);
        Category cat = new Category(1L, "Overflowing Bin", "Desc", "Trash2");

        sampleReport = new Report();
        sampleReport.setId(2L);
        sampleReport.setReportNumber("GP-2026-000002");
        sampleReport.setTitle("Overflowing Bin");
        sampleReport.setDescription("Bin overflowing onto pavement");
        sampleReport.setCategory(cat);
        sampleReport.setCitizen(citizen);
        sampleReport.setAssignedTo(worker);
        sampleReport.setLatitude(37.7833);
        sampleReport.setLongitude(-122.4167);
        sampleReport.setAddress("450 Transit Ave");
        sampleReport.setPriority(Priority.MEDIUM);
        sampleReport.setStatus(ReportStatus.ASSIGNED);
    }

    @Test
    void testStartWork_Success() {
        when(reportRepository.findById(2L)).thenReturn(Optional.of(sampleReport));
        when(reportRepository.save(any(Report.class))).thenReturn(sampleReport);
        when(reportService.mapToDTO(any())).thenReturn(new ReportDTO());

        ReportDTO result = fieldWorkerService.startWork(2L, worker);

        assertNotNull(result);
        assertEquals(ReportStatus.IN_PROGRESS, sampleReport.getStatus());
        verify(reportRepository, times(1)).save(sampleReport);
    }

    @Test
    void testStartWork_UnassignedWorker_Fails() {
        when(reportRepository.findById(2L)).thenReturn(Optional.of(sampleReport));

        // Attempting to start work assigned to worker 3 using worker 5 credentials
        assertThrows(UnauthorizedException.class, () -> {
            fieldWorkerService.startWork(2L, otherWorker);
        });
    }

    @Test
    void testResolveReport_Success() {
        sampleReport.setStatus(ReportStatus.IN_PROGRESS);
        when(reportRepository.findById(2L)).thenReturn(Optional.of(sampleReport));
        when(reportRepository.save(any(Report.class))).thenReturn(sampleReport);
        when(reportService.mapToDTO(any())).thenReturn(new ReportDTO());

        ResolutionRequest request = new ResolutionRequest();
        request.setResolutionNotes("Emptied bin and sanitized area");
        request.setAfterImageUrl("/uploads/after_bin.jpg");

        ReportDTO result = fieldWorkerService.resolveReport(2L, request, worker);

        assertNotNull(result);
        assertEquals(ReportStatus.RESOLVED, sampleReport.getStatus());
        verify(reportImageRepository, times(1)).save(any());
    }
}
