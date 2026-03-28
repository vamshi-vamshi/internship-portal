package com.internshipportal.dto;

import com.internshipportal.model.Application.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

public class ApplicationDtos {

    @Data
    public static class ApplyRequest {
        @NotBlank(message = "Name is required")
        @Size(max = 100)
        private String name;

        @NotBlank(message = "Email is required")
        @Size(max = 150)
        private String email;

        @Size(max = 500, message = "Resume link too long")
        private String resumeLink;
    }

    @Data
    public static class StatusUpdateRequest {
        @NotNull(message = "Status is required")
        private ApplicationStatus status;
    }

    @Data
    public static class ApplicationResponse {
        private Long id;
        private Long internshipId;
        private String internshipTitle;
        private String internshipCompany;
        private String internshipLocation;
        private Long userId;
        private String name;
        private String email;
        private String resumeLink;
        private ApplicationStatus status;
        private LocalDateTime appliedAt;
    }
}
