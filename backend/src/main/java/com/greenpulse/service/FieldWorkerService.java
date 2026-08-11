package com.greenpulse.service;

import com.greenpulse.dto.ReportDTOs.ReportDTO;
import com.greenpulse.dto.ReportDTOs.ResolutionRequest;
import com.greenpulse.entity.*;
import com.greenpulse.exception.InvalidStatusTransitionException;
import com.greenpulse.exception.ResourceNotFoundException;
import com.greenpulse.exception.UnauthorizedException;
import com.greenpulse.repository.ReportImageRepository;
import com.greenpulse.repository.ReportRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class FieldWorkerService {

    private final ReportRepository reportRepository;
    private final ReportImageRepository reportImageRepository;
    private final ReportService reportService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public FieldWorkerService(ReportRepository reportRepository,
                              ReportImageRepository reportImageRepository,
                              ReportService reportService,
                              NotificationService notificationService,
                              AuditLogService auditLogService) {
        this.reportRepository = reportRepository;
        this.reportImageRepository = reportImageRepository;
        this.reportService = reportService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    public Page<ReportDTO> getWorkerAssignments(User worker, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("priority").descending().and(Sort.by("createdAt").descending()));
        return reportRepository.findByAssignedToId(worker.getId(), pageable).map(reportService::mapToDTO);
    }

    @Transactional
    public ReportDTO startWork(Long reportId, User worker) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + reportId));

        if (report.getAssignedTo() == null || !report.getAssignedTo().getId().equals(worker.getId())) {
            throw new UnauthorizedException("Report is not assigned to you.");
        }

        ReportStatus oldStatus = report.getStatus();
        if (!oldStatus.canTransitionTo(ReportStatus.IN_PROGRESS, worker.getRole())) {
            throw new InvalidStatusTransitionException("Cannot transition report from " + oldStatus + " to IN_PROGRESS");
        }
        report.setStatus(ReportStatus.IN_PROGRESS);
        Report saved = reportRepository.save(report);

        reportService.saveStatusHistory(reportId, oldStatus, ReportStatus.IN_PROGRESS, worker.getId(), "Work started by field worker " + worker.getName());
        auditLogService.logAction(worker.getId(), "WORK_STARTED", "REPORT", reportId, null);
        notificationService.createNotification(report.getCitizen().getId(), "Work In Progress", "Field team has started resolution on report " + report.getReportNumber(), "STATUS_UPDATE");

        return reportService.mapToDTO(saved);
    }

    @Transactional
    public ReportDTO resolveReport(Long reportId, ResolutionRequest request, User worker) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + reportId));

        if (report.getAssignedTo() == null || !report.getAssignedTo().getId().equals(worker.getId())) {
            throw new UnauthorizedException("Report is not assigned to you.");
        }

        ReportStatus oldStatus = report.getStatus();
        if (!oldStatus.canTransitionTo(ReportStatus.RESOLVED, worker.getRole())) {
            throw new InvalidStatusTransitionException("Cannot transition report from " + oldStatus + " to RESOLVED");
        }
        report.setStatus(ReportStatus.RESOLVED);
        report.setResolvedAt(LocalDateTime.now());

        // Upload AFTER photo evidence if provided
        if (request.getAfterImageUrl() != null && !request.getAfterImageUrl().trim().isEmpty()) {
            ReportImage image = new ReportImage(reportId, request.getAfterImageUrl(), ImageType.AFTER, worker.getId());
            reportImageRepository.save(image);
        }

        Report saved = reportRepository.save(report);

        String note = request.getResolutionNotes() != null ? request.getResolutionNotes() : "Work completed by field team";
        reportService.saveStatusHistory(reportId, oldStatus, ReportStatus.RESOLVED, worker.getId(), note);
        auditLogService.logAction(worker.getId(), "REPORT_RESOLVED", "REPORT", reportId, note);
        
        // Notify Citizen to confirm resolution
        notificationService.createNotification(report.getCitizen().getId(), "Resolution Verification Needed", "Report " + report.getReportNumber() + " has been marked resolved. Please confirm if the issue is solved.", "ACTION_REQUIRED");

        return reportService.mapToDTO(saved);
    }
}
