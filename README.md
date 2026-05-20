# ConsultPro — Consulting Services Platform

A full-stack e-commerce platform for consulting services with appointment booking, package management, AI chat assistant, and an admin panel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.2.3, Spring Security, Spring AI 1.0.0 |
| Database | PostgreSQL (via Spring Data JPA / Hibernate) |
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Auth | JWT (access + refresh tokens) |
| Payment | İyzico |
| AI | OpenAI GPT (via Spring AI) |

## Features

- **Service catalog** — browse and search consulting services by category
- **Appointment booking** — pick available slots and book directly
- **Package system** — multi-session packages with validity periods
- **Shopping cart & checkout** — cart management with İyzico payment integration
- **AI assistant** — chat with an AI that has live access to services and availability
- **User accounts** — order history, appointments, profile management
- **Admin panel** — manage services, categories, appointments, orders, users, and reviews

## Project Structure

```
consulting-ecommerce/
├── backend/          # Spring Boot REST API
│   └── src/main/java/com/consulting/
│       ├── config/       # Security, AI, CORS, JWT config
│       ├── controller/   # REST controllers
│       ├── dto/          # Request/response DTOs
│       ├── entity/       # JPA entities
│       ├── repository/   # Spring Data repositories
│       └── service/      # Business logic
└── frontend/         # React + Vite SPA
    └── src/
        ├── api/          # Axios API service layer
        ├── components/   # Reusable UI components
        ├── context/      # Auth context
        └── pages/        # Route pages (admin/, account, etc.)
```

## Getting Started

### Prerequisites

- Java 21+
- Node.js 18+
- PostgreSQL 15+

### Backend

1. Create a PostgreSQL database named `consulting_db`
2. Copy `backend/src/main/resources/application.yml` and set your environment variables:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/consulting_db
    username: YOUR_DB_USER
    password: YOUR_DB_PASSWORD
  ai:
    openai:
      api-key: YOUR_OPENAI_API_KEY

jwt:
  secret: YOUR_JWT_SECRET

iyzico:
  api-key: YOUR_IYZICO_API_KEY
  secret-key: YOUR_IYZICO_SECRET_KEY
  base-url: https://sandbox-api.iyzipay.com
```

3. Run the backend:

```bash
cd backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts on `http://localhost:5173`.

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/services` | List services (paginated) |
| GET | `/api/services/{id}` | Service detail |
| GET | `/api/categories` | List categories |
| POST | `/api/appointments` | Book appointment |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/items` | Add item to cart |
| POST | `/api/orders` | Place order (initiates payment) |
| POST | `/api/ai/chat` | AI assistant chat |
| GET | `/api/admin/**` | Admin endpoints (ADMIN role) |

## License

MIT
