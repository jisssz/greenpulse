package com.greenpulse.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "waste_predictions")
public class WastePrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "image_url", nullable = false, length = 512)
    private String imageUrl;

    @Column(name = "predicted_category", nullable = false, length = 100)
    private String predictedCategory;

    @Column(nullable = false)
    private Double confidence;

    @Column(nullable = false)
    private Boolean recyclable;

    @Column(name = "recommended_bin", nullable = false, length = 100)
    private String recommendedBin;

    @Column(name = "eco_points", nullable = false)
    private Integer ecoPoints = 10;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public WastePrediction() {}

    public WastePrediction(Long id, User user, String imageUrl, String predictedCategory, Double confidence, Boolean recyclable, String recommendedBin, Integer ecoPoints) {
        this.id = id;
        this.user = user;
        this.imageUrl = imageUrl;
        this.predictedCategory = predictedCategory;
        this.confidence = confidence;
        this.recyclable = recyclable;
        this.recommendedBin = recommendedBin;
        this.ecoPoints = ecoPoints;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getPredictedCategory() { return predictedCategory; }
    public void setPredictedCategory(String predictedCategory) { this.predictedCategory = predictedCategory; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public Boolean getRecyclable() { return recyclable; }
    public void setRecyclable(Boolean recyclable) { this.recyclable = recyclable; }

    public String getRecommendedBin() { return recommendedBin; }
    public void setRecommendedBin(String recommendedBin) { this.recommendedBin = recommendedBin; }

    public Integer getEcoPoints() { return ecoPoints; }
    public void setEcoPoints(Integer ecoPoints) { this.ecoPoints = ecoPoints; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
