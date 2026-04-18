package com.smartcampus.controller;

import com.smartcampus.dto.response.AnalyticsDTO;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AnalyticsDTO>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success("Analytics fetched", analyticsService.getAnalytics()));
    }
}
