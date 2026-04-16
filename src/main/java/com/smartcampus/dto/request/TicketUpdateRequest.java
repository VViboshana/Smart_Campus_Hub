package com.smartcampus.dto.request;

import com.smartcampus.model.TicketStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketUpdateRequest {
    @NotNull(message = "Status is required")
    private TicketStatus status;

    private String resolutionNotes;

    private String rejectionReason;

    private String assignedTechnicianId;
}
