package com.smartcampus.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferencesResponse {
    private String userId;
    private boolean emailAlerts;
    private boolean ticketAlerts;
    private boolean bookingAlerts;
    private boolean compactMode;
}
