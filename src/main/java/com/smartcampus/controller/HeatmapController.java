package com.smartcampus.controller;

import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.HeatmapResourceDTO;
import com.smartcampus.service.HeatmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/heatmap")
@RequiredArgsConstructor
public class HeatmapController {

    private final HeatmapService heatmapService;

    @GetMapping("/resources")
    public ResponseEntity<ApiResponse<List<HeatmapResourceDTO>>> getHeatmap(
            @RequestParam(required = false) String date) {
        LocalDate targetDate = date == null ? LocalDate.now() : LocalDate.parse(date);
        return ResponseEntity.ok(ApiResponse.success("Heatmap fetched", heatmapService.getHeatmap(targetDate)));
    }
}
