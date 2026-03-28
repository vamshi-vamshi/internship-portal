package com.internshipportal.repository;

import com.internshipportal.model.Application;
import com.internshipportal.model.Application.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByUserIdAndInternshipId(Long userId, Long internshipId);

    Page<Application> findByUserIdOrderByAppliedAtDesc(Long userId, Pageable pageable);

    Page<Application> findByInternshipId(Long internshipId, Pageable pageable);

    long countByInternshipId(Long internshipId);

    long countByUserId(Long userId);

    long countByStatus(ApplicationStatus status);

    List<Application> findByUserIdAndStatus(Long userId, ApplicationStatus status);
}
