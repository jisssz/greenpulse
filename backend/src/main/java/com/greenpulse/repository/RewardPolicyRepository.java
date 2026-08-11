package com.greenpulse.repository;

import com.greenpulse.entity.RewardPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RewardPolicyRepository extends JpaRepository<RewardPolicy, Long> {
    Optional<RewardPolicy> findByEnabledTrue();
}
