package com.greenpulse.repository;

import com.greenpulse.entity.GovernmentVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GovernmentVerificationRepository extends JpaRepository<GovernmentVerification, Long> {
    List<GovernmentVerification> findByEnforcementCaseId(Long enforcementCaseId);
}
