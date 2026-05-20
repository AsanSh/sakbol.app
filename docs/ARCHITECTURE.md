# Архитектура SakBol v2

## Цели

- **Один API** для веба и Android (один контракт через OpenAPI).
- **Stateless backend** — горизонтально масштабируемый.
- **Без Telegram** — авторизация только email + телефон (SMS-OTP).
- **Файлы вне сервера приложения** — MinIO/S3 с presigned URL.
- **Очереди** — длительные операции (OCR, рассылки, push) идут через BullMQ + Redis.

## Топология

```
                       Internet
                          │
                  ┌───────▼────────┐
                  │  nginx + ACME  │
                  └─┬───┬────┬─────┘
                    │   │    │
   sakbol.app  ─────┘   │    │     →  landing (Astro static)
   app.sakbol.app ──────┘    │     →  Flutter Web (static SPA)
   api.sakbol.app ───────────┘     →  NestJS (Docker)

        ┌─────────────┬─────────────┐
        │ внутренняя docker network │
        ▼             ▼             ▼
   ┌────────┐  ┌──────────┐  ┌──────┐
   │Postgres│  │  MinIO   │  │ Redis│
   │   16   │  │ (S3 API) │  │  7   │
   └────────┘  └──────────┘  └──────┘
```

## Авторизация

- Email + пароль (Argon2id).
- Phone + OTP (Nikita SMS).
- JWT access (15 мин) + refresh token (30 дней, в БД, отзываемый).
- `Authorization: Bearer <accessToken>` — **единый механизм** для Flutter и веба.

## Файловое хранилище

- Бакеты: `sakbol-private`, `sakbol-public`.
- Клиент запрашивает presigned URL → грузит/скачивает напрямую в MinIO.
- В Postgres — только метаданные (`StorageObject`).

## Очереди

| Очередь | Что |
|---------|-----|
| `sms` | Nikita SMS отправка |
| `email` | Resend отправка |
| `ocr` | Gemini Vision: распознать PDF / фото |
| `ai` | Gemini text: разбор анализов, ответы в чате |
| `push` | FCM нотификации |
| `cron` | Истечение OTP, истечение medicine-requests, daily metrics |

## OpenAPI как контракт

Backend → автогенерация `docs-json` через `@nestjs/swagger`.  
Flutter → `openapi-generator-cli` забирает спеку и собирает dart-dio клиент.  
**Любое breaking change в API ломает сборку Flutter — узнаём сразу.**

## Безопасность

- Argon2id для паролей.
- JWT короткий + refresh с ротацией.
- Throttler (Redis-backed): 5 запросов/мин на login, 1/мин на OTP.
- Helmet middleware.
- CORS strict.
- Audit log на доступ к чужим профилям (через `ProfileAccess`).
- HTTPS only, HSTS, HTTP/2.
- Sentry с PII scrubbing.

## Фазы реализации

| Фаза | Срок | Содержание |
|------|------|-----------|
| **0** | 2–3 дня | Скелет инфры и проектов, `/health` работает |
| **1** | 10–14 дней | NestJS MVP: auth, profile, family, analyses, documents, storage, OCR |
| **2** | 10–14 дней | Flutter MVP: login, home, просмотр анализов и документов, FCM |
| **3** | 10–14 дней | Flutter: загрузка/OCR/динамика, ИИ-чат |
| **4** | 14–21 день | Шаринг, аптека, врачи, deep links |
| **5** | 7–10 дней | Landing, миграция данных, публикация в Google Play |
| **6** | потом | iOS |
