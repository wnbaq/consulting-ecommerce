package com.consulting.service;

import com.consulting.entity.ConsultantSlot;
import com.consulting.entity.ConsultingService;
import com.consulting.entity.ServiceCategory;
import com.consulting.repository.ConsultantSlotRepository;
import com.consulting.repository.ConsultingServiceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import org.mockito.ArgumentMatchers;

@ExtendWith(MockitoExtension.class)
class AiServiceTest {

    @Mock
    private ConsultingServiceRepository serviceRepository;

    @Mock
    private ConsultantSlotRepository slotRepository;

    @Mock
    private ChatClient chatClient;

    @InjectMocks
    private AiService aiService;

    @Test
    void chat_returnsReplyFromChatClient() {
        ServiceCategory category = ServiceCategory.builder().name("Kariyer").build();
        ConsultingService service = ConsultingService.builder()
                .title("Kariyer Danışmanlığı")
                .shortDescription("Kariyer desteği")
                .price(BigDecimal.valueOf(500))
                .durationMinutes(60)
                .category(category)
                .build();
        when(serviceRepository.findAllActiveWithCategory()).thenReturn(List.of(service));
        when(slotRepository.findByDateBetweenAndIsBookedFalse(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of());

        ChatClient.ChatClientRequestSpec requestSpec = mock(ChatClient.ChatClientRequestSpec.class);
        ChatClient.CallResponseSpec callSpec = mock(ChatClient.CallResponseSpec.class);
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.system(anyString())).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callSpec);
        when(callSpec.content()).thenReturn("Kariyer Danışmanlığı hizmetimiz mevcut.");

        String result = aiService.chat("Kariyer danışmanı var mı?");

        assertThat(result).isEqualTo("Kariyer Danışmanlığı hizmetimiz mevcut.");
        verify(chatClient).prompt();
        verify(requestSpec).system(anyString());
        verify(requestSpec).user("Kariyer danışmanı var mı?");
    }

    @Test
    void chat_includesServiceInfoInSystemPrompt() {
        ServiceCategory category = ServiceCategory.builder().name("Finans").build();
        ConsultingService service = ConsultingService.builder()
                .title("Finans Danışmanlığı")
                .shortDescription("Finansal planlama")
                .price(BigDecimal.valueOf(750))
                .durationMinutes(90)
                .category(category)
                .build();
        when(serviceRepository.findAllActiveWithCategory()).thenReturn(List.of(service));
        when(slotRepository.findByDateBetweenAndIsBookedFalse(any(), any())).thenReturn(List.of());

        ChatClient.ChatClientRequestSpec requestSpec = mock(ChatClient.ChatClientRequestSpec.class);
        ChatClient.CallResponseSpec callSpec = mock(ChatClient.CallResponseSpec.class);
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.system(anyString())).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callSpec);
        when(callSpec.content()).thenReturn("Yanıt");

        aiService.chat("Soru");

        verify(requestSpec).system(ArgumentMatchers.<String>argThat(prompt ->
                prompt.contains("Finans Danışmanlığı") &&
                prompt.contains("750") &&
                prompt.contains("90")
        ));
    }
}
