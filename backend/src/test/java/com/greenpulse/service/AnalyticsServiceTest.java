package com.greenpulse.service;

import com.greenpulse.dto.AnalyticsDTOs.AnalyticsSummary;
import com.greenpulse.dto.AnalyticsDTOs.HotspotDTO;
import com.greenpulse.entity.*;
import com.greenpulse.repository.ReportRepository;
import com.greenpulse.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AnalyticsServiceTest {

    @Mock
    private ReportRepository reportRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AnalyticsService analyticsService;

    private Report report1;
    private Report report2;

    @BeforeEach
    void setUp() {
        Category cat = new Category(1L, "Illegal Dumping", "Desc", "AlertTriangle");
        User citizen = new User(4L, "Jane Doe", "citizen@greenpulse.demo", "hash", "+123", Role.CITIZEN);

        report1 = new Report();
        report1.setId(1L);
        report1.setReportNumber("GP-2026-000001");
        report1.setTitle("Park Dumping");
        report1.setCategory(cat);
        report1.setCitizen(citizen);
        report1.setLatitude(37.7749);
        report1.setLongitude(-122.4194);
        report1.setAddress("100 Main St");
        report1.setPriority(Priority.HIGH);
        report1.setStatus(ReportStatus.CLOSED);
        report1.setCreatedAt(LocalDateTime.now().minusHours(24));
        report1.setResolvedAt(LocalDateTime.now().minusHours(4));

        report2 = new Report();
        report2.setId(2L);
        report2.setReportNumber("GP-2026-000002");
        report2.setTitle("Plastic Waste");
        report2.setCategory(cat);
        report2.setCitizen(citizen);
        report2.setLatitude(37.7833);
        report2.setLongitude(-122.4167);
        report2.setAddress("450 Transit Ave");
        report2.setPriority(Priority.MEDIUM);
        report2.setStatus(ReportStatus.SUBMITTED);
        report2.setCreatedAt(LocalDateTime.now().minusHours(2));
    }

    @Test
    void testGetSummary() {
        when(reportRepository.findAll()).thenReturn(Arrays.asList(report1, report2));
        when(userRepository.findByRoleAndIsActiveTrue(Role.CITIZEN)).thenReturn(Collections.singletonList(new User()));
        when(userRepository.findByRoleAndIsActiveTrue(Role.FIELD_WORKER)).thenReturn(Collections.singletonList(new User()));

        AnalyticsSummary summary = analyticsService.getSummary();

        assertNotNull(summary);
        assertEquals(2, summary.getTotalReports());
        assertEquals(1, summary.getOpenReports());
        assertEquals(1, summary.getClosedReports());
        assertEquals(50.0, summary.getResolutionRate());
        assertEquals(20.0, summary.getAvgResolutionHours()); // 24h - 4h = 20h turnaround
    }

    @Test
    void testGetHotspotData() {
        when(reportRepository.findAll()).thenReturn(Arrays.asList(report1, report2));

        List<HotspotDTO> hotspots = analyticsService.getHotspotData();

        assertNotNull(hotspots);
        assertEquals(2, hotspots.size());
        assertEquals("GP-2026-000001", hotspots.get(0).getReportNumber());
    }
}
