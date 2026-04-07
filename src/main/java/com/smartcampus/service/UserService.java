package com.smartcampus.service;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getUserById(String id) {
        return userRepository.findById(Objects.requireNonNull(id, "user id must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUserRoles(String userId, Set<Role> roles) {
        User user = getUserById(userId);
        user.setRoles(roles);
        return Objects.requireNonNull(userRepository.save(Objects.requireNonNull(user, "user must not be null")),
                "saved user must not be null");
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(role))
                .toList();
    }

    public void deleteUserById(String userId) {
        User user = getUserById(userId);
        userRepository.delete(Objects.requireNonNull(user, "user must not be null"));
    }
}
