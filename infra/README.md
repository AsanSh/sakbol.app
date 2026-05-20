# Infrastructure

## Локально

```bash
cd infra
cp .env.example .env
docker compose up -d
```

Проверка:

- Postgres: `psql postgresql://sakbol:sakbol_dev@localhost:5433/sakbol`
- MinIO Console: http://localhost:9001 (`minioadmin` / `minioadmin`)
- Redis: `redis-cli -p 6380 ping` → `PONG`

## Production (VPS)

См. [`docs/DEPLOY.md`](../docs/DEPLOY.md).

Принципиальная схема:

```
nginx :443 (хост) → reverse proxy:
  sakbol.app          → static landing  (Astro)
  app.sakbol.app      → static SPA      (Flutter Web)
  api.sakbol.app      → backend:3001    (NestJS в Docker)
```

База, MinIO и Redis торчат только в internal docker network.
