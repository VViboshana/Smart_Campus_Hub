package com.smartcampus.service;

import com.smartcampus.dto.response.RecommendationResponseDTO;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.ResourceType;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final TicketRepository ticketRepository;

    public List<RecommendationResponseDTO> getRecommendations(String userId, int requiredCapacity, LocalDate date, LocalTime startTime, LocalTime endTime) {
        List<Resource> activeResources = resourceRepository.findByStatus(ResourceStatus.ACTIVE);
        List<Booking> userBookings = bookingRepository.findByUserId(userId);

        Optional<String> preferredResourceId = userBookings.stream()
                .collect(Collectors.groupingBy(Booking::getResourceId, Collectors.counting()))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey);

        Optional<ResourceType> preferredType = preferredResourceId
                .flatMap(resourceRepository::findById)
                .map(Resource::getType);

        Set<String> usedResourceIds = userBookings.stream()
                .map(Booking::getResourceId)
                .collect(Collectors.toSet());

        LocalDateTime recentThreshold = LocalDateTime.now().minusDays(7);

        return activeResources.stream()
                .map(resource -> {
                    int score = 0;
                    List<String> reasons = new ArrayList<>();

                    if (bookingRepository.findConflictingBookings(resource.getId(), date, startTime, endTime).isEmpty()) {
                        score += 30;
                        reasons.add("No scheduling conflicts");
                    }

                    if (preferredType.isPresent() && resource.getType() == preferredType.get()) {
                        score += 20;
                        reasons.add("Matches your preferred type");
                    }

                    if (resource.getCapacity() >= requiredCapacity && resource.getCapacity() <= requiredCapacity + 30) {
                        score += 15;
                        reasons.add("Best capacity fit");
                    }

                    if (usedResourceIds.contains(resource.getId())) {
                        score += 10;
                        reasons.add("You have used this before");
                    }

                    boolean hasRecentMaintenanceIssue = ticketRepository.findByResourceId(resource.getId()).stream()
                            .anyMatch(ticket -> isRecentOpenIssue(ticket, recentThreshold));

                    if (hasRecentMaintenanceIssue) {
                        score -= 20;
                        reasons.add("Recent maintenance issue reported");
                    }

                    return RecommendationResponseDTO.builder()
                            .resourceId(resource.getId())
                            .resourceName(resource.getName())
                            .resourceType(resource.getType() != null ? resource.getType().name() : null)
                            .location(resource.getLocation())
                            .building(resource.getBuilding())
                            .capacity(resource.getCapacity())
                            .score(score)
                            .reason(String.join(" · ", reasons))
                            .build();
                })
                .sorted(Comparator.comparingInt(RecommendationResponseDTO::getScore).reversed())
                .limit(3)
                .collect(Collectors.toList());
    }

    private boolean isRecentOpenIssue(Ticket ticket, LocalDateTime threshold) {
        if (ticket == null || ticket.getCreatedAt() == null || ticket.getStatus() == null) {
            return false;
        }

        return (ticket.getStatus() == TicketStatus.OPEN || ticket.getStatus() == TicketStatus.IN_PROGRESS)
                && ticket.getCreatedAt().isAfter(threshold);
    }
}
