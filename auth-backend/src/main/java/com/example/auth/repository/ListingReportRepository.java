package com.example.auth.repository;

import com.example.auth.entity.ListingReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingReportRepository extends JpaRepository<ListingReport, Long> {
    List<ListingReport> findByStatusOrderByCreatedAtDesc(String status);
    List<ListingReport> findAllByOrderByCreatedAtDesc();
}
