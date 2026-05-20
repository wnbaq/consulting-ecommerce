# Ask AI Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Navbar'a "Ask AI" butonu ve merkez modal chat arayüzü ekle; Spring AI + Anthropic Claude ile veritabanı verilerine dayalı dinamik yanıtlar üret.

**Architecture:** Backend'e Spring AI Anthropic starter eklenir. `AiService`, aktif hizmetleri ve önümüzdeki 30 günün müsait slotlarını DB'den çekip sistem promptuna ekler, ardından `ChatClient` ile Claude'a gönderir. Frontend'de `AskAIModal` bileşeni `/api/ai/chat` endpoint'ini çağırır.

**Tech Stack:** Spring Boot 3.2.3, Spring AI 1.0.0, Anthropic Claude (claude-sonnet-4-6), React 18, Tailwind CSS

---

## File Map

| Eylem | Dosya | Sorumluluk |
|-------|-------|-----------|
| Modify | `backend/pom.xml` | Spring AI BOM + Anthropic starter |
| Modify | `backend/src/main/resources/application.yml` | Anthropic API key + model config |
| Modify | `backend/src/main/java/com/consulting/repository/ConsultingServiceRepository.java` | `findAllActiveWithCategory()` sorgusu |
| Modify | `backend/src/main/java/com/consulting/repository/ConsultantSlotRepository.java` | `findByDateBetweenAndIsBookedFalse()` sorgusu |
| Create | `backend/src/main/java/com/consulting/dto/ai/AiChatRequest.java` | Request DTO |
| Create | `backend/src/main/java/com/consulting/dto/ai/AiChatResponse.java` | Response DTO |
| Create | `backend/src/main/java/com/consulting/service/AiService.java` | DB sorgulama + context + ChatClient |
| Create | `backend/src/main/java/com/consulting/controller/AiController.java` | POST /api/ai/chat |
| Create | `backend/src/test/java/com/consulting/service/AiServiceTest.java` | AiService unit test |
| Create | `frontend/src/components/ui/AskAIModal.jsx` | Chat modal bileşeni |
| Modify | `frontend/src/api/services.js` | `aiApi.chat()` eklenir |
| Modify | `frontend/src/components/layout/Navbar.jsx` | Ask AI butonu + modal state |

---

## Task 1: Spring AI Bağımlılığı ve Konfigürasyon

**Files:**
- Modify: `backend/pom.xml`
- Modify: `backend/src/main/resources/application.yml`

- [ ] **Step 1: `pom.xml`'e Spring AI BOM ekle**

`<dependencyManagement>` bloğu `pom.xml`'de yok, oluştur. `<dependencies>` bloğundan önce ekle:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>1.0.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

- [ ] **Step 2: `pom.xml`'e Anthropic starter ekle**

`<dependencies>` bloğu içine Stripe bağımlılığının altına ekle:

```xml
<!-- Spring AI Anthropic -->
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-anthropic-spring-boot-starter</artifactId>
</dependency>
```

- [ ] **Step 3: `application.yml`'e AI konfigürasyonu ekle**

Dosyanın sonuna ekle:

```yaml
  ai:
    anthropic:
      api-key: ${ANTHROPIC_API_KEY}
      chat:
        options:
          model: claude-sonnet-4-6
          max-tokens: 1024
```

Dikkat: `spring:` bloğunun altına, mevcut `datasource:` ile aynı indentation seviyesinde olmalı.

- [ ] **Step 4: Build alarak bağımlılıkların indirildiğini doğrula**

```bash
cd backend && mvn dependency:resolve -q
```

Beklenen: BUILD SUCCESS (hata yok)

- [ ] **Step 5: Commit**

```bash
git add backend/pom.xml backend/src/main/resources/application.yml
git commit -m "feat: add Spring AI Anthropic dependency and config"
```

---

## Task 2: Repository Metotları

**Files:**
- Modify: `backend/src/main/java/com/consulting/repository/ConsultingServiceRepository.java`
- Modify: `backend/src/main/java/com/consulting/repository/ConsultantSlotRepository.java`

- [ ] **Step 1: `ConsultingServiceRepository`'e JOIN FETCH sorgusu ekle**

Dosyayı aç, mevcut metotların altına ekle:

```java
@Query("SELECT s FROM ConsultingService s JOIN FETCH s.category WHERE s.isActive = true")
List<ConsultingService> findAllActiveWithCategory();
```

Import'u da ekle (eğer yoksa):
```java
import org.springframework.data.jpa.repository.Query;
import java.util.List;
```

- [ ] **Step 2: `ConsultantSlotRepository`'e tarih aralığı sorgusu ekle**

Dosyayı aç, mevcut metotların altına ekle:

```java
List<ConsultantSlot> findByDateBetweenAndIsBookedFalse(LocalDate start, LocalDate end);
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/consulting/repository/
git commit -m "feat: add repository methods for AI context queries"
```

---

## Task 3: DTO'lar

**Files:**
- Create: `backend/src/main/java/com/consulting/dto/ai/AiChatRequest.java`
- Create: `backend/src/main/java/com/consulting/dto/ai/AiChatResponse.java`

- [ ] **Step 1: `AiChatRequest.java` oluştur**

```java
package com.consulting.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AiChatRequest {
    @NotBlank
    private String message;
}
```

- [ ] **Step 2: `AiChatResponse.java` oluştur**

```java
package com.consulting.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AiChatResponse {
    private String reply;
}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/main/java/com/consulting/dto/ai/
git commit -m "feat: add AI chat DTO classes"
```

---

## Task 4: AiService + Test

**Files:**
- Create: `backend/src/main/java/com/consulting/service/AiService.java`
- Create: `backend/src/test/java/com/consulting/service/AiServiceTest.java`

- [ ] **Step 1: Failing test yaz**

`backend/src/test/java/com/consulting/service/AiServiceTest.java` oluştur:

```java
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

        verify(requestSpec).system(argThat(prompt ->
                prompt.contains("Finans Danışmanlığı") &&
                prompt.contains("750") &&
                prompt.contains("90")
        ));
    }
}
```

- [ ] **Step 2: Test'i çalıştır, fail ettiğini doğrula**

```bash
cd backend && mvn test -pl . -Dtest=AiServiceTest -q 2>&1 | tail -5
```

Beklenen: FAILURE — `AiService` sınıfı yok

- [ ] **Step 3: `AiService.java` oluştur**

```java
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
```

- [ ] **Step 4: Test'i çalıştır, geçtiğini doğrula**

```bash
cd backend && mvn test -pl . -Dtest=AiServiceTest -q 2>&1 | tail -5
```

Beklenen: BUILD SUCCESS, Tests run: 2, Failures: 0

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/consulting/service/AiService.java \
        backend/src/test/java/com/consulting/service/AiServiceTest.java
git commit -m "feat: add AiService with dynamic DB context and ChatClient integration"
```

---

## Task 5: AiController + Test

**Files:**
- Create: `backend/src/main/java/com/consulting/controller/AiController.java`
- Create: `backend/src/test/java/com/consulting/controller/AiControllerTest.java`

- [ ] **Step 1: Failing test yaz**

`backend/src/test/java/com/consulting/controller/AiControllerTest.java` oluştur:

```java
package com.consulting.controller;

import com.consulting.security.JwtAuthFilter;
import com.consulting.service.AiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AiController.class)
class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AiService aiService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter;

    @MockBean
    private AuthenticationProvider authenticationProvider;

    @Test
    void chat_returnsReply() throws Exception {
        when(aiService.chat("Kariyer danışmanı var mı?"))
                .thenReturn("Evet, Kariyer Danışmanlığı hizmetimiz mevcuttur.");

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("message", "Kariyer danışmanı var mı?"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value("Evet, Kariyer Danışmanlığı hizmetimiz mevcuttur."));
    }

    @Test
    void chat_returns400_whenMessageBlank() throws Exception {
        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("message", ""))))
                .andExpect(status().isBadRequest());
    }
}
```

- [ ] **Step 2: Test'i çalıştır, fail ettiğini doğrula**

```bash
cd backend && mvn test -pl . -Dtest=AiControllerTest -q 2>&1 | tail -5
```

Beklenen: FAILURE — `AiController` sınıfı yok

- [ ] **Step 3: `AiController.java` oluştur**

```java
package com.consulting.controller;

import com.consulting.dto.ai.AiChatRequest;
import com.consulting.dto.ai.AiChatResponse;
import com.consulting.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        String reply = aiService.chat(request.getMessage());
        return ResponseEntity.ok(new AiChatResponse(reply));
    }
}
```

- [ ] **Step 4: Test'i çalıştır, geçtiğini doğrula**

```bash
cd backend && mvn test -pl . -Dtest=AiControllerTest -q 2>&1 | tail -5
```

Beklenen: BUILD SUCCESS, Tests run: 2, Failures: 0

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/consulting/controller/AiController.java \
        backend/src/test/java/com/consulting/controller/AiControllerTest.java
git commit -m "feat: add AiController with POST /api/ai/chat endpoint"
```

---

## Task 6: Frontend — aiApi ve AskAIModal

**Files:**
- Modify: `frontend/src/api/services.js`
- Create: `frontend/src/components/ui/AskAIModal.jsx`

- [ ] **Step 1: `services.js`'e `aiApi` ekle**

`frontend/src/api/services.js` dosyasının sonuna ekle:

```js
// AI Chat
export const aiApi = {
  chat: (message) => api.post('/ai/chat', { message }),
}
```

- [ ] **Step 2: `AskAIModal.jsx` oluştur**

```jsx
import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, Loader2 } from 'lucide-react'
import { aiApi } from '../../api/services'

export default function AskAIModal({ open, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Merhaba! Size danışmanlık hizmetlerimiz hakkında yardımcı olabilirim. Ne öğrenmek istersiniz?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await aiApi.chat(text)
      setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Bir hata oluştu, lütfen tekrar deneyin.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col" style={{ height: '520px' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-blue-600 rounded-t-2xl">
          <div className="flex items-center gap-2 text-white">
            <Bot size={20} />
            <span className="font-semibold">AI Asistan</span>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Mesajlar */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm">
                <Loader2 size={16} className="animate-spin text-gray-400" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Sorunuzu yazın..."
            className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/services.js frontend/src/components/ui/AskAIModal.jsx
git commit -m "feat: add AskAIModal component and aiApi"
```

---

## Task 7: Navbar Entegrasyonu

**Files:**
- Modify: `frontend/src/components/layout/Navbar.jsx`

- [ ] **Step 1: Navbar'ı güncelle**

`frontend/src/components/layout/Navbar.jsx` dosyasını aşağıdaki değişikliklerle güncelle:

**Import satırlarına ekle** (mevcut import listesinin yanına):
```js
import { useState } from 'react'  // zaten var
import { Sparkles } from 'lucide-react'  // ekle
import AskAIModal from '../ui/AskAIModal'  // ekle
```

Mevcut `lucide-react` import satırını şu şekilde güncelle:
```js
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Sparkles } from 'lucide-react'
```

**`useState` bloğuna `aiOpen` ekle** (mevcut `menuOpen` state'inin yanına):
```js
const [aiOpen, setAiOpen] = useState(false)
```

**Masaüstü nav sağ tarafına** (`</> ` kapanmadan hemen önce, Giriş/Üye Ol bloğundan önce) Ask AI butonunu ekle:

```jsx
{/* Ask AI — her zaman görünür */}
<button
  onClick={() => setAiOpen(true)}
  className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
>
  <Sparkles size={15} />
  Ask AI
</button>
```

**Mobil menüye** (Giriş linkinden önce) ekle:
```jsx
<button
  onClick={() => { setAiOpen(true); setMenuOpen(false) }}
  className="block text-blue-600 font-medium text-left"
>
  ✨ Ask AI
</button>
```

**`</nav>` kapanmadan hemen önce** modal'ı render et:
```jsx
<AskAIModal open={aiOpen} onClose={() => setAiOpen(false)} />
```

- [ ] **Step 2: Frontend'i başlat ve manuel test et**

```bash
cd frontend && npm run dev
```

Tarayıcıda `http://localhost:5173` aç:
- Navbar'da "Ask AI" butonu görünüyor mu?
- Butona tıklayınca modal açılıyor mu?
- Overlay'e tıklayınca modal kapanıyor mu?
- Mobil görünümde (`Ctrl+Shift+M`) buton menüde çıkıyor mu?

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/Navbar.jsx
git commit -m "feat: add Ask AI button to navbar with modal integration"
```

---

## Task 8: Ortam Değişkeni ve Uçtan Uca Test

**Files:**
- Create (opsiyonel): `backend/.env.example`

- [ ] **Step 1: Backend'i ANTHROPIC_API_KEY ile başlat**

PowerShell'de:
```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-..." # kendi key'ini yaz
cd backend
mvn spring-boot:run
```

Bash/Git Bash'te:
```bash
ANTHROPIC_API_KEY=sk-ant-... mvn spring-boot:run
```

- [ ] **Step 2: Endpoint'i curl ile test et**

```bash
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Kariyer danışmanlığı hizmeti var mı?"}'
```

Beklenen: `{"reply":"..."}` formatında JSON yanıt

- [ ] **Step 3: Tarayıcıda uçtan uca test et**

Frontend açıkken (`http://localhost:5173`):
1. "Ask AI" butonuna tıkla
2. "Bu hafta müsait kariyer danışmanı var mı?" yaz
3. Enter veya Gönder butonuna bas
4. Loading spinner göründükten sonra AI yanıtı geliyor mu kontrol et

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete Ask AI feature with Spring AI + Anthropic integration"
```
