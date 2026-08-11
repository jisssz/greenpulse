package com.greenpulse.service;

import com.greenpulse.dto.ReportDTOs.CreateReportRequest;
import com.greenpulse.dto.ReportDTOs.ReportDTO;
import com.greenpulse.entity.*;
import com.greenpulse.exception.UnauthorizedException;
import com.greenpulse.repository.CategoryRepository;
import com.greenpulse.repository.ReportImageRepository;
import com.greenpulse.repository.ReportRepository;
import com.greenpulse.repository.ReportStatusHistoryRepository;
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
public class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ReportImageRepository reportImageRepository;
    @Mock
    private ReportStatusHistoryRepository statusHistoryRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ReportService reportService;

    private User citizenA;
    private User citizenB;
    private Category category;
    private Report reportA;

    @BeforeEach
    void setUp() {
        citizenA = new User(4L, "Jane Doe", "citizen@greenpulse.demo", "hash", "+123", Role.CITIZEN);
        citizenB = new User(6L, "Elena Rostova", "citizen2@greenpulse.demo", "hash", "+123", Role.CITIZEN);
        category = new Category(1L, "Illegal Dumping", "Desc", "AlertTriangle");

        reportA = new Report();
        reportA.setId(1L);
        reportA.setReportNumber("GP-2026-000001");
        reportA.setTitle("Illegal Dumping near Park");
        reportA.setCitizen(citizenA);
        reportA.setStatus(ReportStatus.SUBMITTED);
        reportA.setCategory(category);
    }

    @Test
    void testCreateReport() {
        CreateReportRequest request = new CreateReportRequest();
        request.setTitle("Illegal Dumping near Park");
        request.setDescription("Severe dumping of trash near walking trail.");
        request.setCategoryId(1L);
        request.setLatitude(37.7749);
        request.setLongitude(-122.4194);
        request.setAddress("100 Main St");
        request.setImageUrl("/uploads/test.jpg");

        when(userRepository.findByEmail("citizen@greenpulse.demo")).thenReturn(Optional.of(citizenA));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(reportRepository.count()).thenReturn(0L);
        when(reportRepository.save(any(Report.class))).thenAnswer(invocation -> {
            Report r = invocation.getArgument(0);
            r.setId(1L);
            return r;
        });

        ReportDTO result = reportService.createReport(request, "citizen@greenpulse.demo");

        assertNotNull(result);
        assertEquals("GP-2026-000001", result.getReportNumber());
        assertEquals("Illegal Dumping near Park", result.getTitle());
    }

    @Test
    void testGetReportById_AllowedForOwner() {
        when(reportRepository.findById(1L)).thenReturn(Optional.of(reportA));

        ReportDTO result = reportService.getReportById(1L, citizenA);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    void testGetReportById_RejectsUnAuthorizedCitizen_IDOR() {
        when(reportRepository.findById(1L)).thenReturn(Optional.of(reportA));

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> {
            reportService.getReportById(1L, citizenB);
        });

        assertTrue(ex.getMessage().contains("Access denied"));
    }
}
