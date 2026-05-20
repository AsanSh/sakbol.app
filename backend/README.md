# SakBol Backend (NestJS)

## Локальный запуск

```bash
cd ../infra && docker compose up -d        # postgres, minio, redis
cd ../backend
cp .env.example .env                       # отредактируйте при необходимости
npm install
npx prisma migrate dev --name init         # создать схему
npm run start:dev                          # http://localhost:3001/health
```

Проверка:

```bash
curl http://localhost:3001/health
# {"ok":true,"service":"sakbol-backend","db":"ok","ts":"..."}
```

Swagger UI: http://localhost:3001/docs  
OpenAPI JSON: http://localhost:3001/docs-json (это вход для генерации Flutter-клиента).

## Тесты

```bash
npm test          # unit
npm run test:e2e  # e2e (поднимает testcontainers)
```

## Структура

```
src/
├── modules/         (auth, profile, family, analyses, documents, …)
├── common/          (guards, decorators, interceptors, filters, pipes)
├── infra/
│   ├── prisma/      (Prisma + global module)
│   ├── config/      (env validation)
│   ├── providers/   (sms, email, ai, storage — абстракции с заглушками)
│   └── queue/       (BullMQ jobs)
├── app.module.ts
└── main.ts
```

## Roadmap

См. [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md). Сейчас — Фаза 0: только `/health`.
