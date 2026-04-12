package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String title;

    private String description;

    private TicketCategory category;

    private TicketPriority priority;

    @Builder.Default
    private TicketStatus status = TicketStatus.OPEN;

    private String resourceId;

    private String resourceName;

    private String location;

    // Reporter details
    private String reporterId;

    private String reporterName;

    private String contactEmail;

    private String contactPhone;

    // Assignment
    private String assignedTechnicianId;

    private String assignedTechnicianName;

    // Resolution
    private String resolutionNotes;

    private LocalDateTime resolvedAt;

    private LocalDateTime closedAt;

    private String rejectionReason;

    // Attachments (up to 3 images)
    @Builder.Default
    private List<String> attachmentUrls = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
