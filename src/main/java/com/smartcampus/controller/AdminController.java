package com.smartcampus.controller;

import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    // GET - Get all users
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    // GET - Get users by role
    @GetMapping("/users/role/{role}")
    public ResponseEntity<ApiResponse<List<User>>> getUsersByRole(@PathVariable Role role) {
        List<User> users = userService.getUsersByRole(role);
        users.forEach(u -> u.setPassword(null));
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    // PUT - Update user roles
    @PutMapping("/users/{userId}/roles")
    public ResponseEntity<ApiResponse<User>> updateUserRoles(
            @PathVariable String userId,
            @RequestBody Set<Role> roles) {
        User user = userService.updateUserRoles(userId, roles);
        user.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success("User roles updated successfully", user));
    }

    // DELETE - Remove user account
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String userId) {
        userService.deleteUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}
