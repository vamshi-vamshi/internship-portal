package com.internshipportal.controller;

import com.internshipportal.dto.ApplicationDtos.*;
import com.internshipportal.dto.InternshipDtos.PagedResponse;
import com.internshipportal.repository.UserRepository;
import com.internshipportal.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
public class ApplicationController {

    @Autowired private ApplicationService applicationService;
    @Autowired private UserRepository userRepository;

    // ========== USER: Apply to internship ==========
    @PostMapping("/api/internships/{id}/apply")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<ApplicationResponse> apply(
            @PathVariable Long id,
            @Valid @RequestBody ApplyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = resolveUserId(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.applyToInternship(id, userId, request));
    }

    // ========== USER: My applications ==========
    @GetMapping("/api/user/applications")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PagedResponse<ApplicationResponse>> myApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(applicationService.getUserApplications(userId, page, size));
    }

    // ===== Helper =====
    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
    }
}
