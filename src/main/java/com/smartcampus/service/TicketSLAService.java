package com.smartcampus.service;

import com.smartcampus.dto.response.TicketSLADTO;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class TicketSLAService {

    private static final long CRITICAL = 8L;
    private static final long HIGH = 24L;
    private static final long MEDIUM = 48L;
    private static final long LOW = 72L;

    private final TicketRepository ticketRepository;

    public TicketSLADTO getSLA(String ticketId) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new BadRequestException("Ticket not found"));

        LocalDateTime referenceTime;
        if (ticket.getStatus() == TicketStatus.RESOLVED && ticket.getResolvedAt() != null) {
            referenceTime = ticket.getResolvedAt();
        } else if (ticket.getStatus() == TicketStatus.CLOSED && ticket.getClosedAt() != null) {
            referenceTime = ticket.getClosedAt();
        } else {
            referenceTime = LocalDateTime.now();
        }

        long hoursElapsed = ChronoUnit.HOURS.between(ticket.getCreatedAt(), referenceTime);

        long slaLimitHours = switch (ticket.getPriority()) {
            case CRITICAL -> CRITICAL;
            case HIGH -> HIGH;
            case MEDIUM -> MEDIUM;
            case LOW -> LOW;
        };

        boolean breached = hoursElapsed > slaLimitHours;
        double percentUsed = Math.min((hoursElapsed * 100.0) / slaLimitHours, 100.0);

        String slaStatus;
        if (percentUsed < 70.0) {
            slaStatus = "ON_TRACK";
        } else if (percentUsed < 100.0) {
            slaStatus = "AT_RISK";
        } else {
            slaStatus = "BREACHED";
        }

        return TicketSLADTO.builder()
                .ticketId(ticketId)
                .hoursElapsed(hoursElapsed)
                .slaLimitHours(slaLimitHours)
                .breached(breached)
                .slaStatus(slaStatus)
                .percentUsed(percentUsed)
                .build();
    }
}
