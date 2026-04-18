package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponseDTO {
    private String resourceId;
    private String resourceName;
    private String resourceType;
    private String location;
    private String building;
    private int capacity;
    private int score;
    private String reason;
}
