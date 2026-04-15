package com.smartcampus.dto.request;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequest {
    @NotBlank(message = "Resource name is required")
    private String name;

    private String description;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @Min(value = 0, message = "Capacity must be non-negative")
    private int capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String building;

    private String floor;

    private ResourceStatus status;

    private List<Resource.AvailabilityWindow> availabilityWindows;

    private List<String> amenities;

    private String imageUrl;
}
