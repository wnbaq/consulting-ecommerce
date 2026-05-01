package com.consulting.dto.appointment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class SlotRequest {
    @NotNull private Long serviceId;
    @NotNull private LocalDate date;
    @NotNull private LocalTime startTime;
    @NotNull private LocalTime endTime;
}
