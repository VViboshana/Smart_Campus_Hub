package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapResourceDTO {
    private String resourceId;
    private String name;
    private String type;
    private String location;
    private String building;
    private int capacity;
    private double bookingDensity;
    private String status;
}
