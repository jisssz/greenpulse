package com.greenpulse.repository;

import com.greenpulse.entity.ImageType;
import com.greenpulse.entity.ReportImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportImageRepository extends JpaRepository<ReportImage, Long> {
    List<ReportImage> findByReportId(Long reportId);
    List<ReportImage> findByReportIdAndImageType(Long reportId, ImageType imageType);
}
