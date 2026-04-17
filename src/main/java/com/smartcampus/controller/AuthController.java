package com.smartcampus.controller;

import com.smartcampus.dto.request.ChangePasswordRequest;
import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.request.UpdateProfileRequest;
import com.smartcampus.dto.request.UpdatePreferencesRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.dto.response.UserPreferencesResponse;
import com.smartcampus.model.User;
import com.smartcampus.service.AuthService;
import com.smartcampus.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final NotificationService notificationService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<User>> getCurrentUser() {
        User user = authService.getCurrentUser();
        user.setPassword(null); // Don't expose password
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<User>> updateCurrentUser(@Valid @RequestBody UpdateProfileRequest request) {
        User updated = authService.updateCurrentUserProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changeCurrentUserPassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changeCurrentUserPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully", null));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteCurrentUser() {
        authService.deleteCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully", null));
    }

    @GetMapping("/me/preferences")
    public ResponseEntity<ApiResponse<UserPreferencesResponse>> getUserPreferences() {
        User currentUser = authService.getCurrentUser();
        User userWithPrefs = notificationService.getUserPreferences(currentUser.getId());
        UserPreferencesResponse response = UserPreferencesResponse.builder()
                .userId(userWithPrefs.getId())
                .emailAlerts(userWithPrefs.isEmailAlerts())
                .ticketAlerts(userWithPrefs.isTicketAlerts())
                .bookingAlerts(userWithPrefs.isBookingAlerts())
                .compactMode(userWithPrefs.isCompactMode())
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/me/preferences")
    public ResponseEntity<ApiResponse<UserPreferencesResponse>> updateUserPreferences(@Valid @RequestBody UpdatePreferencesRequest request) {
        User currentUser = authService.getCurrentUser();
        User updated = notificationService.updateUserPreferences(
                currentUser.getId(),
                request.getEmailAlerts() != null ? request.getEmailAlerts() : currentUser.isEmailAlerts(),
                request.getTicketAlerts() != null ? request.getTicketAlerts() : currentUser.isTicketAlerts(),
                request.getBookingAlerts() != null ? request.getBookingAlerts() : currentUser.isBookingAlerts(),
                request.getCompactMode() != null ? request.getCompactMode() : currentUser.isCompactMode()
        );
        UserPreferencesResponse response = UserPreferencesResponse.builder()
                .userId(updated.getId())
                .emailAlerts(updated.isEmailAlerts())
                .ticketAlerts(updated.isTicketAlerts())
                .bookingAlerts(updated.isBookingAlerts())
                .compactMode(updated.isCompactMode())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Preferences updated successfully", response));
    }
}
