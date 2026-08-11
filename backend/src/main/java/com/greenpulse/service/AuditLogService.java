package com.greenpulse.service;

import com.greenpulse.entity.AuditLog;
import com.greenpulse.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(Long userId, String action, String entityType, Long entityId, String metadata) {
        AuditLog log = new AuditLog(userId, action, entityType, entityId, metadata);
        auditLogRepository.save(log);
    }

    public Page<AuditLog> getAuditLogs(int page, int size) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }
}
