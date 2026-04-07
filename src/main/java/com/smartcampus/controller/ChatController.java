package com.smartcampus.controller;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.ChatRequest;
import com.smartcampus.dto.request.TicketRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.ChatResponse;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.BookingService;
import com.smartcampus.service.ChatService;
import com.smartcampus.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final BookingService bookingService;
    private final TicketService ticketService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@Valid @RequestBody ChatRequest request) {
        ChatResponse response = chatService.processMessage(request.getMessage());
        return ResponseEntity.ok(ApiResponse.success("Chat response generated", response));
    }

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<Booking>> chatBooking(@Valid @RequestBody BookingRequest request) {
        User currentUser = authService.getCurrentUser();
        Booking booking = bookingService.createBooking(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully via chat!", booking));
    }

    @PostMapping("/ticket")
    public ResponseEntity<ApiResponse<Ticket>> chatTicket(@Valid @RequestBody TicketRequest request) {
        User currentUser = authService.getCurrentUser();
        Ticket ticket = ticketService.createTicket(request, currentUser, null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created successfully via chat!", ticket));
    }
}
