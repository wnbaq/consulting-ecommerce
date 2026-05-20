package com.consulting.service;

import com.consulting.entity.ConsultantSlot;
import com.consulting.entity.ConsultingService;
import com.consulting.repository.ConsultantSlotRepository;
import com.consulting.repository.ConsultingServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiService {

    private final ConsultingServiceRepository serviceRepository;
    private final ConsultantSlotRepository slotRepository;
    private final ChatClient chatClient;

    public String chat(String userMessage) {
        List<ConsultingService> services = serviceRepository.findAllActiveWithCategory();
        LocalDate today = LocalDate.now();
        List<ConsultantSlot> slots = slotRepository.findByDateBetweenAndIsBookedFalse(today, today.plusDays(30));

        String context = buildContext(services, slots);
        String systemPrompt = buildSystemPrompt(context);

        return chatClient.prompt()
                .system(systemPrompt)
                .user(userMessage)
                .call()
                .content();
    }

    private String buildContext(List<ConsultingService> services, List<ConsultantSlot> slots) {
        StringBuilder sb = new StringBuilder();

        sb.append("=== AVAILABLE SERVICES ===\n");
        for (ConsultingService s : services) {
            sb.append(String.format("- %s (Category: %s) | Price: %.0f₺ | Duration: %d min",
                    s.getTitle(),
                    s.getCategory().getName(),
                    s.getPrice(),
                    s.getDurationMinutes()));
            if (s.getShortDescription() != null) {
                sb.append(" | ").append(s.getShortDescription());
            }
            sb.append("\n");
        }

        sb.append("\n=== AVAILABLE APPOINTMENT SLOTS (Next 30 days) ===\n");
        if (slots.isEmpty()) {
            sb.append("No available appointment slots at this time.\n");
        } else {
            for (ConsultantSlot slot : slots) {
                sb.append(String.format("- %s at %s-%s (Service ID: %d)\n",
                        slot.getDate(),
                        slot.getStartTime(),
                        slot.getEndTime(),
                        slot.getService().getId()));
            }
        }
        return sb.toString();
    }

    private String buildSystemPrompt(String context) {
        return """
                You are a helpful AI assistant for the ConsultPro consulting platform.
                Based on the real-time service and appointment data below, answer the user's questions.
                Provide clear, concise, and helpful responses in English.
                Recommend suitable services, provide pricing and duration information.
                If no available slots exist for the requested dates, clearly state this.
                Only provide information based on what is in the database — do not make up information.

                """ + context;
    }
}
