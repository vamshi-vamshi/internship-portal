package com.internshipportal.repository;

import com.internshipportal.model.Internship;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InternshipRepository extends JpaRepository<Internship, Long> {

    /**
     * Filter internships by skills, location, and max experience.
     * NOTE: ORDER BY removed from JPQL — Pageable.Sort handles ordering.
     * Having both causes a HibernateException in some versions.
     */
    @Query("SELECT i FROM Internship i WHERE " +
           "(:skills IS NULL OR LOWER(i.skills) LIKE LOWER(CONCAT('%', :skills, '%'))) AND " +
           "(:location IS NULL OR LOWER(i.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:maxExperience IS NULL OR i.minExperience <= :maxExperience)")
    Page<Internship> findByFilters(
        @Param("skills") String skills,
        @Param("location") String location,
        @Param("maxExperience") Integer maxExperience,
        Pageable pageable
    );

    /**
     * Recommendation query — same fix applied.
     */
    @Query("SELECT i FROM Internship i WHERE " +
           "(:skills IS NULL OR LOWER(i.skills) LIKE LOWER(CONCAT('%', :skills, '%'))) AND " +
           "(:location IS NULL OR LOWER(i.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:experienceYears IS NULL OR i.minExperience <= :experienceYears)")
    Page<Internship> findRecommendations(
        @Param("skills") String skills,
        @Param("location") String location,
        @Param("experienceYears") Integer experienceYears,
        Pageable pageable
    );
}
