# TG WS Proxy — лендинг

Одностраничный сайт прокси для Telegram на WebSocket-транспорте: чистый чёрный минимализм,
тёмная/светлая темы, RU + EN версии, живой фон, SEO-разметка и PWA-офлайн.

## Структура

| Файл | Что это |
|---|---|
| `index.html` | русская версия лендинга |
| `en/index.html` | английская версия |
| `styles.css` | все стили и анимации (цвета — через CSS-переменные, две темы) |
| `app.js` | reveal-анимации, живое демо, canvas-фон, тема, service worker, share |
| `sw.js` | service worker (офлайн-кэш, при обновлении сайта поднимайте версию `tgws-vN`) |
| `manifest.webmanifest` | PWA-манифест |
| `support.html` / `terms.html` | страницы «Поддержка» и «Условия использования» |
| `404.html` | страница ошибки для GitHub Pages |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | иконки |
| `og-image.png` | карточка для соцсетей (1200×630) |
| `robots.txt`, `sitemap.xml` | для поисковиков |

## Локальный запуск

```bash
python3 -m http.server 8742
# открыть http://127.0.0.1:8742
```

## Деплой на GitHub Pages

1. Создайте репозиторий и запушьте содержимое папки.
2. Settings → Pages → Deploy from branch → `main` / root.
3. После публикации замените плейсхолдеры `ваш-домен`:
   - `index.html` и `en/index.html` — раскомментируйте `canonical`, `og:url`, `og:image`, hreflang;
   - `sitemap.xml`, `robots.txt` — впишите адрес;
   - `index.html` (секция Download) — ссылка на ваш релиз `.exe` вместо `#`;
   - `support.html` — почта и Telegram-аккаунт.
4. Если меняли файлы после первого визита пользователей — поднимите версию кэша в `sw.js`.

## Технические заметки

- Служебный сценарий пересборки PNG-иконок лежит в истории чата; иконки простые,
  перегенерировать можно тем же скриптом (чистый Python + zlib, без зависимостей).
- Анимации уважают `prefers-reduced-motion`.
