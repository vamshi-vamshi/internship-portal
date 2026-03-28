package com.internshipportal.controller;

import com.internshipportal.dto.InternshipDtos.*;
import com.internshipportal.service.ApplicationService;
import com.internshipportal.service.InternshipService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
public class InternshipController {

    @Autowired
    private InternshipService internshipService;

    @Autowired
    private ApplicationService applicationService;

    // ===== PUBLIC: List & Detail =====

    @GetMapping("/api/internships")
    public ResponseEntity<PagedResponse<InternshipResponse>> getAllInternships(
            @RequestParam(required = false) String skills,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer maxExperience,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ResponseEntity.ok(internshipService.getAllInternships(skills, location, maxExperience, page, size));
    }

    @GetMapping("/api/internships/{id}")
    public ResponseEntity<InternshipResponse> getInternshipById(@PathVariable Long id) {
        return ResponseEntity.ok(internshipService.getInternshipById(id));
    }

    // ===== AUTHENTICATED: Recommendations =====

    @GetMapping("/api/recommendations")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<PagedResponse<InternshipResponse>> getRecommendations(
            @RequestParam(required = false) String skills,
            @RequestParam(required = false) String preferredLocation,
            @RequestParam(required = false) Integer experienceYears,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ResponseEntity.ok(
                internshipService.getRecommendations(skills, preferredLocation, experienceYears, page, size));
    }

    // ===== ADMIN: CRUD =====

    @GetMapping("/api/admin/internships")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PagedResponse<InternshipResponse>> adminListInternships(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<InternshipResponse> result = internshipService.getAllInternships(null, null, null, page, size);
        // Enrich with applicant counts
        result.getContent().forEach(r ->
            r.setApplicantCount(applicationService.countApplications(r.getId()))
        );
        return ResponseEntity.ok(result);
    }

    @PostMapping("/api/admin/internships")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InternshipResponse> createInternship(@Valid @RequestBody InternshipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(internshipService.createInternship(request));
    }

    @PutMapping("/api/admin/internships/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<InternshipResponse> updateInternship(
            @PathVariable Long id, @Valid @RequestBody InternshipRequest request) {
        return ResponseEntity.ok(internshipService.updateInternship(id, request));
    }

    @DeleteMapping("/api/admin/internships/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInternship(@PathVariable Long id) {
        internshipService.deleteInternship(id);
        return ResponseEntity.noContent().build();
    }
}
