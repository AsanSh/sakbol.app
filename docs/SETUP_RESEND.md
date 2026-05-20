# Setup: Resend (email)

Используем Resend для:
- Email-кодов (если выберем email-OTP в будущем).
- Восстановление пароля (`POST /v1/auth/password/forgot` → ссылка из письма).
- Уведомлений (опционально).

Бесплатный план: **3 000 писем/мес**, до 100 в день. Хватит для MVP и небольших пилотов.

## 1. Регистрация

1. Откройте https://resend.com и нажмите **Sign Up**.
2. Регистрируйтесь через email (например, `support@sakbol.app`) или GitHub.

## 2. Подтверждение домена

1. В консоли Resend → **Domains** → **Add Domain**.
2. Введите домен, с которого будут уходить письма:
   - **На переходный период:** `adventory.store`
   - **После cutover:** `sakbol.app`
3. Resend покажет 3 DNS-записи (1× MX, 2× TXT для SPF и DKIM).
4. В личном кабинете регистратора домена добавьте все три записи **точно как указано Resend**.
5. Через 5–30 минут в Resend нажмите **Verify** — статус домена должен стать ✅ Verified.

> Без верифицированного домена письма уходят с пометкой "via resend.dev" и часто попадают в спам.

## 3. API-ключ

1. **API Keys** → **Create API Key**.
2. Имя: `sakbol-backend-prod` (для прода) и отдельно `sakbol-backend-dev`.
3. Permissions: **Sending access**.
4. Скопируйте ключ — он показывается **один раз**.

## 4. Подставить в backend `.env`

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@adventory.store
EMAIL_REPLY_TO=support@adventory.store
```

> До получения ключа в backend работает `StubEmailProvider` — пишет письма в stdout, ничего не отправляет. Безопасно для разработки.

## 5. Проверка

После Фазы 1 (когда будет реализован `password/forgot`):

```bash
curl -X POST https://api-v2.adventory.store/v1/auth/password/forgot \
  -H 'Content-Type: application/json' \
  -d '{"email":"your@email.com"}'
```

Письмо должно прийти за 10–30 секунд. Если не пришло — проверьте Resend → **Logs**.

## Расширение

Если упрётесь в 3 000 писем/мес:
- Resend Pro: $20/мес → 50 000 писем.
- Альтернативы с похожим API: Postmark ($15/мес → 10 000 писем), AWS SES (~$0.10 за 1000 писем).

Абстракция в backend (`EmailProvider` интерфейс) позволяет сменить провайдера за час.
