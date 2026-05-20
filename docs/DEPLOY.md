# Deploy на VPS

## Параллельный запуск со старым проектом

Пока старый `sakbol_app_no2` живёт на `adventory.store`, новый ставим на поддомены:

| Старый | Новый (Фаза 0–5) | После cutover (Фаза 5) |
|--------|------------------|------------------------|
| `adventory.store` | `sakbol-v2.adventory.store` (landing) | `sakbol.app` (или новый домен) |
| (нет) | `app-v2.adventory.store` (Flutter Web) | `app.sakbol.app` |
| (нет) | `api-v2.adventory.store` (NestJS API) | `api.sakbol.app` |

## Шаги (одноразово)

### 1. DNS

В личном кабинете регистратора `adventory.store`: добавить A-записи на IP VPS:
- `sakbol-v2.adventory.store`
- `app-v2.adventory.store`
- `api-v2.adventory.store`

### 2. SSH на VPS, клон репозитория

```bash
ssh deploy@<VPS_IP>
sudo mkdir -p /opt/sakbol-v2 && sudo chown deploy:deploy /opt/sakbol-v2
cd /opt/sakbol-v2
git clone https://github.com/<your-org>/sakbol.git .
```

### 3. Поднять инфру

```bash
cd /opt/sakbol-v2/infra
cp .env.example .env
# ── ВАЖНО: задайте сложные пароли в .env ──
nano .env
docker compose up -d
```

### 4. Backend

```bash
cd /opt/sakbol-v2/backend
cp .env.example .env
# Подставьте:
#  - DATABASE_URL=postgresql://sakbol:<пароль из infra/.env>@127.0.0.1:5433/sakbol
#  - JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, PIN_ANCHOR_PEPPER (openssl rand -base64 48)
#  - RESEND_API_KEY (см. docs/SETUP_RESEND.md)
#  - GEMINI_API_KEY (см. docs/SETUP_GEMINI.md)
#  - CORS_ORIGINS=https://app-v2.adventory.store,https://sakbol-v2.adventory.store
nano .env

docker build -t sakbol-backend .
docker run -d --name sakbol-backend \
  --restart unless-stopped \
  --network sakbol_default \
  -p 127.0.0.1:3001:3001 \
  --env-file .env \
  -e DATABASE_URL="postgresql://sakbol:<password>@postgres:5432/sakbol" \
  -e REDIS_URL="redis://redis:6379" \
  -e S3_ENDPOINT="http://minio:9000" \
  sakbol-backend
```

### 5. nginx + Let's Encrypt

```bash
sudo apt -y install nginx certbot python3-certbot-nginx

sudo cp infra/nginx/sites/{api,app,sakbol}.sakbol.conf /etc/nginx/sites-available/
# Подставьте реальные server_name (sakbol-v2.adventory.store и т.д.)
sudo ln -sf /etc/nginx/sites-available/api.sakbol.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/app.sakbol.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/sakbol.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d api-v2.adventory.store
sudo certbot --nginx -d app-v2.adventory.store
sudo certbot --nginx -d sakbol-v2.adventory.store
```

### 6. Лендинг и Flutter Web — статика

Сборка идёт в GitHub Actions, на сервер заливается через rsync (см. `.github/workflows/`).

Или вручную для первой проверки:

```bash
# Landing
cd /opt/sakbol-v2/landing
npm install && npm run build
sudo rm -rf /var/www/sakbol-landing && sudo cp -r dist /var/www/sakbol-landing

# Flutter Web (требует Flutter SDK на сервере или сборка в CI)
cd /opt/sakbol-v2/app
flutter pub get
flutter build web --release
sudo rm -rf /var/www/sakbol-app && sudo cp -r build/web /var/www/sakbol-app
```

### 7. Smoke-проверка

```bash
curl https://api-v2.adventory.store/health
# {"ok":true,"service":"sakbol-backend","db":"ok",...}
```

Открыть в браузере: `https://app-v2.adventory.store` и `https://sakbol-v2.adventory.store`.

## CI/CD

GitHub Actions деплоит по push в main:
- `.github/workflows/backend.yml` — Docker build + SSH deploy (как сейчас в старом проекте)
- `.github/workflows/app-web.yml` — `flutter build web` + rsync
- `.github/workflows/landing.yml` — `astro build` + rsync
- `.github/workflows/app-android.yml` — `fastlane` → Google Play (internal track)

Будут созданы в **Фазе 1** (после того как backend заработает).
