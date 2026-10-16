
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

    @Query("""
        SELECT i FROM Internship i
        WHERE
          (CAST(:skills AS string) IS NULL
           OR LOWER(i.skills) LIKE LOWER(CONCAT('%', CAST(:skills AS string), '%')))
          AND
          (CAST(:location AS string) IS NULL
           OR LOWER(i.location) LIKE LOWER(CONCAT('%', CAST(:location AS string), '%')))
          AND
          (:maxExperience IS NULL OR i.minExperience <= :maxExperience)
        """)
    Page<Internship> findByFilters(
        @Param("skills") String skills,
        @Param("location") String location,
        @Param("maxExperience") Integer maxExperience,
        Pageable pageable
    );

    @Query("""
        SELECT i FROM Internship i
        WHERE
          (CAST(:skills AS string) IS NULL
           OR LOWER(i.skills) LIKE LOWER(CONCAT('%', CAST(:skills AS string), '%')))
          AND
          (CAST(:location AS string) IS NULL
           OR LOWER(i.location) LIKE LOWER(CONCAT('%', CAST(:location AS string), '%')))
          AND
          (:experienceYears IS NULL OR i.minExperience <= :experienceYears)
        """)
    Page<Internship> findRecommendations(
        @Param("skills") String skills,
        @Param("location") String location,
        @Param("experienceYears") Integer experienceYears,
        Pageable pageable
    );
}
