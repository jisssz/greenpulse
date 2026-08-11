package com.greenpulse.repository;

import com.greenpulse.entity.EnforcementCase;
import com.greenpulse.entity.EnforcementCaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnforcementCaseRepository extends JpaRepository<EnforcementCase, Long> {
    Optional<EnforcementCase> findByCaseNumber(String caseNumber);
    Optional<EnforcementCase> findByReportId(Long reportId);
    Page<EnforcementCase> findByCaseStatus(EnforcementCaseStatus status, Pageable pageable);
    List<EnforcementCase> findByAssignedOfficerId(Long officerId);
    long countByCaseStatus(EnforcementCaseStatus status);
}
