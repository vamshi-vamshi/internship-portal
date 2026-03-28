package com.internshipportal.service;

import com.internshipportal.dto.InternshipDtos.*;
import com.internshipportal.model.Internship;
import com.internshipportal.repository.InternshipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InternshipService {

    @Autowired
    private InternshipRepository internshipRepository;

    public PagedResponse<InternshipResponse> getAllInternships(
            String skills, String location, Integer maxExperience, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        String skillsParam = (skills != null && !skills.trim().isEmpty()) ? skills.trim() : null;
        String locationParam = (location != null && !location.trim().isEmpty()) ? location.trim() : null;

        Page<Internship> internshipPage = internshipRepository.findByFilters(
                skillsParam, locationParam, maxExperience, pageable);

        return buildPagedResponse(internshipPage, page, size);
    }

    public InternshipResponse getInternshipById(Long id) {
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Internship not found with id: " + id));
        return mapToResponse(internship);
    }

    public PagedResponse<InternshipResponse> getRecommendations(
            String skills, String preferredLocation, Integer experienceYears, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        String skillsParam = (skills != null && !skills.trim().isEmpty()) ? skills.trim() : null;
        String locationParam = (preferredLocation != null && !preferredLocation.trim().isEmpty())
                ? preferredLocation.trim() : null;

        Page<Internship> internshipPage = internshipRepository.findRecommendations(
                skillsParam, locationParam, experienceYears, pageable);

        return buildPagedResponse(internshipPage, page, size);
    }

    public InternshipResponse createInternship(InternshipRequest request) {
        Internship internship = mapToEntity(request);
        Internship saved = internshipRepository.save(internship);
        return mapToResponse(saved);
    }

    public InternshipResponse updateInternship(Long id, InternshipRequest request) {
        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Internship not found with id: " + id));

        internship.setTitle(request.getTitle());
        internship.setCompany(request.getCompany());
        internship.setDescription(request.getDescription());
        internship.setSkills(skillsListToString(request.getSkills()));
        internship.setLocation(request.getLocation());
        internship.setMinExperience(request.getMinExperience() != null ? request.getMinExperience() : 0);
        internship.setCompanyApplicationLink(request.getCompanyApplicationLink());
        internship.setStipend(request.getStipend());

        return mapToResponse(internshipRepository.save(internship));
    }

    public void deleteInternship(Long id) {
        if (!internshipRepository.existsById(id)) {
            throw new RuntimeException("Internship not found with id: " + id);
        }
        internshipRepository.deleteById(id);
    }

    // ===== Mapping helpers =====

    private Internship mapToEntity(InternshipRequest request) {
        Internship internship = new Internship();
        internship.setTitle(request.getTitle());
        internship.setCompany(request.getCompany());
        internship.setDescription(request.getDescription());
        internship.setSkills(skillsListToString(request.getSkills()));
        internship.setLocation(request.getLocation());
        internship.setMinExperience(request.getMinExperience() != null ? request.getMinExperience() : 0);
        internship.setCompanyApplicationLink(request.getCompanyApplicationLink());
        internship.setStipend(request.getStipend());
        return internship;
    }

    public InternshipResponse mapToResponse(Internship internship) {
        InternshipResponse response = new InternshipResponse();
        response.setId(internship.getId());
        response.setTitle(internship.getTitle());
        response.setCompany(internship.getCompany());
        response.setDescription(internship.getDescription());
        response.setSkills(stringToSkillsList(internship.getSkills()));
        response.setLocation(internship.getLocation());
        response.setMinExperience(internship.getMinExperience());
        response.setCompanyApplicationLink(internship.getCompanyApplicationLink());
        response.setStipend(internship.getStipend());
        response.setCreatedAt(internship.getCreatedAt());
        return response;
    }

    private String skillsListToString(List<String> skills) {
        if (skills == null || skills.isEmpty()) return "";
        return skills.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(", "));
    }

    private List<String> stringToSkillsList(String skills) {
        if (skills == null || skills.trim().isEmpty()) return List.of();
        return Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private PagedResponse<InternshipResponse> buildPagedResponse(Page<Internship> page, int pageNo, int pageSize) {
        PagedResponse<InternshipResponse> response = new PagedResponse<>();
        response.setContent(page.getContent().stream().map(this::mapToResponse).collect(Collectors.toList()));
        response.setPageNo(pageNo);
        response.setPageSize(pageSize);
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLast(page.isLast());
        return response;
    }
}
