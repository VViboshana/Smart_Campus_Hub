package com.smartcampus.service;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.UnauthorizedException;
import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @SuppressWarnings("null")
    public Notification createNotification(@NonNull String userId, String title, String message,
                                            Notification.NotificationType type, String referenceId) {
        // Check user preferences before creating notification
        if (!shouldCreateNotification(userId, type)) {
            return null;
        }

        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .read(false)
                .build();
            return Objects.requireNonNull(notificationRepository.save(notification));
    }

    /**
     * Checks if a notification should be created based on user preferences
     */
    private boolean shouldCreateNotification(@NonNull String userId, @NonNull Notification.NotificationType type) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return true; // Create notification if user not found (fail-safe)
        }

        User user = userOpt.get();

        return switch (type) {
            case BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED ->
                    user.isBookingAlerts();
            case TICKET_STATUS_CHANGED, TICKET_ASSIGNED, TICKET_COMMENT ->
                    user.isTicketAlerts();
            default -> true; // GENERAL notifications are always created
        };
    }

    public List<Notification> getUserNotifications(@NonNull String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(@NonNull String userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(@NonNull String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @SuppressWarnings("null")
    public Notification markAsRead(@NonNull String notificationId, @NonNull User currentUser) {
        Notification notification = getOwnedNotification(notificationId, currentUser);
        notification.setRead(true);
        return Objects.requireNonNull(notificationRepository.save(notification));
    }

    public void markAllAsRead(@NonNull String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        if (!unread.isEmpty()) {
            notificationRepository.saveAll(unread);
        }
    }

    public void deleteNotification(@NonNull String notificationId, @NonNull User currentUser) {
        getOwnedNotification(notificationId, currentUser);
        notificationRepository.deleteById(notificationId);
    }

    private Notification getOwnedNotification(@NonNull String notificationId, @NonNull User currentUser) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUserId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only access your own notifications");
        }

        return notification;
    }

    /**
     * Gets user notification preferences
     */
    public User getUserPreferences(@NonNull String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    /**
     * Updates user notification preferences
     */
    public User updateUserPreferences(@NonNull String userId, boolean emailAlerts, boolean ticketAlerts, boolean bookingAlerts, boolean compactMode) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setEmailAlerts(emailAlerts);
        user.setTicketAlerts(ticketAlerts);
        user.setBookingAlerts(bookingAlerts);
        user.setCompactMode(compactMode);

        return Objects.requireNonNull(userRepository.save(user));
    }
}
