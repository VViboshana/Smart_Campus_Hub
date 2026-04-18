package com.smartcampus.service;

import com.smartcampus.dto.response.AnalyticsDTO;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceStatus;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public AnalyticsDTO getAnalytics() {
        List<Resource> allResources = resourceRepository.findAll();
        int totalResources = allResources.size();
        int activeResources = resourceRepository.findByStatus(ResourceStatus.ACTIVE).size();

        List<Booking> allBookings = bookingRepository.findAll();
        int totalBookings = allBookings.size();
        int pendingBookings = (int) allBookings.stream().filter(b -> b.getStatus() == BookingStatus.PENDING).count();
        int approvedBookings = (int) allBookings.stream().filter(b -> b.getStatus() == BookingStatus.APPROVED).count();

        List<Ticket> allTickets = ticketRepository.findAll();
        int totalTickets = allTickets.size();
        int openTickets = (int) allTickets.stream().filter(t -> t.getStatus() == TicketStatus.OPEN).count();
        int resolvedTickets = (int) allTickets.stream().filter(t -> t.getStatus() == TicketStatus.RESOLVED).count();

        int totalUsers = userRepository.findAll().size();

        Map<String, Long> bookingsByResourceType = allBookings.stream()
                .map(booking -> resourceRepository.findById(booking.getResourceId()))
                .flatMap(java.util.Optional::stream)
                .map(resource -> resource.getType().name())
                .collect(Collectors.groupingBy(type -> type, Collectors.counting()));

        Map<String, Long> ticketsByPriority = allTickets.stream()
                .collect(Collectors.groupingBy(ticket -> ticket.getPriority().name(), Collectors.counting()));

        Map<String, Long> bookingsByStatus = allBookings.stream()
                .collect(Collectors.groupingBy(booking -> booking.getStatus().name(), Collectors.counting()));

        List<String> topBookedResources = allBookings.stream()
                .collect(Collectors.groupingBy(Booking::getResourceName, Collectors.counting()))
                .entrySet()
                .stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        return AnalyticsDTO.builder()
                .totalResources(totalResources)
                .activeResources(activeResources)
                .totalBookings(totalBookings)
                .pendingBookings(pendingBookings)
                .approvedBookings(approvedBookings)
                .totalTickets(totalTickets)
                .openTickets(openTickets)
                .resolvedTickets(resolvedTickets)
                .totalUsers(totalUsers)
                .bookingsByResourceType(bookingsByResourceType)
                .ticketsByPriority(ticketsByPriority)
                .bookingsByStatus(bookingsByStatus)
                .topBookedResources(topBookedResources)
                .build();
    }
}
