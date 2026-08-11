package com.greenpulse.repository;

import com.greenpulse.entity.Evidence;
import com.greenpulse.entity.EvidenceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, Long> {
    Optional<Evidence> findByEvidenceNumber(String evidenceNumber);
    List<Evidence> findByReportId(Long reportId);
    Page<Evidence> findByVerificationStatus(EvidenceStatus status, Pageable pageable);
    List<Evidence> findBySubmittedById(Long submittedById);
    boolean existsByEvidenceHash(String evidenceHash);
}
