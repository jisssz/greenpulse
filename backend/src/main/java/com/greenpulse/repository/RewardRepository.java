package com.greenpulse.repository;

import com.greenpulse.entity.Reward;
import com.greenpulse.entity.RewardStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {
    List<Reward> findByContributorId(Long contributorId);
    Optional<Reward> findByEnforcementCaseId(Long enforcementCaseId);
    boolean existsByEnforcementCaseIdAndContributorId(Long enforcementCaseId, Long contributorId);
    long countByPaymentStatus(RewardStatus status);
}
