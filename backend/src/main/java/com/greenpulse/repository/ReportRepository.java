package com.greenpulse.repository;

import com.greenpulse.entity.Priority;
import com.greenpulse.entity.Report;
import com.greenpulse.entity.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Optional<Report> findByReportNumber(String reportNumber);
    
    Page<Report> findByCitizenId(Long citizenId, Pageable pageable);
    
    List<Report> findByCitizenId(Long citizenId);

    Page<Report> findByAssignedToId(Long workerId, Pageable pageable);

    List<Report> findByAssignedToId(Long workerId);

    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    Page<Report> findByPriority(Priority priority, Pageable pageable);

    @Query("SELECT r FROM Report r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:categoryId IS NULL OR r.category.id = :categoryId) AND " +
           "(:priority IS NULL OR r.priority = :priority) AND " +
           "(:search IS NULL OR LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.reportNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.address) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Report> findAllFiltered(@Param("status") ReportStatus status,
                                 @Param("categoryId") Long categoryId,
                                 @Param("priority") Priority priority,
                                 @Param("search") String search,
                                 Pageable pageable);

    // Nearby duplicate detection: Find reports within roughly ~0.005 degrees (~500m)
    @Query("SELECT r FROM Report r WHERE " +
           "r.status NOT IN ('CLOSED', 'REJECTED', 'DUPLICATE') AND " +
           "ABS(r.latitude - :lat) <= 0.005 AND ABS(r.longitude - :lng) <= 0.005")
    List<Report> findNearbyOpenReports(@Param("lat") Double lat, @Param("lng") Double lng);

    long countByStatus(ReportStatus status);
    
    long countByPriority(Priority priority);

    @Query("SELECT r.category.name, COUNT(r) FROM Report r GROUP BY r.category.name")
    List<Object[]> countByCategory();

    @Query("SELECT r.status, COUNT(r) FROM Report r GROUP BY r.status")
    List<Object[]> countByStatusGroup();

    @Query("SELECT r.priority, COUNT(r) FROM Report r GROUP BY r.priority")
    List<Object[]> countByPriorityGroup();
}
