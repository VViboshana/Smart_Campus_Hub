package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class Resource {

    @Id
    private String id;

    private String name;

    private String description;

    private ResourceType type;

    private int capacity;

    private String location;

    private String building;

    private String floor;

    @Builder.Default
    private ResourceStatus status = ResourceStatus.ACTIVE;

    @Builder.Default
    private List<AvailabilityWindow> availabilityWindows = new ArrayList<>();

    @Builder.Default
    private List<String> amenities = new ArrayList<>();

    private String imageUrl;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilityWindow {
        private String dayOfWeek; // MONDAY, TUESDAY, etc.
        private String startTime; // HH:mm format
        private String endTime;   // HH:mm format
    }
}
