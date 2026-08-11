package com.greenpulse.service;

import com.greenpulse.dto.AuthDTOs.UserDTO;
import com.greenpulse.dto.ReportDTOs.*;
import com.greenpulse.entity.*;
import com.greenpulse.exception.InvalidStatusTransitionException;
import com.greenpulse.exception.ResourceNotFoundException;
import com.greenpulse.repository.ReportRepository;
import com.greenpulse.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ModeratorService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ReportService reportService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public ModeratorService(ReportRepository reportRepository,
                            UserRepository userRepository,
                            ReportService reportService,
                            NotificationService notificationService,
                            AuditLogService auditLogService) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.reportService = reportService;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    public Page<ReportDTO> getModeratorReports(ReportStatus status, Long categoryId, Priority priority, String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return reportRepository.findAllFiltered(status, categoryId, priority, search, pageable)
                .map(reportService::mapToDTO);
    }

    @Transactional
    public ReportDTO verifyReport(Long id, Priority priority, String comment, User moderator) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + id));

        ReportStatus oldStatus = report.getStatus();
        if (!oldStatus.canTransitionTo(ReportStatus.VERIFIED, moderator.getRole())) {
            throw new InvalidStatusTransitionException("Cannot transition from " + oldStatus + " to VERIFIED");
        }

        report.setStatus(ReportStatus.VERIFIED);
        if (priority != null) {
            report.setPriority(priority);
        }
        report.setVerifiedAt(LocalDateTime.now());

        Report saved = reportRepository.save(report);

        reportService.saveStatusHistory(id, oldStatus, ReportStatus.VERIFIED, moderator.getId(), comment != null ? comment : "Verified by moderator");
        auditLogService.logAction(moderator.getId(), "REPORT_VERIFIED", "REPORT", id, "Priority: " + report.getPriority());
        notificationService.createNotification(report.getCitizen().getId(), "Report Verified", "Your report " + report.getReportNumber() + " has been verified.", "STATUS_UPDATE");

        return reportService.mapToDTO(saved);
    }

    @Transactional
    public ReportDTO rejectReport(Long id, String reason, User moderator) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + id));

        ReportStatus oldStatus = report.getStatus();
        report.setStatus(ReportStatus.REJECTED);

        Report saved = reportRepository.save(report);

        reportService.saveStatusHistory(id, oldStatus, ReportStatus.REJECTED, moderator.getId(), reason);
        auditLogService.logAction(moderator.getId(), "REPORT_REJECTED", "REPORT", id, "Reason: " + reason);
        notificationService.createNotification(report.getCitizen().getId(), "Report Rejected", "Your report " + report.getReportNumber() + " was rejected: " + reason, "WARNING");

        return reportService.mapToDTO(saved);
    }

    @Transactional
    public ReportDTO updatePriority(Long id, Priority priority, String comment, User moderator) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + id));

        Priority oldPriority = report.getPriority();
        report.setPriority(priority);
        Report saved = reportRepository.save(report);

        auditLogService.logAction(moderator.getId(), "PRIORITY_UPDATED", "REPORT", id, "From " + oldPriority + " to " + priority);
        return reportService.mapToDTO(saved);
    }

    @Transactional
    public ReportDTO assignWorker(Long id, Long workerId, String comment, User moderator) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + id));

        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Field Worker not found with ID: " + workerId));

        if (worker.getRole() != Role.FIELD_WORKER && worker.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("User is not a Field Worker.");
        }

        ReportStatus oldStatus = report.getStatus();
        if (!oldStatus.canTransitionTo(ReportStatus.ASSIGNED, moderator.getRole())) {
            throw new InvalidStatusTransitionException("Cannot transition report from " + oldStatus + " to ASSIGNED");
        }
        report.setAssignedTo(worker);
        report.setStatus(ReportStatus.ASSIGNED);

        Report saved = reportRepository.save(report);

        reportService.saveStatusHistory(id, oldStatus, ReportStatus.ASSIGNED, moderator.getId(), comment != null ? comment : "Assigned to worker " + worker.getName());
        auditLogService.logAction(moderator.getId(), "REPORT_ASSIGNED", "REPORT", id, "Assigned to worker ID: " + workerId);
        notificationService.createNotification(workerId, "New Assignment", "You have been assigned to environmental report " + report.getReportNumber(), "ASSIGNMENT");

        return reportService.mapToDTO(saved);
    }

    public List<UserDTO> getAvailableFieldWorkers() {
        return userRepository.findByRoleAndIsActiveTrue(Role.FIELD_WORKER)
                .stream().map(u -> new UserDTO(u.getId(), u.getName(), u.getEmail(), u.getPhone(), u.getRole(), u.getProfileImage()))
                .collect(Collectors.toList());
    }
}
