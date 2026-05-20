# Setup: Firebase Cloud Messaging (push)

FCM нужен для **push-уведомлений** на Android. Бесплатно без лимитов.

## 1. Создать проект Firebase

1. https://console.firebase.google.com/ → **Add project**.
2. Имя: `sakbol-prod` (один общий проект для prod и dev — можно завести отдельные).
3. Disable Google Analytics (на MVP не нужен; включить позже).
4. **Create project**.

## 2. Добавить Android-приложение

1. В консоли проекта → **Project Overview** → ⚙️ → **Project settings** → **Your apps** → нажать **Android**.
2. **Android package name:** `app.sakbol`
3. **App nickname:** `SakBol Android`
4. **Debug signing certificate SHA-1:** пока пропустить (понадобится для google-sign-in позже).
5. **Register app**.
6. **Скачать `google-services.json`** → этот файл положить в:
   ```
   app/android/app/google-services.json
   ```
   *(директория появится после `flutter create .` в каталоге `app/`)*

> **Этот файл коммитим в репозиторий.** Он не секретный (содержит публичные ID), просто привязка приложения к проекту.

## 3. (Позже) Добавить iOS-приложение

Когда дойдём до iOS:
- В Firebase → **Add app** → **iOS**.
- **Bundle ID:** `app.sakbol`.
- Скачать `GoogleService-Info.plist` → в `app/ios/Runner/GoogleService-Info.plist`.

## 4. Backend: сервисный аккаунт для отправки

Чтобы NestJS мог слать push:

1. Firebase Console → **Project settings** → **Service accounts** → **Generate new private key**.
2. Скачается JSON-файл с приватным ключом.
3. На VPS положите его как `/opt/sakbol-v2/secrets/firebase-service-account.json` (права `600`).
4. В backend `.env`:
   ```env
   FCM_SERVICE_ACCOUNT_PATH=/opt/sakbol-v2/secrets/firebase-service-account.json
   FCM_PROJECT_ID=sakbol-prod
   ```

> Этот JSON секретный — НЕ коммитим. Тоже добавлен в `.gitignore`.

## 5. Flutter: подключить FCM

В Фазе 2 добавим в `pubspec.yaml`:
```yaml
firebase_core: ^3.6.0
firebase_messaging: ^15.1.3
```

И инициализируем в `main.dart`. Подробности — в задаче Фазы 2.

## Проверка

После Фазы 2:

```bash
# В Flutter-app зайти под тест-пользователем → /me/devices зарегистрируется автоматически.
# В backend (или вручную через Firebase Console → Cloud Messaging → New campaign):
curl -X POST https://api-v2.adventory.store/v1/admin/push/test \
  -H 'Authorization: Bearer <admin-token>' \
  -d '{"profileId":"...","title":"Тест","body":"Push работает!"}'
```

Уведомление должно прийти на устройство за несколько секунд.
