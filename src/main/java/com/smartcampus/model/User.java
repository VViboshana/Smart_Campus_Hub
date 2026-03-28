package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String email;

    private String password;

    private String profilePicture;

    private String provider; // LOCAL, GOOGLE

    private String providerId;

    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    // Notification preferences
    @Builder.Default
    private boolean emailAlerts = true;

    @Builder.Default
    private boolean ticketAlerts = true;

    @Builder.Default
    private boolean bookingAlerts = true;

    @Builder.Default
    private boolean compactMode = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
