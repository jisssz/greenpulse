package com.greenpulse.repository;

import com.greenpulse.entity.InvestigationNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvestigationNoteRepository extends JpaRepository<InvestigationNote, Long> {
    List<InvestigationNote> findByEnforcementCaseIdOrderByCreatedAtAsc(Long enforcementCaseId);
    List<InvestigationNote> findByEnforcementCaseIdAndIsInternalFalseOrderByCreatedAtAsc(Long enforcementCaseId);
}
