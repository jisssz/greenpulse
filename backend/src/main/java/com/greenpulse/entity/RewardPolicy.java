package com.greenpulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reward_policies")
public class RewardPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "reward_percentage", nullable = false)
    private Double rewardPercentage = 10.0;

    @Column(name = "maximum_reward", nullable = false)
    private Double maximumReward = 500.0;

    @Column(name = "minimum_fine", nullable = false)
    private Double minimumFine = 500.0;

    private Boolean enabled = true;

    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom = LocalDateTime.now();

    @Column(name = "effective_to")
    private LocalDateTime effectiveTo;

    public RewardPolicy() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getRewardPercentage() { return rewardPercentage; }
    public void setRewardPercentage(Double rewardPercentage) { this.rewardPercentage = rewardPercentage; }

    public Double getMaximumReward() { return maximumReward; }
    public void setMaximumReward(Double maximumReward) { this.maximumReward = maximumReward; }

    public Double getMinimumFine() { return minimumFine; }
    public void setMinimumFine(Double minimumFine) { this.minimumFine = minimumFine; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public LocalDateTime getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDateTime effectiveFrom) { this.effectiveFrom = effectiveFrom; }

    public LocalDateTime getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDateTime effectiveTo) { this.effectiveTo = effectiveTo; }
}
