package com.smartcampus.service;

import com.smartcampus.dto.request.BookingRequest;
import com.smartcampus.dto.request.BookingReviewRequest;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.model.*;
import com.smartcampus.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceService resourceService;
    private final NotificationService notificationService;

    public Booking createBooking(BookingRequest request, User currentUser) {
        // Validate resource exists and is active
        Resource resource = resourceService.getResourceById(request.getResourceId());
        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new BadRequestException("Resource is not available for booking (status: " + resource.getStatus() + ")");
        }

        // Validate time range
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().equals(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        // Check capacity
        if (resource.getCapacity() > 0 && request.getExpectedAttendees() > resource.getCapacity()) {
            throw new BadRequestException("Expected attendees (" + request.getExpectedAttendees()
                    + ") exceeds resource capacity (" + resource.getCapacity() + ")");
        }

        // Check for scheduling conflicts
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                request.getResourceId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new ConflictException("Scheduling conflict: The resource is already booked for the requested time range");
        }

        Booking booking = Booking.builder()
                .resourceId(resource.getId())
                .resourceName(resource.getName())
                .userId(currentUser.getId())
                .userName(currentUser.getName())
                .bookingDate(request.getBookingDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        return Objects.requireNonNull(bookingRepository.save(Objects.requireNonNull(booking, "booking must not be null")),
            "saved booking must not be null");
    }

    public Booking reviewBooking(String bookingId, BookingReviewRequest request, User admin) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be reviewed");
        }

        if (request.getStatus() != BookingStatus.APPROVED && request.getStatus() != BookingStatus.REJECTED) {
            throw new BadRequestException("Review status must be APPROVED or REJECTED");
        }

        booking.setStatus(request.getStatus());
        booking.setAdminRemarks(request.getRemarks());
        booking.setReviewedBy(admin.getId());
        booking.setReviewedAt(LocalDateTime.now());

        booking = Objects.requireNonNull(bookingRepository.save(Objects.requireNonNull(booking, "booking must not be null")),
            "saved booking must not be null");

        // Send notification
        Notification.NotificationType notifType = request.getStatus() == BookingStatus.APPROVED
                ? Notification.NotificationType.BOOKING_APPROVED
                : Notification.NotificationType.BOOKING_REJECTED;

        String statusText = request.getStatus() == BookingStatus.APPROVED ? "approved" : "rejected";
        notificationService.createNotification(
            Objects.requireNonNull(booking.getUserId(), "booking user id must not be null"),
                "Booking " + statusText,
                "Your booking for " + booking.getResourceName() + " on " + booking.getBookingDate()
                        + " has been " + statusText + "."
                        + (request.getRemarks() != null ? " Reason: " + request.getRemarks() : ""),
                notifType,
                booking.getId()
        );

        return booking;
    }

    public Booking cancelBooking(String bookingId, User currentUser) {
        Booking booking = getBookingById(bookingId);

        if (!booking.getUserId().equals(currentUser.getId())) {
            boolean isAdmin = currentUser.getRoles().contains(Role.ADMIN);
            if (!isAdmin) {
                throw new UnauthorizedException("You can only cancel your own bookings");
            }
        }

        if (booking.getStatus() != BookingStatus.APPROVED && booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking = Objects.requireNonNull(bookingRepository.save(Objects.requireNonNull(booking, "booking must not be null")),
            "saved booking must not be null");

        // Notify the user
        notificationService.createNotification(
            Objects.requireNonNull(booking.getUserId(), "booking user id must not be null"),
                "Booking Cancelled",
                "Your booking for " + booking.getResourceName() + " on " + booking.getBookingDate() + " has been cancelled.",
                Notification.NotificationType.BOOKING_CANCELLED,
                booking.getId()
        );

        return booking;
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(Objects.requireNonNull(id, "booking id must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", id));
    }

    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public List<Booking> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    public List<Booking> getBookingsByResource(String resourceId) {
        return bookingRepository.findByResourceId(resourceId);
    }
}
