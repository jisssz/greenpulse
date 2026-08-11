package com.greenpulse.repository;

import com.greenpulse.entity.Offender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OffenderRepository extends JpaRepository<Offender, Long> {
    Optional<Offender> findByEnforcementCaseId(Long enforcementCaseId);
}
