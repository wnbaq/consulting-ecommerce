package com.consulting.service;

import com.consulting.dto.appointment.AppointmentRequest;
import com.consulting.dto.appointment.AppointmentResponse;
import com.consulting.dto.appointment.SlotRequest;
import com.consulting.dto.appointment.SlotResponse;
import com.consulting.entity.Appointment;
import com.consulting.entity.ConsultantSlot;
import com.consulting.entity.ConsultingService;
import com.consulting.entity.User;
import com.consulting.exception.BusinessException;
import com.consulting.exception.ResourceNotFoundException;
import com.consulting.repository.AppointmentRepository;
import com.consulting.repository.ConsultantSlotRepository;
import com.consulting.repository.ConsultingServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ConsultantSlotRepository slotRepository;
    private final ConsultingServiceRepository serviceRepository;

    public List<SlotResponse> getAvailableSlots(Long serviceId, LocalDate date) {
        return slotRepository.findByServiceIdAndDateAndIsBookedFalse(serviceId, date)
                .stream().map(this::toSlotResponse).toList();
    }

    @Transactional
    public SlotResponse createSlot(SlotRequest request) {
        ConsultingService service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        ConsultantSlot slot = ConsultantSlot.builder()
                .service(service)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();
        return toSlotResponse(slotRepository.save(slot));
    }

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request, User user) {
        ConsultingService service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));

        ConsultantSlot slot = slotRepository.findById(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (slot.getIsBooked()) {
            throw new BusinessException("This slot is already booked");
        }

        slot.setIsBooked(true);
        slotRepository.save(slot);

        Appointment appointment = Appointment.builder()
                .user(user)
                .service(service)
                .slot(slot)
                .notes(request.getNotes())
                .build();

        return toResponse(appointmentRepository.save(appointment));
    }

    public List<AppointmentResponse> getMyAppointments(User user) {
        return appointmentRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        appointment.setStatus(Appointment.Status.valueOf(status.toUpperCase()));
        return toResponse(appointmentRepository.save(appointment));
    }

    private AppointmentResponse toResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .userId(a.getUser().getId())
                .userName(a.getUser().getName())
                .serviceId(a.getService().getId())
                .serviceName(a.getService().getTitle())
                .date(a.getSlot().getDate())
                .startTime(a.getSlot().getStartTime())
                .endTime(a.getSlot().getEndTime())
                .status(a.getStatus().name())
                .notes(a.getNotes())
                .createdAt(a.getCreatedAt())
                .build();
    }

    private SlotResponse toSlotResponse(ConsultantSlot s) {
        return SlotResponse.builder()
                .id(s.getId())
                .serviceId(s.getService().getId())
                .date(s.getDate())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .isBooked(s.getIsBooked())
                .build();
    }
}
