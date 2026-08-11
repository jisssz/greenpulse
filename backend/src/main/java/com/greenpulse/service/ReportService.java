package com.greenpulse.service;

import com.greenpulse.dto.CommentDTOs.CommentDTO;
import com.greenpulse.dto.CommentDTOs.CreateCommentRequest;
import com.greenpulse.dto.ReportDTOs.*;
import com.greenpulse.entity.*;
import com.greenpulse.exception.InvalidStatusTransitionException;
import com.greenpulse.exception.ResourceNotFoundException;
import com.greenpulse.exception.UnauthorizedException;
import com.greenpulse.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ReportImageRepository reportImageRepository;
    private final ReportStatusHistoryRepository statusHistoryRepository;
    private final CommentRepository commentRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public ReportService(ReportRepository reportRepository,
                         CategoryRepository categoryRepository,
                         UserRepository userRepository,
                         ReportImageRepository reportImageRepository,
                         ReportStatusHistoryRepository statusHistoryRepository,
                         CommentRepository commentRepository,
                         NotificationService notificationService,
                         AuditLogService auditLogService) {
        this.reportRepository = reportRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.reportImageRepository = reportImageRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.commentRepository = commentRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public ReportDTO createReport(CreateReportRequest request, String citizenEmail) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new UnauthorizedException("Citizen account not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + request.getCategoryId()));

        String reportNumber = generateReportNumber();

        Report report = new Report();
        report.setReportNumber(reportNumber);
        report.setTitle(request.getTitle());
        report.setDescription(request.getDescription());
        report.setCategory(category);
        report.setCitizen(citizen);
        report.setLatitude(request.getLatitude());
        report.setLongitude(request.getLongitude());
        report.setAddress(request.getAddress());
        report.setPriority(Priority.MEDIUM);
        report.setStatus(ReportStatus.SUBMITTED);

        Report savedReport = reportRepository.save(report);

        // Record initial status history
        saveStatusHistory(savedReport.getId(), null, ReportStatus.SUBMITTED, citizen.getId(), "Report submitted by citizen.");

        // Image attachment
        if (request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()) {
            ReportImage image = new ReportImage(savedReport.getId(), request.getImageUrl(), ImageType.INITIAL, citizen.getId());
            reportImageRepository.save(image);
        }

        // Audit Log & Notification
        auditLogService.logAction(citizen.getId(), "REPORT_SUBMITTED", "REPORT", savedReport.getId(), "{\"reportNumber\":\"" + reportNumber + "\"}");
        notificationService.createNotification(citizen.getId(), "Report Submitted", "Your report " + reportNumber + " was successfully created.", "STATUS_UPDATE");

        return mapToDTO(savedReport);
    }

    public Page<ReportDTO> getMyReports(String citizenEmail, int page, int size) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return reportRepository.findByCitizenId(citizen.getId(), pageable).map(this::mapToDTO);
    }

    public ReportDTO getReportById(Long id, User currentUser) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + id));

        // Authorization check: Citizens can only access their own reports
        if (currentUser.getRole() == Role.CITIZEN && !report.getCitizen().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied: You can only view your own reports.");
        }

        return mapToDTO(report);
    }

    public List<ReportDTO> checkNearbyDuplicates(Double latitude, Double longitude) {
        return reportRepository.findNearbyOpenReports(latitude, longitude)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public ReportDTO confirmResolution(Long reportId, ResolutionVerificationRequest request, String citizenEmail) {
        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + reportId));

        if (!report.getCitizen().getId().equals(citizen.getId())) {
            throw new UnauthorizedException("Only the reporting citizen can confirm resolution.");
        }

        if (report.getStatus() != ReportStatus.RESOLVED && report.getStatus() != ReportStatus.RESOLUTION_VERIFICATION) {
            throw new InvalidStatusTransitionException("Report is not awaiting resolution verification.");
        }

        ReportStatus oldStatus = report.getStatus();
        if (Boolean.TRUE.equals(request.getIsResolved())) {
            report.setStatus(ReportStatus.CLOSED);
            report.setClosedAt(LocalDateTime.now());
            saveStatusHistory(reportId, oldStatus, ReportStatus.CLOSED, citizen.getId(), "Citizen confirmed resolution: " + (request.getFeedback() != null ? request.getFeedback() : "Verified solved"));
            auditLogService.logAction(citizen.getId(), "REPORT_CLOSED", "REPORT", reportId, "Resolution confirmed");
        } else {
            // Re-open to VERIFIED status with high priority escalation
            report.setStatus(ReportStatus.VERIFIED);
            report.setPriority(Priority.HIGH);
            saveStatusHistory(reportId, oldStatus, ReportStatus.VERIFIED, citizen.getId(), "Citizen reported issue STILL PRESENT: " + request.getFeedback());
            
            // Notify Moderator
            if (report.getAssignedTo() != null) {
                notificationService.createNotification(report.getAssignedTo().getId(), "Resolution Dispute", "Citizen indicated issue " + report.getReportNumber() + " is still present.", "WARNING");
            }
        }

        Report saved = reportRepository.save(report);
        return mapToDTO(saved);
    }

    @Transactional
    public CommentDTO addComment(Long reportId, CreateCommentRequest request, User user) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + reportId));

        if (user.getRole() == Role.CITIZEN && Boolean.TRUE.equals(request.getIsInternal())) {
            throw new UnauthorizedException("Citizens cannot create internal moderator notes.");
        }

        Comment comment = new Comment(reportId, user, request.getComment(), Boolean.TRUE.equals(request.getIsInternal()));
        Comment saved = commentRepository.save(comment);

        return mapCommentToDTO(saved);
    }

    public List<CommentDTO> getComments(Long reportId, User currentUser) {
        List<Comment> comments;
        if (currentUser.getRole() == Role.CITIZEN) {
            comments = commentRepository.findByReportIdAndIsInternalFalseOrderByCreatedAtAsc(reportId);
        } else {
            comments = commentRepository.findByReportIdOrderByCreatedAtAsc(reportId);
        }
        return comments.stream().map(this::mapCommentToDTO).collect(Collectors.toList());
    }

    public List<StatusHistoryDTO> getReportHistory(Long reportId) {
        return statusHistoryRepository.findByReportIdOrderByCreatedAtAsc(reportId)
                .stream().map(this::mapHistoryToDTO).collect(Collectors.toList());
    }

    public void saveStatusHistory(Long reportId, ReportStatus oldStatus, ReportStatus newStatus, Long userId, String comment) {
        ReportStatusHistory history = new ReportStatusHistory(reportId, oldStatus, newStatus, userId, comment);
        statusHistoryRepository.save(history);
    }

    private synchronized String generateReportNumber() {
        long count = reportRepository.count() + 1;
        return String.format("GP-2026-%06d", count);
    }

    public ReportDTO mapToDTO(Report report) {
        ReportDTO dto = new ReportDTO();
        dto.setId(report.getId());
        dto.setReportNumber(report.getReportNumber());
        dto.setTitle(report.getTitle());
        dto.setDescription(report.getDescription());
        dto.setCategoryId(report.getCategory().getId());
        dto.setCategoryName(report.getCategory().getName());
        dto.setCategoryIcon(report.getCategory().getIconName());
        dto.setCitizenId(report.getCitizen().getId());
        dto.setCitizenName(report.getCitizen().getName());
        dto.setCitizenEmail(report.getCitizen().getEmail());
        if (report.getAssignedTo() != null) {
            dto.setAssignedToId(report.getAssignedTo().getId());
            dto.setAssignedToName(report.getAssignedTo().getName());
        }
        dto.setLatitude(report.getLatitude());
        dto.setLongitude(report.getLongitude());
        dto.setAddress(report.getAddress());
        dto.setPriority(report.getPriority());
        dto.setStatus(report.getStatus());
        dto.setCreatedAt(report.getCreatedAt());
        dto.setUpdatedAt(report.getUpdatedAt());
        dto.setVerifiedAt(report.getVerifiedAt());
        dto.setResolvedAt(report.getResolvedAt());
        dto.setClosedAt(report.getClosedAt());

        // Images
        List<ReportImage> images = reportImageRepository.findByReportId(report.getId());
        List<ReportImageDTO> imageDTOs = images.stream()
                .map(img -> new ReportImageDTO(img.getId(), img.getImageUrl(), img.getImageType(), img.getUploadedBy(), img.getCreatedAt()))
                .collect(Collectors.toList());
        dto.setImages(imageDTOs);
        if (!imageDTOs.isEmpty()) {
            dto.setThumbnailUrl(imageDTOs.get(0).getImageUrl());
        }

        return dto;
    }

    private CommentDTO mapCommentToDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setReportId(comment.getReportId());
        dto.setUserId(comment.getUser().getId());
        dto.setUserName(comment.getUser().getName());
        dto.setUserRole(comment.getUser().getRole().name());
        dto.setComment(comment.getComment());
        dto.setIsInternal(comment.getIsInternal());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }

    private StatusHistoryDTO mapHistoryToDTO(ReportStatusHistory history) {
        StatusHistoryDTO dto = new StatusHistoryDTO();
        dto.setId(history.getId());
        dto.setOldStatus(history.getOldStatus());
        dto.setNewStatus(history.getNewStatus());
        dto.setChangedBy(history.getChangedBy());
        userRepository.findById(history.getChangedBy()).ifPresent(u -> dto.setChangedByName(u.getName()));
        dto.setComment(history.getComment());
        dto.setCreatedAt(history.getCreatedAt());
        return dto;
    }
}
