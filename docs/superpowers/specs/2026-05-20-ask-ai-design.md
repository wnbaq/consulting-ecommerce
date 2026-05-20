# Ask AI Feature — Design Spec
Date: 2026-05-20

## Overview

ConsultPro platformuna "Ask AI" özelliği eklenir. Kullanıcılar navbar'daki butona tıklayarak merkez modal chat arayüzünü açar ve doğal dilde soru sorabilir (örn. "Bu hafta sonu müsait kariyer danışmanı var mı?"). AI, veritabanındaki güncel hizmet ve müsaitlik bilgilerine dayanarak Türkçe yanıt verir.

## Architecture

```
Frontend (React)
  └── Navbar → "✨ Ask AI" butonu
  └── AskAIModal (merkez popup)
        └── POST /api/ai/chat  { message: string }
              │
              ▼
Backend (Spring Boot)
  └── AiController  →  AiService
                          ├── ConsultingServiceRepository (aktif hizmetler)
                          ├── ServiceCategoryRepository (kategoriler)
                          ├── ConsultantSlotRepository (önümüzdeki 30 gün müsait slotlar)
                          ├── Context string oluştur
                          └── Spring AI ChatClient → Anthropic Claude API
                                  └── string yanıt döner
```

## Backend

### Bağımlılıklar

`pom.xml`'e Spring AI BOM ve Anthropic starter eklenir:

```xml
<dependency>
  <groupId>org.springframework.ai</groupId>
  <artifactId>spring-ai-anthropic-spring-boot-starter</artifactId>
</dependency>
```

Spring AI BOM `dependencyManagement` altına eklenir (versiyon: 1.0.0).

### Konfigürasyon

`application.properties`:
```properties
spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}
spring.ai.anthropic.chat.options.model=claude-sonnet-4-6
spring.ai.anthropic.chat.options.max-tokens=1024
```

### AiController

- Endpoint: `POST /api/ai/chat`
- Auth: gerekmez (`permitAll`)
- Request body: `{ "message": "string" }`
- Response body: `{ "reply": "string" }`

### AiService

1. DB'den çeker:
   - Tüm aktif `ConsultingService` kayıtları (id, title, shortDescription, price, durationMinutes, category)
   - `ConsultantSlot` kayıtları — bugünden itibaren 30 gün içinde, `isBooked = false`
2. Bu verileri okunabilir bir metin bloğuna dönüştürür
3. Sistem promptu oluşturur:
   > "Sen ConsultPro danışmanlık platformunun AI asistanısın. Aşağıdaki güncel hizmetler ve müsait randevu tarihleri mevcuttur:\n[context]\nKullanıcının sorusuna yalnızca bu bilgilere dayanarak Türkçe, kısa ve yardımcı bir şekilde cevap ver. Fiyat, süre ve kategori bilgisi ver. Eğer sorulan tarihte müsait slot yoksa bunu belirt."
4. `ChatClient.prompt().system(systemPrompt).user(userMessage).call().content()` ile yanıt alır
5. Yanıtı string olarak döner

### Security

`SecurityConfig`'te `/api/ai/chat` endpoint'i `permitAll()` listesine eklenir.

## Frontend

### Yeni Dosyalar

**`frontend/src/components/ui/AskAIModal.jsx`**
- State: `messages[]`, `input`, `loading`
- Her mesaj: `{ role: 'user' | 'ai', text: string }`
- "Gönder" butonuna tıklayınca `aiApi.chat(input)` çağrılır
- Loading sırasında spinner gösterilir
- Hata durumunda "Bir hata oluştu, tekrar deneyin." gösterilir
- Modal kapanınca mesaj geçmişi sıfırlanmaz (aynı oturumda devam eder)

### Değişen Dosyalar

**`frontend/src/api/services.js`**
```js
export const aiApi = {
  chat: (message) => api.post('/ai/chat', { message }),
}
```

**`frontend/src/components/layout/Navbar.jsx`**
- `AskAIModal` import edilir
- `aiOpen` state'i eklenir
- Masaüstü nav sağ tarafına `✨ Ask AI` butonu eklenir (mavi, rounded)
- Mobil menüye de "Ask AI" linki eklenir
- `<AskAIModal open={aiOpen} onClose={() => setAiOpen(false)} />`

## Data Flow — Örnek

```
Kullanıcı: "Bu hafta kariyer danışmanı var mı?"
  →  POST /api/ai/chat { message: "Bu hafta kariyer danışmanı var mı?" }
  →  AiService:
       - DB: Kariyer Danışmanlığı kategorisindeki hizmetler + bu haftaki boş slotlar
       - Context: "Hizmet: Kariyer Danışmanlığı, 500₺, 60dk. Müsait: 21 Mayıs 10:00, 22 Mayıs 14:00..."
       - Claude'a gönderir
  →  Claude: "Bu hafta Kariyer Danışmanlığı hizmetimizde müsait randevularımız var: 21 Mayıs Perşembe saat 10:00 ve 22 Mayıs Cuma saat 14:00. Fiyatı 500₺, süresi 60 dakikadır. Randevu almak ister misiniz?"
  →  Frontend: Modal'da yanıt gösterilir
```

## Out of Scope

- Konuşma geçmişini veritabanında saklamak
- Kullanıcı bazlı konuşma geçmişi
- AI üzerinden doğrudan randevu oluşturma
- Admin panelinde AI analytics
