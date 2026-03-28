package com.smartcampus.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePreferencesRequest {
    private Boolean emailAlerts;
    private Boolean ticketAlerts;
    private Boolean bookingAlerts;
    private Boolean compactMode;
}
