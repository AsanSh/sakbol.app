# Setup: Nikita Mobile (SMS-OTP для KG)

Используем Nikita для:
- Вход по телефону: `POST /v1/auth/phone-otp/request` → SMS с кодом.
- Восстановление пароля по телефону (альтернатива email).

Заглушка `StubSmsProvider` уже работает: пишет код в backend log. Можно полноценно разрабатывать UI без подключения Nikita.

## 1. Договор и доступ

Сайт: https://smspro.nikita.kg/ (или актуальный URL, уточните на странице tariff).

1. Связаться с менеджером Nikita (телефон/email на их сайте).
2. Подписать договор: юр.лицо или ИП.
3. Получить:
   - **Логин** (обычно цифры),
   - **Пароль** для API,
   - **Sender ID** (имя отправителя, обычно `SakBol` после модерации Nikita).
4. Минимальное пополнение: уточнить у менеджера (обычно от 1000 сом).

## 2. Подставить в backend `.env`

```env
NIKITA_LOGIN=12345
NIKITA_PASSWORD=secret
NIKITA_SENDER=SakBol
```

## 3. Формат запроса (Nikita HTTP API)

Документация выдаётся менеджером, но типовая схема:

```
POST https://smspro.nikita.kg/api/message
Content-Type: application/xml

<message>
  <login>...</login>
  <pwd>...</pwd>
  <id>unique-message-id</id>
  <sender>SakBol</sender>
  <text>SakBol: ваш код 123456</text>
  <phones><phone>996555123456</phone></phones>
</message>
```

В backend это инкапсулировано в `NikitaSmsProvider`. Если Nikita изменит формат — правится в одном файле.

## 4. Тарифы (ориентир)

- ~2.5–4 сом за SMS внутри KG.
- 1000 регистраций ≈ 2500–4000 сом.
- Альтернативы: SMS.KG, BeelineKG SMS API — переключение через `SmsProvider` интерфейс.

## 5. Проверка

После Фазы 1:

```bash
curl -X POST https://api-v2.adventory.store/v1/auth/phone-otp/request \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+996555123456"}'
# {"challengeId":"...","ttlSec":600}
```

На телефон должен прийти SMS с 6-значным кодом.

## Anti-abuse

В коде уже заложено:
- Rate limit: 1 запрос на номер в минуту, не более 5 в час.
- 5 неверных попыток ввода кода → challenge сжигается, нужно запросить новый.
- `attempts` хранится в `OtpChallenge`, проверяется в `OtpService`.
