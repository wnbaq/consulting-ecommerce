package com.consulting.dto.appointment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AppointmentRequest {
    @NotNull(message = "Hizmet zorunludur")
    private Long serviceId;

    @NotNull(message = "Slot zorunludur")
    private Long slotId;

    private String notes;
}
