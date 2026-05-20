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

        sb.append("=== MEVCUT HİZMETLER ===\n");
        for (ConsultingService s : services) {
            sb.append(String.format("- %s (Kategori: %s) | Fiyat: %.0f₺ | Süre: %d dk",
                    s.getTitle(),
                    s.getCategory().getName(),
                    s.getPrice(),
                    s.getDurationMinutes()));
            if (s.getShortDescription() != null) {
                sb.append(" | ").append(s.getShortDescription());
            }
            sb.append("\n");
        }

        sb.append("\n=== MÜSAİT RANDEVU SLOTLARI (Önümüzdeki 30 gün) ===\n");
        if (slots.isEmpty()) {
            sb.append("Şu anda müsait randevu slotu bulunmamaktadır.\n");
        } else {
            for (ConsultantSlot slot : slots) {
                sb.append(String.format("- %s saat %s-%s (Hizmet ID: %d)\n",
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
                Sen ConsultPro danışmanlık platformunun yardımcı AI asistanısın.
                Aşağıdaki güncel hizmet ve randevu bilgilerine dayanarak kullanıcının sorularını yanıtla.
                Yanıtlarını Türkçe, kısa ve yardımcı bir şekilde ver.
                Uygun hizmetleri öner, fiyat ve süre bilgisi ver.
                Eğer sorulan tarihte müsait slot yoksa bunu açıkça belirt.
                Veritabanında olmayan konularda bilgi verme.

                """ + context;
    }
}
