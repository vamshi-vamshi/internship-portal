package com.internshipportal.controller;

import com.internshipportal.dto.AuthDtos.MessageResponse;
import com.internshipportal.dto.ApplicationDtos.ApplicationResponse;
import com.internshipportal.dto.ApplicationDtos.StatusUpdateRequest;
import com.internshipportal.dto.InternshipDtos.PagedResponse;
import com.internshipportal.model.User;
import com.internshipportal.repository.ApplicationRepository;
import com.internshipportal.repository.UserRepository;
import com.internshipportal.service.ApplicationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired private UserRepository userRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private ApplicationService applicationService;

    // ===== Dashboard Stats =====
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.countByRole(User.Role.USER));
        stats.put("totalApplications", applicationRepository.count());
        stats.put("pendingApplications", applicationRepository.countByStatus(
                com.internshipportal.model.Application.ApplicationStatus.APPLIED));
        stats.put("approvedApplications", applicationRepository.countByStatus(
                com.internshipportal.model.Application.ApplicationStatus.SHORTLISTED));
        stats.put("rejectedApplications", applicationRepository.countByStatus(
                com.internshipportal.model.Application.ApplicationStatus.REJECTED));
        return ResponseEntity.ok(stats);
    }

    // ===== View all users =====
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<User> userPage = userRepository.findByRole(
                User.Role.USER, PageRequest.of(page, size, Sort.by("createdAt").descending()));

        List<Map<String, Object>> users = userPage.getContent().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole().name());
            m.put("createdAt", u.getCreatedAt());
            m.put("applicationCount", applicationRepository.countByUserId(u.getId()));
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("users", users);
        response.put("totalElements", userPage.getTotalElements());
        response.put("totalPages", userPage.getTotalPages());
        response.put("currentPage", page);
        return ResponseEntity.ok(response);
    }

    // ===== View all applications =====
    @GetMapping("/applications")
    public ResponseEntity<PagedResponse<ApplicationResponse>> getAllApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(applicationService.getAllApplications(page, size));
    }

    // ===== Update application status =====
    @PutMapping("/applications/{id}/status/update")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        logger.info("Admin updating application {} to status {}", id, request.getStatus());
        return ResponseEntity.ok(applicationService.updateStatus(id, request.getStatus()));
    }

    // ===== View applicants for specific internship =====
    @GetMapping("/internships/{id}/applications")
    public ResponseEntity<PagedResponse<ApplicationResponse>> getApplicants(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(applicationService.getApplicationsByInternship(id, page, size));
    }

    // ===== Count applicants =====
    @GetMapping("/internships/{id}/applications-count")
    public ResponseEntity<Long> countApplicants(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.countApplications(id));
    }

    // ===== Delete a user =====
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        logger.info("Admin deleted user {}", id);
        return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
    }
}
