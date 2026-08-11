package com.greenpulse.repository;

import com.greenpulse.entity.Fine;
import com.greenpulse.entity.FineStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FineRepository extends JpaRepository<Fine, Long> {
    Optional<Fine> findByChallanNumber(String challanNumber);
    Optional<Fine> findByEnforcementCaseId(Long enforcementCaseId);
    long countByPaymentStatus(FineStatus status);
}
