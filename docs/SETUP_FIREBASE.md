# Setup: Firebase Cloud Messaging (push) + FlutterFire

FCM нужен для **push-уведомлений**. Бесплатно без лимитов (Spark plan хватает).

> **TL;DR.** В Firebase Console жмите **Flutter** (не Android, не iOS отдельно). FlutterFire CLI зарегистрирует Android + Web (+ iOS) одним проходом и сам положит конфиги в нужные папки. Не придётся вручную скачивать `google-services.json` и править `build.gradle`.

## Шаг 1 — Проект Firebase уже создан

У вас уже есть проект `Sakbol` (Spark plan) — со скриншота.

## Шаг 2 — В консоли нажмите Flutter

На экране "Get started by adding Firebase to your app" вы видите иконки платформ:

> 🍎 iOS+  &nbsp;&nbsp; 🤖 Android  &nbsp;&nbsp; </> Web  &nbsp;&nbsp; ▲ Unity  &nbsp;&nbsp; **🟦 Flutter** ← жмёте эту

Откроется мастер «Add Firebase to your Flutter app». Не закрывайте — мастер просто показывает команды, которые мы выполним ниже.

## Шаг 3 — Установить FlutterFire CLI на свою машину

В терминале (один раз для всего компьютера):

```bash
# Установить Firebase CLI (для аутентификации в Google)
brew install firebase-cli
firebase login

# Установить flutterfire_cli (Dart-инструмент)
dart pub global activate flutterfire_cli

# Добавить ~/.pub-cache/bin в PATH (если ещё нет)
echo 'export PATH="$PATH:$HOME/.pub-cache/bin"' >> ~/.zshrc
source ~/.zshrc
```

## Шаг 4 — Сначала создаём Flutter-проект, потом подключаем Firebase

В каталоге `app/` Flutter-проект ещё не был полностью инициализирован (есть только `lib/main.dart` и `pubspec.yaml`). Запустите:

```bash
cd /Users/asans/Desktop/sakbol/app

# Сгенерировать платформенные папки (один раз)
flutter create . \
  --platforms=android,web,ios \
  --org=app.sakbol \
  --project-name=sakbol_app

flutter pub get
```

> `--org=app.sakbol` → итоговый Android `applicationId` будет `app.sakbol.sakbol_app`. Это нужно учитывать в Firebase (см. ниже).

После этого добавьте FCM-пакеты в `pubspec.yaml`:

```yaml
dependencies:
  firebase_core: ^3.6.0
  firebase_messaging: ^15.1.3
```

```bash
flutter pub get
```

## Шаг 5 — Подключить проект Firebase к коду

```bash
cd /Users/asans/Desktop/sakbol/app

flutterfire configure
```

Мастер задаст вопросы:

1. **Select a Firebase project** → выберите `Sakbol`.
2. **Which platforms?** → отметьте **android** и **web**. iOS можно отметить тоже — данные сохранятся, использовать начнём позже. macOS / Linux / Windows — снимите.
3. **Android application id?** → подтвердить `app.sakbol.sakbol_app` (или ввести другой — тогда Firebase создаст приложение с этим ID).

CLI автоматически:
- Зарегистрирует выбранные платформы в проекте Firebase.
- Положит `android/app/google-services.json` (для FCM на Android).
- Положит `ios/Runner/GoogleService-Info.plist` (если выбрали iOS).
- Сгенерирует `lib/firebase_options.dart` с web-конфигом.

Эти файлы коммитим в репозиторий — они не секретные.

## Шаг 6 — Инициализировать Firebase в `main.dart`

В `lib/main.dart`:

```dart
import "package:firebase_core/firebase_core.dart";
import "firebase_options.dart";

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const ProviderScope(child: SakbolApp()));
}
```

## Шаг 7 — Сервисный аккаунт для отправки push с backend

Чтобы NestJS мог отправлять push, нужен сервисный аккаунт:

1. Firebase Console → ⚙️ **Project settings** → **Service accounts** → **Generate new private key**.
2. Скачается JSON-файл.
3. На VPS положите как `/opt/sakbol-v2/secrets/firebase-service-account.json` (`chmod 600`).
4. В `backend/.env`:
   ```env
   FCM_SERVICE_ACCOUNT_PATH=/opt/sakbol-v2/secrets/firebase-service-account.json
   FCM_PROJECT_ID=sakbol-xxxxx     # точный ID можно скопировать из Project settings → General
   ```

> Этот JSON секретный — **НЕ коммитим**. Он уже в `.gitignore` через паттерн `secrets/`.

## Шаг 8 — Проверка (после Phase 2 Flutter-MVP)

```bash
# Войти под тест-пользователем во Flutter-app
# Endpoint /v1/me/devices зарегистрирует FCM-токен автоматически.

# Из Firebase Console → Cloud Messaging → Send test message
# либо через backend (Phase 2):
curl -X POST https://api-v2.adventory.store/v1/admin/push/test \
  -H 'Authorization: Bearer <admin-token>' \
  -d '{"profileId":"...","title":"Тест","body":"Push работает!"}'
```

Уведомление придёт за несколько секунд.

---

## Когда добавить iOS-приложение позже

Если сейчас выбрали только Android+Web:
```bash
flutterfire configure --platforms=ios
```
Один проход — данные дописываются, не перезатираются.
