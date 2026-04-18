package com.smartcampus.service;

import com.smartcampus.dto.response.HeatmapResourceDTO;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HeatmapService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    public List<HeatmapResourceDTO> getHeatmap(LocalDate date) {
        List<Resource> resources = resourceRepository.findAll();

        return resources.stream()
                .map(resource -> {
                    List<Booking> approvedBookings = bookingRepository
                            .findByResourceIdAndBookingDate(resource.getId(), date)
                            .stream()
                            .filter(booking -> booking.getStatus() == BookingStatus.APPROVED)
                            .collect(Collectors.toList());

                    long totalMinutes = approvedBookings.stream()
                            .mapToLong(b -> ChronoUnit.MINUTES.between(b.getStartTime(), b.getEndTime()))
                            .sum();

                    double bookingDensity = Math.min(totalMinutes / 720.0, 1.0);

                    return HeatmapResourceDTO.builder()
                            .resourceId(resource.getId())
                            .name(resource.getName())
                            .type(resource.getType().name())
                            .location(resource.getLocation())
                            .building(resource.getBuilding())
                            .capacity(resource.getCapacity())
                            .bookingDensity(bookingDensity)
                            .status(resource.getStatus().name())
                            .build();
                })
                .sorted(Comparator
                        .comparing((HeatmapResourceDTO dto) -> Objects.toString(dto.getBuilding(), ""))
                        .thenComparing(dto -> Objects.toString(dto.getName(), "")))
                .collect(Collectors.toList());
    }
}
