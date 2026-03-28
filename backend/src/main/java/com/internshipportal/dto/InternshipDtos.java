package com.internshipportal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class InternshipDtos {

    @Data
    public static class InternshipRequest {
        @NotBlank(message = "Title is required")
        @Size(max = 200)
        private String title;

        @NotBlank(message = "Company is required")
        @Size(max = 200)
        private String company;

        private String description;

        private List<String> skills;

        @Size(max = 150)
        private String location;

        private Integer minExperience = 0;

        @Size(max = 500)
        private String companyApplicationLink;

        @Size(max = 100)
        private String stipend;
    }

    @Data
    public static class InternshipResponse {
        private Long id;
        private String title;
        private String company;
        private String description;
        private List<String> skills;
        private String location;
        private Integer minExperience;
        private String companyApplicationLink;
        private String stipend;
        private LocalDateTime createdAt;
        private Long applicantCount; // populated by admin endpoints
    }

    @Data
    public static class PagedResponse<T> {
        private List<T> content;
        private int pageNo;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }
}
