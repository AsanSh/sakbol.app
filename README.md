# SakBol — health companion for Kyrgyzstan

Полная перезапись. Три независимых проекта в одном репозитории (полирепо):

| Каталог | Что | Технологии |
|---------|-----|-----------|
| [`backend/`](./backend) | REST API + бизнес-логика | NestJS 10, Prisma, PostgreSQL, Redis, MinIO |
| [`app/`](./app) | Клиентское приложение (Android + Web) | Flutter 3.24, Riverpod, Dio |
| [`landing/`](./landing) | Маркетинговый сайт + privacy/terms | Astro 4 |
| [`infra/`](./infra) | Docker-compose, nginx, скрипты | Docker, nginx, Let's Encrypt |
| [`docs/`](./docs) | Архитектура, гайды | Markdown |

## Быстрый старт (локально)

```bash
# 1. Поднять инфру (postgres, minio, redis)
cd infra && docker compose up -d

# 2. Backend
cd ../backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev          # http://localhost:3001/health

# 3. Landing
cd ../landing
npm install
npm run dev                # http://localhost:4321

# 4. Flutter app
cd ../app
flutter pub get
flutter run -d chrome      # Web
flutter run -d android     # Android (нужен подключённый девайс)
```

## Поддомены (production)

| URL | Что |
|-----|-----|
| `sakbol.app` *(или `adventory.store` пока)* | Лендинг (Astro) |
| `app.sakbol.app` | Flutter Web (SPA) |
| `api.sakbol.app` | NestJS API |

## Текущая фаза

**Фаза 0:** скелет инфры и проектов. Подробнее в [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Документация

- [Архитектура](./docs/ARCHITECTURE.md)
- [Деплой](./docs/DEPLOY.md)
- [Setup: Resend (email)](./docs/SETUP_RESEND.md)
- [Setup: Firebase (push)](./docs/SETUP_FIREBASE.md)
- [Setup: Gemini (AI)](./docs/SETUP_GEMINI.md)
- [Setup: Nikita SMS](./docs/SETUP_NIKITA_SMS.md)
