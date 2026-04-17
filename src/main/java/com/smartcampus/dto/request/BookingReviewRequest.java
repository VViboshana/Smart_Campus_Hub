package com.smartcampus.dto.request;

import com.smartcampus.model.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingReviewRequest {
    @NotNull(message = "Status is required (APPROVED or REJECTED)")
    private BookingStatus status;

    private String remarks;
}
