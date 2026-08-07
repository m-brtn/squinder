# Squinder: миграция UI на gluestack-ui v5 и переход на mobile-only

**Автор:** m_brtn  
**Дата:** 2026-08-07, 22:00 EEST  
**Ветка:** `main`  
**Базовый коммит:** `6f44e9d`  
**Связанные задачи:** без трекера

## Контекст

Существующий Expo-интерфейс был собран на React Native primitives и
`StyleSheet`. Задачей сессии стала установка gluestack-ui v5 и перенос текущих
экранов на локальные gluestack-компоненты с NativeWind v5 и Tailwind CSS v4.

Во время проверки Expo Web обнаружилась несовместимость NativeWind v5 /
`react-native-css`: web-runtime падал при remap `FlatList` из
`react-native-web`. Понижение версий и Metro resolver workaround проблему не
устранили. Принято продуктовое решение прекратить web-отладку и развивать
текущий клиент только для iOS и Android.

## Что сделано

### 1. Установка gluestack-ui v5

- Добавлена локальная библиотека компонентов в `apps/mobile/components/ui/`.
- Подключены NativeWind v5, Tailwind CSS v4, `react-native-css` и необходимые
  Babel, Metro и PostCSS-конфигурации.
- `lightningcss` зафиксирован на совместимой версии `1.30.1` через workspace
  override.
- Цветовая схема перенесена в semantic tokens в `global.css`, включая light и
  dark темы.

### 2. Миграция существующего UI

- `App.tsx`, `HomeScreen`, `SwiperScreen`, `OnboardingScreen` и
  `ThemeToggle` переведены с `View`, `Text`, `Pressable`,
  `ActivityIndicator` и `StyleSheet` на gluestack-компоненты.
- Формы онбординга используют compound-компоненты `FormControl`, `Input`,
  `RadioGroup`, `Progress` и `Button`.
- Удалены локальные фабрики `createStyles`; визуальные состояния теперь
  выражены через semantic utility classes.
- Существующий `ThemeProvider` интегрирован с `GluestackUIProvider`.

### 3. Переход на Expo SDK 56 и Expo Go

- Expo возвращён на SDK 56; React Native и Expo-модули синхронизированы через
  `expo install --fix`.
- Для ICU plural messages подключён официальный
  `@formatjs/intl-pluralrules` polyfill: Hermes не предоставляет
  `Intl.PluralRules`, необходимый `react-intl`.
- Корневому `SafeAreaView` задан нативный `style={{ flex: 1 }}`: NativeWind не
  применял `flex-1` к стороннему safe-area компоненту, из-за чего весь UI
  схлопывался и Expo Go показывал пустой экран.
- Команды `start`, `ios` и `android` запускают Metro с явным флагом `--go`.
- Удалена прямая web-only зависимость `@expo/dom-webview`.
- Удалён экспериментальный Metro resolver для `react-native-web/FlatList`;
  оставлена стандартная NativeWind-конфигурация.
- README обновлён: основной локальный workflow теперь использует Expo Go на
  iOS и Android. Development build сохранён как опция для будущих native-only
  модулей, которых нет в Expo Go.

## Архитектурные решения

- **Текущий Expo-клиент — mobile-only.** Целевые платформы: iOS и Android.
  Expo Web и Telegram Mini App временно исключены из acceptance criteria.
- **Базовая версия — Expo SDK 56.** Она совместима с актуальным Expo Go и
  позволяет тестировать текущий набор зависимостей без собственного dev client.
- **Gluestack-компоненты локальны.** Их можно менять вместе с приложением без
  ожидания обновлений внешнего component package.
- **Semantic tokens вместо literal colors.** Тема централизована в
  `global.css`; компоненты не должны зависеть от конкретных palette values.

## Проверка

- `pnpm dlx expo-doctor@latest` — 21/21 проверок пройдено.
- `pnpm typecheck` — API и mobile без TypeScript-ошибок.
- IDE diagnostics — новых ошибок нет.
- `expo export --platform ios` — iOS bundle успешно собран.
- `expo export --platform android` — Android bundle успешно собран.
- `expo start --go` — Metro успешно запускается в режиме Expo Go.

## Риски и открытые вопросы

- Expo Web остаётся сломанным из-за ошибки `react-native-css/FlatList`; в
  текущем mobile-only scope она не блокирует разработку.
- Реальный запуск на физическом iOS/Android устройстве требует ручного
  сканирования QR-кода в Expo Go и ещё не автоматизирован.
- При добавлении нативного модуля, отсутствующего в Expo Go, потребуется
  вернуться к EAS development build.
- Workspace-правила обновлены под mobile-only scope, поэтому возврат web-first
  потребует отдельного явного продуктового решения.

## Коммиты

- `6f44e9d` — базовый коммит перед текущей миграцией.
- Изменения gluestack-ui, Expo SDK 56 и mobile-only workflow пока не
  закоммичены.

## Следующая сессия

Проверить онбординг и главный экран на реальном iOS или Android устройстве через
Expo Go. После smoke test продолжить перенос и полировку мобильных экранов на
локальных gluestack-компонентах; web-проблемы не включать в текущий scope.
