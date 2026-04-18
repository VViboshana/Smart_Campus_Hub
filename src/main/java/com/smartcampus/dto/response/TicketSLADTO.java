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
    private long hoursElapsed;
    private long slaLimitHours;
    private boolean breached;
    private String slaStatus;
    private double percentUsed;
}
