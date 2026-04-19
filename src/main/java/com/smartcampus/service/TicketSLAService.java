package com.smartcampus.service;

import com.smartcampus.dto.response.TicketSLADTO;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TicketSLAService {

    private static final long CRITICAL = 8L;
    private static final long HIGH = 24L;
    private static final long MEDIUM = 48L;
    private static final long LOW = 72L;

    private final TicketRepository ticketRepository;

    public TicketSLADTO getSLA(String ticketId) {
        Ticket ticket = ticketRepository.findById(Objects.requireNonNull(ticketId, "ticket id must not be null"))
                .orElseThrow(() -> new BadRequestException("Ticket not found"));

        if (ticket.getCreatedAt() == null) {
            throw new BadRequestException("Ticket creation time is not available for SLA calculation");
        }

        LocalDateTime referenceTime;
        if (ticket.getStatus() == TicketStatus.RESOLVED && ticket.getResolvedAt() != null) {
            referenceTime = ticket.getResolvedAt();
        } else if (ticket.getStatus() == TicketStatus.CLOSED && ticket.getClosedAt() != null) {
            referenceTime = ticket.getClosedAt();
        } else {
            referenceTime = LocalDateTime.now();
        }

        long minutesElapsed = Math.max(0, ChronoUnit.MINUTES.between(ticket.getCreatedAt(), referenceTime));
        long hoursElapsed = minutesElapsed / 60;

        long slaLimitHours = switch (ticket.getPriority()) {
            case CRITICAL -> CRITICAL;
            case HIGH -> HIGH;
            case MEDIUM -> MEDIUM;
            case LOW -> LOW;
        };

        boolean breached = minutesElapsed > slaLimitHours * 60;
        double percentUsed = Math.min((minutesElapsed * 100.0) / (slaLimitHours * 60.0), 100.0);

        boolean finalState = ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED;

        String slaStatus;
        if (finalState) {
            slaStatus = breached ? "BREACHED" : "MET";
        } else {
            if (percentUsed < 70.0) {
                slaStatus = "ON_TRACK";
            } else if (percentUsed < 100.0) {
                slaStatus = "AT_RISK";
            } else {
                slaStatus = "BREACHED";
            }
        }

        long displayHours = minutesElapsed / 60;
        long displayMinutes = minutesElapsed % 60;
        String elapsedDisplay = displayHours > 0
                ? displayHours + "h " + displayMinutes + "m"
                : displayMinutes + "m";

        return TicketSLADTO.builder()
                .ticketId(ticketId)
                .ticketStatus(ticket.getStatus().name())
                .hoursElapsed(hoursElapsed)
                .minutesElapsed(minutesElapsed)
                .elapsedDisplay(elapsedDisplay)
                .slaLimitHours(slaLimitHours)
                .breached(breached)
                .finalState(finalState)
                .slaStatus(slaStatus)
                .percentUsed(percentUsed)
                .build();
    }
}
