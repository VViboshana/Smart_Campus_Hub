package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketSLADTO {
    private String ticketId;
    private String ticketStatus;
    private long hoursElapsed;
    private long minutesElapsed;
    private String elapsedDisplay;
    private long slaLimitHours;
    private boolean breached;
    private boolean finalState;
    private String slaStatus;
    private double percentUsed;
}
