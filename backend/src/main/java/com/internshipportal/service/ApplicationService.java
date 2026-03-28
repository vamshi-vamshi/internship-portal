package com.internshipportal.service;

import com.internshipportal.dto.ApplicationDtos.*;
import com.internshipportal.dto.InternshipDtos.PagedResponse;
import com.internshipportal.model.Application;
import com.internshipportal.model.Application.ApplicationStatus;
import com.internshipportal.model.Internship;
import com.internshipportal.model.User;
import com.internshipportal.repository.ApplicationRepository;
import com.internshipportal.repository.InternshipRepository;
import com.internshipportal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationService.class);

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private InternshipRepository  internshipRepository;
    @Autowired private UserRepository        userRepository;

    @Transactional
    public ApplicationResponse applyToInternship(Long internshipId, Long userId, ApplyRequest request) {
        log.info("User {} applying to internship {}", userId, internshipId);

        if (applicationRepository.existsByUserIdAndInternshipId(userId, internshipId)) {
            throw new RuntimeException("You have already applied to this internship.");
        }

        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new RuntimeException("Internship not found with id: " + internshipId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Application application = new Application();
        application.setUser(user);
        application.setInternship(internship);
        application.setName(request.getName());
        application.setEmail(request.getEmail());
        application.setResumeLink(request.getResumeLink());
        application.setStatus(ApplicationStatus.APPLIED);

        Application saved = applicationRepository.save(application);
        log.info("Application {} created for user {} on internship {}", saved.getId(), userId, internshipId);
        return mapToResponse(saved);
    }

    public PagedResponse<ApplicationResponse> getUserApplications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<Application> appPage = applicationRepository.findByUserIdOrderByAppliedAtDesc(userId, pageable);
        return buildPagedResponse(appPage, page, size);
    }

    public PagedResponse<ApplicationResponse> getApplicationsByInternship(Long internshipId, int page, int size) {
        if (!internshipRepository.existsById(internshipId)) {
            throw new RuntimeException("Internship not found with id: " + internshipId);
        }
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<Application> appPage = applicationRepository.findByInternshipId(internshipId, pageable);
        return buildPagedResponse(appPage, page, size);
    }

    public PagedResponse<ApplicationResponse> getAllApplications(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("appliedAt").descending());
        Page<Application> appPage = applicationRepository.findAll(pageable);
        return buildPagedResponse(appPage, page, size);
    }

    @Transactional
    public ApplicationResponse updateStatus(Long applicationId, ApplicationStatus status) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));
        log.info("Updating application {} status from {} to {}", applicationId, application.getStatus(), status);
        application.setStatus(status);
        return mapToResponse(applicationRepository.save(application));
    }

    public long countApplications(Long internshipId) {
        return applicationRepository.countByInternshipId(internshipId);
    }

    public ApplicationResponse mapToResponse(Application a) {
        ApplicationResponse r = new ApplicationResponse();
        r.setId(a.getId());
        r.setInternshipId(a.getInternship().getId());
        r.setInternshipTitle(a.getInternship().getTitle());
        r.setInternshipCompany(a.getInternship().getCompany());
        r.setInternshipLocation(a.getInternship().getLocation());
        r.setUserId(a.getUser().getId());
        r.setName(a.getName());
        r.setEmail(a.getEmail());
        r.setResumeLink(a.getResumeLink());
        r.setStatus(a.getStatus());
        r.setAppliedAt(a.getAppliedAt());
        return r;
    }

    private PagedResponse<ApplicationResponse> buildPagedResponse(Page<Application> page, int pageNo, int pageSize) {
        PagedResponse<ApplicationResponse> response = new PagedResponse<>();
        response.setContent(page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()));
        response.setPageNo(pageNo);
        response.setPageSize(pageSize);
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        return response;
    }
}
