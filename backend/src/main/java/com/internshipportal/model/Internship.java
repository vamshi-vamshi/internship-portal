package com.internshipportal.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "internships", indexes = {
    @Index(name = "idx_internship_skills", columnList = "skills"),
    @Index(name = "idx_internship_location", columnList = "location")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 200)
    private String company;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String skills; // Stored as comma-separated string, indexed for search

    @Column(length = 150)
    private String location;

    @Column(name = "min_experience")
    private Integer minExperience = 0;

    @Column(name = "company_application_link", length = 500)
    private String companyApplicationLink;

    @Column(length = 100)
    private String stipend;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
