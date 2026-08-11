package com.greenpulse.dto;

import com.greenpulse.entity.Priority;
import com.greenpulse.entity.ReportStatus;

import java.util.Map;

public class AnalyticsDTOs {

    public static class AnalyticsSummary {
        private long totalReports;
        private long openReports;
        private long inProgressReports;
        private long resolvedReports;
        private long closedReports;
        private double resolutionRate;
        private double avgResolutionHours;
        private long activeCitizens;
        private long activeFieldWorkers;
        private Map<String, Long> categoryDistribution;
        private Map<ReportStatus, Long> statusDistribution;
        private Map<Priority, Long> priorityDistribution;

        // Getters and Setters
        public long getTotalReports() { return totalReports; }
        public void setTotalReports(long totalReports) { this.totalReports = totalReports; }

        public long getOpenReports() { return openReports; }
        public void setOpenReports(long openReports) { this.openReports = openReports; }

        public long getInProgressReports() { return inProgressReports; }
        public void setInProgressReports(long inProgressReports) { this.inProgressReports = inProgressReports; }

        public long getResolvedReports() { return resolvedReports; }
        public void setResolvedReports(long resolvedReports) { this.resolvedReports = resolvedReports; }

        public long getClosedReports() { return closedReports; }
        public void setClosedReports(long closedReports) { this.closedReports = closedReports; }

        public double getResolutionRate() { return resolutionRate; }
        public void setResolutionRate(double resolutionRate) { this.resolutionRate = resolutionRate; }

        public double getAvgResolutionHours() { return avgResolutionHours; }
        public void setAvgResolutionHours(double avgResolutionHours) { this.avgResolutionHours = avgResolutionHours; }

        public long getActiveCitizens() { return activeCitizens; }
        public void setActiveCitizens(long activeCitizens) { this.activeCitizens = activeCitizens; }

        public long getActiveFieldWorkers() { return activeFieldWorkers; }
        public void setActiveFieldWorkers(long activeFieldWorkers) { this.activeFieldWorkers = activeFieldWorkers; }

        public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
        public void setCategoryDistribution(Map<String, Long> categoryDistribution) { this.categoryDistribution = categoryDistribution; }

        public Map<ReportStatus, Long> getStatusDistribution() { return statusDistribution; }
        public void setStatusDistribution(Map<ReportStatus, Long> statusDistribution) { this.statusDistribution = statusDistribution; }

        public Map<Priority, Long> getPriorityDistribution() { return priorityDistribution; }
        public void setPriorityDistribution(Map<Priority, Long> priorityDistribution) { this.priorityDistribution = priorityDistribution; }
    }

    public static class HotspotDTO {
        private Long id;
        private String reportNumber;
        private String title;
        private String categoryName;
        private Double latitude;
        private Double longitude;
        private String address;
        private Priority priority;
        private ReportStatus status;

        public HotspotDTO() {}

        public HotspotDTO(Long id, String reportNumber, String title, String categoryName, Double latitude, Double longitude, String address, Priority priority, ReportStatus status) {
            this.id = id;
            this.reportNumber = reportNumber;
            this.title = title;
            this.categoryName = categoryName;
            this.latitude = latitude;
            this.longitude = longitude;
            this.address = address;
            this.priority = priority;
            this.status = status;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getReportNumber() { return reportNumber; }
        public void setReportNumber(String reportNumber) { this.reportNumber = reportNumber; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public Priority getPriority() { return priority; }
        public void setPriority(Priority priority) { this.priority = priority; }

        public ReportStatus getStatus() { return status; }
        public void setStatus(ReportStatus status) { this.status = status; }
    }
}
