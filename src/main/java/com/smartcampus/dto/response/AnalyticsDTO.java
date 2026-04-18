package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {
    private int totalResources;
    private int activeResources;
    private int totalBookings;
    private int pendingBookings;
    private int approvedBookings;
    private int totalTickets;
    private int openTickets;
    private int resolvedTickets;
    private int totalUsers;
    private Map<String, Long> bookingsByResourceType;
    private Map<String, Long> ticketsByPriority;
    private Map<String, Long> bookingsByStatus;
    private List<String> topBookedResources;
}
