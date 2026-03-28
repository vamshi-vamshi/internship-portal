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
     * Filter internships by skills (comma-separated string search),
     * location, and minimum experience — all done at the DB level.
     */
    @Query("SELECT i FROM Internship i WHERE " +
           "(:skills IS NULL OR LOWER(i.skills) LIKE LOWER(CONCAT('%', :skills, '%'))) AND " +
           "(:location IS NULL OR LOWER(i.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:maxExperience IS NULL OR i.minExperience <= :maxExperience) " +
           "ORDER BY i.createdAt DESC")
    Page<Internship> findByFilters(
        @Param("skills") String skills,
        @Param("location") String location,
        @Param("maxExperience") Integer maxExperience,
        Pageable pageable
    );

    /**
     * Recommendation query: match by user's skills and location preference.
     */
    @Query("SELECT i FROM Internship i WHERE " +
           "(:skills IS NULL OR LOWER(i.skills) LIKE LOWER(CONCAT('%', :skills, '%'))) AND " +
           "(:location IS NULL OR LOWER(i.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:experienceYears IS NULL OR i.minExperience <= :experienceYears) " +
           "ORDER BY i.createdAt DESC")
    Page<Internship> findRecommendations(
        @Param("skills") String skills,
        @Param("location") String location,
        @Param("experienceYears") Integer experienceYears,
        Pageable pageable
    );
}
