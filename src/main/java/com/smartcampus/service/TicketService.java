package com.smartcampus.service;

import com.smartcampus.dto.request.TicketRequest;
import com.smartcampus.dto.request.TicketUpdateRequest;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.model.*;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final FileStorageService fileStorageService;

    public Ticket createTicket(TicketRequest request, User currentUser, List<MultipartFile> images) {
        // Validate max 3 images
        if (images != null && images.size() > 3) {
            throw new BadRequestException("Maximum of 3 image attachments allowed");
        }

        Ticket ticket = Ticket.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .resourceId(request.getResourceId())
                .location(request.getLocation())
                .reporterId(currentUser.getId())
                .reporterName(currentUser.getName())
                .contactEmail(request.getContactEmail() != null ? request.getContactEmail() : currentUser.getEmail())
                .contactPhone(request.getContactPhone())
                .build();

        // Handle image uploads
        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = images.stream()
                    .map(fileStorageService::storeFile)
                    .toList();
            ticket.setAttachmentUrls(imageUrls);
        }

        return Objects.requireNonNull(ticketRepository.save(Objects.requireNonNull(ticket, "ticket must not be null")),
            "saved ticket must not be null");
    }

    public Ticket updateTicketStatus(String ticketId, TicketUpdateRequest request, User currentUser) {
        Ticket ticket = getTicketById(ticketId);

        // Validate status transition
        validateStatusTransition(ticket.getStatus(), request.getStatus());

        ticket.setStatus(request.getStatus());

        if (request.getResolutionNotes() != null) {
            ticket.setResolutionNotes(request.getResolutionNotes());
        }

        if (request.getRejectionReason() != null && request.getStatus() == TicketStatus.REJECTED) {
            ticket.setRejectionReason(request.getRejectionReason());
        }

        if (request.getAssignedTechnicianId() != null) {
                User technician = userRepository.findById(Objects.requireNonNull(request.getAssignedTechnicianId(), "assigned technician id must not be null"))
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getAssignedTechnicianId()));
            ticket.setAssignedTechnicianId(technician.getId());
            ticket.setAssignedTechnicianName(technician.getName());

            // Notify technician of assignment
            notificationService.createNotification(
                    Objects.requireNonNull(technician.getId(), "technician id must not be null"),
                    "Ticket Assigned",
                    "You have been assigned to ticket: " + ticket.getTitle(),
                    Notification.NotificationType.TICKET_ASSIGNED,
                    ticket.getId()
            );
        }

        if (request.getStatus() == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        if (request.getStatus() == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        ticket = Objects.requireNonNull(ticketRepository.save(Objects.requireNonNull(ticket, "ticket must not be null")),
            "saved ticket must not be null");

        // Notify reporter of status change
        notificationService.createNotification(
            Objects.requireNonNull(ticket.getReporterId(), "ticket reporter id must not be null"),
                "Ticket Status Updated",
                "Your ticket '" + ticket.getTitle() + "' status changed to " + request.getStatus(),
                Notification.NotificationType.TICKET_STATUS_CHANGED,
                ticket.getId()
        );

        return ticket;
    }

    public Ticket assignTechnician(String ticketId, String technicianId) {
        Ticket ticket = getTicketById(ticketId);
        User technician = userRepository.findById(Objects.requireNonNull(technicianId, "technician id must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", technicianId));

        ticket.setAssignedTechnicianId(technician.getId());
        ticket.setAssignedTechnicianName(technician.getName());

        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        ticket = Objects.requireNonNull(ticketRepository.save(Objects.requireNonNull(ticket, "ticket must not be null")),
            "saved ticket must not be null");

        notificationService.createNotification(
            Objects.requireNonNull(technician.getId(), "technician id must not be null"),
                "Ticket Assigned",
                "You have been assigned to ticket: " + ticket.getTitle(),
                Notification.NotificationType.TICKET_ASSIGNED,
                ticket.getId()
        );

        notificationService.createNotification(
            Objects.requireNonNull(ticket.getReporterId(), "ticket reporter id must not be null"),
                "Technician Assigned",
                "A technician has been assigned to your ticket: " + ticket.getTitle(),
                Notification.NotificationType.TICKET_STATUS_CHANGED,
                ticket.getId()
        );

        return ticket;
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(Objects.requireNonNull(id, "ticket id must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", id));
    }

    public List<Ticket> getUserTickets(String userId) {
        return ticketRepository.findByReporterId(userId);
    }

    public List<Ticket> getTechnicianTickets(String technicianId) {
        return ticketRepository.findByAssignedTechnicianId(technicianId);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getTicketsByStatus(TicketStatus status) {
        return ticketRepository.findByStatus(status);
    }

    public List<Ticket> getTicketsByPriority(TicketPriority priority) {
        return ticketRepository.findByPriority(priority);
    }

    public void deleteTicket(String ticketId, User currentUser) {
        Ticket ticket = getTicketById(ticketId);
        boolean isAdmin = currentUser.getRoles().contains(Role.ADMIN);
        if (!ticket.getReporterId().equals(currentUser.getId()) && !isAdmin) {
            throw new UnauthorizedException("You can only delete your own tickets");
        }
        ticketRepository.delete(Objects.requireNonNull(ticket, "ticket must not be null"));
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED || next == TicketStatus.REJECTED;
            case RESOLVED -> next == TicketStatus.CLOSED;
            case CLOSED, REJECTED -> false;
        };

        if (!valid) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + next);
        }
    }
}
