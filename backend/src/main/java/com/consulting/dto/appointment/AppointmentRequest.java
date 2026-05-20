package com.consulting.dto.appointment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentRequest {
    @NotNull(message = "Service is required")
    private Long serviceId;

    @NotNull(message = "Slot is required")
    private Long slotId;

    private String notes;
}
