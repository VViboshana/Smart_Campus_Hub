package com.smartcampus.service;

import com.smartcampus.dto.request.ResourceRequest;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public Resource createResource(ResourceRequest request) {
        Resource resource = Resource.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .building(request.getBuilding())
                .floor(request.getFloor())
                .status(request.getStatus() != null ? request.getStatus() : ResourceStatus.ACTIVE)
                .availabilityWindows(request.getAvailabilityWindows())
                .amenities(request.getAmenities())
                .imageUrl(request.getImageUrl())
                .build();
        return Objects.requireNonNull(resourceRepository.save(Objects.requireNonNull(resource, "resource must not be null")),
            "saved resource must not be null");
    }

    public Resource updateResource(String id, ResourceRequest request) {
        Resource resource = getResourceById(id);
        resource.setName(request.getName());
        resource.setDescription(request.getDescription());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation());
        resource.setBuilding(request.getBuilding());
        resource.setFloor(request.getFloor());
        if (request.getStatus() != null) {
            resource.setStatus(request.getStatus());
        }
        if (request.getAvailabilityWindows() != null) {
            resource.setAvailabilityWindows(request.getAvailabilityWindows());
        }
        if (request.getAmenities() != null) {
            resource.setAmenities(request.getAmenities());
        }
        if (request.getImageUrl() != null) {
            resource.setImageUrl(request.getImageUrl());
        }
        return Objects.requireNonNull(resourceRepository.save(Objects.requireNonNull(resource, "resource must not be null")),
            "saved resource must not be null");
    }

    public void deleteResource(String id) {
        Resource resource = getResourceById(id);
        resourceRepository.delete(Objects.requireNonNull(resource, "resource must not be null"));
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(Objects.requireNonNull(id, "resource id must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", id));
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public List<Resource> searchResources(ResourceType type, String location, Integer minCapacity, ResourceStatus status) {
        if (type != null && status != null) {
            return resourceRepository.findByTypeAndStatus(type, status);
        }
        if (type != null) {
            return resourceRepository.findByType(type);
        }
        if (location != null && !location.isEmpty()) {
            return resourceRepository.findByLocationContainingIgnoreCase(location);
        }
        if (minCapacity != null) {
            return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
        }
        if (status != null) {
            return resourceRepository.findByStatus(status);
        }
        return resourceRepository.findAll();
    }
}
