package com.smartcampus.controller;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.BookingReviewRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.Booking;
import com.smartcampus.model.BookingStatus;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final AuthService authService;

    // POST - Create a booking
    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> createBooking(@Valid @RequestBody BookingRequest request) {
        User currentUser = authService.getCurrentUser();
        Booking booking = bookingService.createBooking(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking request created successfully", booking));
    }

    // GET - Get current user's bookings
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Booking>>> getMyBookings() {
        User currentUser = authService.getCurrentUser();
        List<Booking> bookings = bookingService.getUserBookings(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    // GET - Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBookingById(@PathVariable String id) {
        Booking booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    // GET - Get all bookings (Admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Booking>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        List<Booking> bookings;
        if (status != null) {
            bookings = bookingService.getBookingsByStatus(status);
        } else {
            bookings = bookingService.getAllBookings();
        }
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    // PUT - Review booking (Approve/Reject) (Admin only)
    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Booking>> reviewBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingReviewRequest request) {
        User admin = authService.getCurrentUser();
        Booking booking = bookingService.reviewBooking(id, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Booking reviewed successfully", booking));
    }

    // PATCH - Cancel booking
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(@PathVariable String id) {
        User currentUser = authService.getCurrentUser();
        Booking booking = bookingService.cancelBooking(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
    }

    // GET - Get bookings by resource
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<ApiResponse<List<Booking>>> getBookingsByResource(@PathVariable String resourceId) {
        List<Booking> bookings = bookingService.getBookingsByResource(resourceId);
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }
}
