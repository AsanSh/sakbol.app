# Быстрый старт (после клонирования)

Что вы сейчас можете запустить локально (Phase 0):

## Шаг 1 — Запустить Docker Desktop

На Mac: открыть приложение **Docker Desktop**, дождаться зелёного индикатора в menu bar.

## Шаг 2 — Поднять postgres + minio + redis

```bash
cd /Users/asans/Desktop/sakbol/infra
docker compose up -d
docker compose ps     # все сервисы должны быть Up (healthy)
```

Проверка:
- MinIO Console: http://localhost:9001 → войдите `minioadmin` / `minioadmin`. Должны появиться бакеты `sakbol-private` и `sakbol-public`.
- Postgres: `psql postgresql://sakbol:sakbol_dev@localhost:5433/sakbol -c '\l'` (если установлен psql).

## Шаг 3 — Поднять backend

```bash
cd /Users/asans/Desktop/sakbol/backend
cp .env.example .env
# Откройте .env и подставьте JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, PIN_ANCHOR_PEPPER
# (на dev — любые строки от 32 символов; на prod — openssl rand -base64 48)
npx prisma migrate dev --name init       # создать схему
npm run start:dev                        # http://localhost:3001
```

В отдельной вкладке:
```bash
curl http://localhost:3001/health
# {"ok":true,"service":"sakbol-backend","db":"ok","ts":"..."}
```

Swagger UI: http://localhost:3001/docs

## Шаг 4 — Поднять лендинг

```bash
cd /Users/asans/Desktop/sakbol/landing
npm install
npm run dev          # http://localhost:4321
```

## Шаг 5 — Поднять Flutter app

```bash
cd /Users/asans/Desktop/sakbol/app

# Один раз — сгенерировать платформенные папки
flutter create . --platforms=android,web,ios --org=app.sakbol --project-name=sakbol_app

flutter pub get
flutter run -d chrome
```

(Android: подключите устройство → `flutter run -d <id>`.)

## Что должно работать сейчас

- ✅ `infra` поднимает postgres, minio, redis
- ✅ `backend` отдаёт `/health` + Swagger UI
- ✅ `landing` показывает главную, /privacy, /terms, /support
- ✅ `app` собирается под Web и Android, показывает заглушку "SakBol — Phase 0 scaffold"

## Что не работает (пока)

Это Phase 0 — только скелет. В **Phase 1** появятся:
- регистрация/логин
- профили и семья
- загрузка анализов
- OCR

Подробный roadmap: [`ARCHITECTURE.md`](./ARCHITECTURE.md).
