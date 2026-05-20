# SakBol App (Flutter)

Кроссплатформенный клиент SakBol: **Android + Web**. iOS подключим позже.

## Требования

- Flutter ≥ 3.24 ([установка](https://docs.flutter.dev/get-started/install))
- Android SDK (для Android-сборки)
- Chrome (для Web)

## Первый запуск (после клонирования)

```bash
cd app

# 1. Сгенерировать платформенные папки (android, web, ios, …) — один раз
flutter create . --platforms=android,web,ios --org=app.sakbol --project-name=sakbol_app

# 2. Поставить зависимости
flutter pub get

# 3. Запустить
flutter run -d chrome           # Web
flutter run -d <android_device> # Android
```

> Package name: `app.sakbol` (используется в Android `applicationId` и iOS bundle id).

## Структура

```
lib/
├── core/                (network, storage, theme, router, errors, localization)
├── data/
│   ├── api/             (СГЕНЕРИРОВАННЫЙ openapi → dart-dio клиент)
│   ├── models/          (freezed + json_serializable)
│   └── repositories/
├── domain/
│   ├── entities/
│   └── usecases/
└── presentation/
    ├── features/        (auth, home, analyses, documents, …)
    └── widgets/
```

## Генерация API-клиента из бэкенда

```bash
# 1. Запустите backend (см. backend/README.md), убедитесь что http://localhost:3001/docs-json отвечает.
# 2. Сгенерируйте dart-клиент:
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:3001/docs-json \
  -g dart-dio \
  -o lib/data/api \
  --additional-properties=pubName=sakbol_api,pubLibrary=sakbol_api

# 3. Перегенерируйте freezed/json модели:
dart run build_runner build --delete-conflicting-outputs
```

## Тесты

```bash
flutter test                # unit + widget
flutter test integration_test/
```
