package com.smartcampus.service;

import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.request.UpdateProfileRequest;
import com.smartcampus.dto.request.ChangePasswordRequest;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtTokenProvider;
import com.smartcampus.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

        @Value("${app.auth.admin-email-regex:^(?i)admin[0-9]*@smartcampus\\.edu$}")
        private String adminEmailRegex;

        @Value("${app.auth.technician-email-regex:^(?i)(tech|technician)[0-9]*@smartcampus\\.edu$}")
        private String technicianEmailRegex;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Set<Role> roles = resolveRolesForEmail(request.getEmail());

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .provider("LOCAL")
                .roles(roles)
                .build();

        user = Objects.requireNonNull(userRepository.save(Objects.requireNonNull(user, "user must not be null")),
                "saved user must not be null");

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(user.getRoles())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(Objects.requireNonNull(userPrincipal.getId(), "user id must not be null"))
                .orElseThrow(() -> new BadRequestException("User not found"));

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(user.getRoles())
                .build();
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            throw new BadRequestException("User not authenticated");
        }
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
                return userRepository.findById(Objects.requireNonNull(userPrincipal.getId(), "user id must not be null"))
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

        public User updateCurrentUserProfile(UpdateProfileRequest request) {
                User currentUser = getCurrentUser();
                currentUser.setName(request.getName().trim());
                User saved = Objects.requireNonNull(
                                userRepository.save(Objects.requireNonNull(currentUser, "current user must not be null")),
                                "saved user must not be null"
                );
                saved.setPassword(null);
                return saved;
        }

        public void changeCurrentUserPassword(ChangePasswordRequest request) {
                User currentUser = getCurrentUser();

                if (!"LOCAL".equalsIgnoreCase(currentUser.getProvider())) {
                        throw new BadRequestException("Password change is only available for local accounts");
                }

                if (currentUser.getPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
                        throw new BadRequestException("Current password is incorrect");
                }

                if (request.getCurrentPassword().equals(request.getNewPassword())) {
                        throw new BadRequestException("New password must be different from current password");
                }

                currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(currentUser);
        }

        public void deleteCurrentUser() {
                User currentUser = getCurrentUser();
                userRepository.delete(Objects.requireNonNull(currentUser, "current user must not be null"));
        }

        private Set<Role> resolveRolesForEmail(String email) {
                Set<Role> roles = new HashSet<>();
                roles.add(Role.USER);

                if (email != null && email.matches(adminEmailRegex)) {
                        roles.add(Role.ADMIN);
                }

                if (email != null && email.matches(technicianEmailRegex)) {
                        roles.add(Role.TECHNICIAN);
                }

                return roles;
        }
}
