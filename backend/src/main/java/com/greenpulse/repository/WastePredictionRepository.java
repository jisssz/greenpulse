package com.greenpulse.repository;

import com.greenpulse.entity.WastePrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WastePredictionRepository extends JpaRepository<WastePrediction, Long> {
    List<WastePrediction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<WastePrediction> findByUserId(Long userId);
}
