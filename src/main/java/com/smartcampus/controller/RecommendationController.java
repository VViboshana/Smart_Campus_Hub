package com.smartcampus.controller;

import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.RecommendationResponseDTO;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/resources")
    public ResponseEntity<ApiResponse<List<RecommendationResponseDTO>>> getRecommendations(
            @RequestParam String userId,
            @RequestParam(defaultValue = "1") int requiredCapacity,
            @RequestParam String date,
            @RequestParam String startTime,
            @RequestParam String endTime) {
        try {
            LocalDate bookingDate = LocalDate.parse(date);
            LocalTime bookingStartTime = LocalTime.parse(startTime);
            LocalTime bookingEndTime = LocalTime.parse(endTime);

            List<RecommendationResponseDTO> result = recommendationService.getRecommendations(
                    userId,
                    requiredCapacity,
                    bookingDate,
                    bookingStartTime,
                    bookingEndTime
            );

            return ResponseEntity.ok(ApiResponse.success("Recommendations fetched", result));
        } catch (DateTimeParseException ex) {
            throw new BadRequestException("Invalid date/time format. Expected date YYYY-MM-DD and time HH:MM");
        }
    }
}
