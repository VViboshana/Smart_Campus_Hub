package com.smartcampus.controller;

import com.smartcampus.dto.request.TicketRequest;
import com.smartcampus.dto.request.TicketUpdateRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketPriority;
import com.smartcampus.model.TicketStatus;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final AuthService authService;

    // POST - Create ticket with optional image attachments
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Ticket>> createTicket(
            @Valid @RequestPart("ticket") TicketRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        User currentUser = authService.getCurrentUser();
        Ticket ticket = ticketService.createTicket(request, currentUser, images);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created successfully", ticket));
    }

    // GET - Get current user's tickets
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Ticket>>> getMyTickets() {
        User currentUser = authService.getCurrentUser();
        List<Ticket> tickets = ticketService.getUserTickets(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    // GET - Get ticket by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Ticket>> getTicketById(@PathVariable String id) {
        Ticket ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(ApiResponse.success(ticket));
    }

    // GET - Get all tickets (Admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Ticket>>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority) {
        List<Ticket> tickets;
        if (status != null) {
            tickets = ticketService.getTicketsByStatus(status);
        } else if (priority != null) {
            tickets = ticketService.getTicketsByPriority(priority);
        } else {
            tickets = ticketService.getAllTickets();
        }
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    // PUT - Update ticket status
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<Ticket>> updateTicketStatus(
            @PathVariable String id,
            @Valid @RequestBody TicketUpdateRequest request) {
        User currentUser = authService.getCurrentUser();
        Ticket ticket = ticketService.updateTicketStatus(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated successfully", ticket));
    }

    // PATCH - Assign technician to ticket (Admin only)
    @PatchMapping("/{id}/assign/{technicianId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Ticket>> assignTechnician(
            @PathVariable String id,
            @PathVariable String technicianId) {
        Ticket ticket = ticketService.assignTechnician(id, technicianId);
        return ResponseEntity.ok(ApiResponse.success("Technician assigned successfully", ticket));
    }

    // GET - Get technician's assigned tickets
    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ApiResponse<List<Ticket>>> getAssignedTickets() {
        User currentUser = authService.getCurrentUser();
        List<Ticket> tickets = ticketService.getTechnicianTickets(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(tickets));
    }

    // DELETE - Delete ticket
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(@PathVariable String id) {
        User currentUser = authService.getCurrentUser();
        ticketService.deleteTicket(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Ticket deleted successfully", null));
    }
}
