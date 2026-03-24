package com.smartcampus.controller;

import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    // GET - Get all notifications for current user
    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications() {
        User currentUser = authService.getCurrentUser();
        String userId = Objects.requireNonNull(currentUser.getId());
        List<Notification> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    // GET - Get unread notifications
    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnreadNotifications() {
        User currentUser = authService.getCurrentUser();
        String userId = Objects.requireNonNull(currentUser.getId());
        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    // GET - Get unread count
    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        User currentUser = authService.getCurrentUser();
        String userId = Objects.requireNonNull(currentUser.getId());
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    // PATCH - Mark notification as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(@PathVariable String id) {
        User currentUser = authService.getCurrentUser();
        Notification notification = notificationService.markAsRead(Objects.requireNonNull(id), Objects.requireNonNull(currentUser));
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", notification));
    }

    // PATCH - Mark all notifications as read
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User currentUser = authService.getCurrentUser();
        notificationService.markAllAsRead(Objects.requireNonNull(currentUser.getId()));
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    // DELETE - Delete notification
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable String id) {
        User currentUser = authService.getCurrentUser();
        notificationService.deleteNotification(Objects.requireNonNull(id), Objects.requireNonNull(currentUser));
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }
}
