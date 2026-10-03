# TG WS Proxy — лендинг

Одностраничный сайт прокси для Telegram на WebSocket-транспорте: чистый чёрный минимализм,
тёмная/светлая темы, RU + EN версии, интерактивное демо, живой фон, блог, SEO-разметка и PWA-офлайн.

## Структура

| Файл | Что это |
|---|---|
| `index.html` | русская версия лендинга |
| `en/index.html` | английская версия |
| `styles.css` | все стили и анимации (цвета — через CSS-переменные, две темы) |
| `app.js` | интерактивное демо, тема, canvas-фон, скроллспай, share, бейдж версии, service worker |
| `sw.js` | service worker (офлайн-кэш; при обновлении сайта поднимайте версию `tgws-vN`) |
| `manifest.webmanifest` | PWA-манифест |
| `blog/` | блог: 3 статьи о туннелях, пинге и keep-alive |
| `support.html` / `terms.html` | страницы «Поддержка» и «Условия использования» |
| `404.html` | страница ошибки для GitHub Pages |
| `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` | иконки |
| `og-image.png` | карточка для соцсетей (1200×630) |
| `robots.txt`, `sitemap.xml` | для поисковиков |
| `<ключ>.txt` | ключ IndexNow (см. раздел про Яндекс) |

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

## Индексация в поисковиках

Сайт уже подготовлен: sitemap.xml, robots.txt, schema.org (JSON-LD), OG/Twitter-разметка,
файл ключа IndexNow и скрипт отправки. От вас — деплой на публичный домен и пять шагов.

### Шаг 0. Вставьте коды верификации

В `<head>` обеих версий (index.html, en/index.html) есть закомментированный блок
верификации — вставьте коды из кабинетов и раскомментируйте:

| Поисковик | Кабинет вебмастера | Метатег |
|---|---|---|
| Яндекс | https://webmaster.yandex.ru | `yandex-verification` |
| Google | https://search.google.com/search-console | `google-site-verification` |
| Bing | https://www.bing.com/webmasters | `msvalidate.01` |
| Mail.ru | https://webmaster.mail.ru | `mailru-verification` |
| Baidu | https://ziyuan.baidu.com | `baidu-site-verification` |
| Naver | https://searchadvisor.naver.com | `naver-site-verification` |

### Шаг 1. Замените плейсхолдер домена

`https://ваш-домен` → ваш реальный адрес: в `sitemap.xml`, `robots.txt`,
и раскомментируйте `canonical` / `og:url` / `og:image` / hreflang в обоих index.html.

### Шаг 2. Добавьте sitemap в каждом кабинете

В каждом вебмастере: «Индексирование → Файлы Sitemap» → `https://ваш-домен/sitemap.xml`.

### Шаг 3. Залейте сайт в индексацию одной командой (IndexNow)

IndexNow — общий протокол мгновенной отправки, его принимают **Яндекс, Bing, Naver, Seznam, Yep**:

```bash
python3 submit-indexnow.py https://ваш-домен
```

Скрипт сам найдёт ключ, соберёт URL из sitemap.xml и отправит их одним запросом.
Запускайте после каждого обновления контента.

### Шаг 4. Ручная отправка (где IndexNow не работает)

- **Google** — Search Console → «Проверка URL» → «Запросить индексирование» (API-отправки без OAuth нет).
- **Mail.ru, Baidu** — в кабинетах есть форма «Добавить URL / Переобход».

### Шаг 5. Google-специфика

Google не использует IndexNow. В Search Console отправьте sitemap (шаг 2) и запросите
индексирование главной вручную; дальше краулер дойдёт сам — hreflang и JSON-LD уже на месте.

### Контроль

Индексация появляется через часы (Yandex/Bing с IndexNow) до нескольких дней (Google).
Проверка: `site:ваш-домен` в поиске, либо статистика обхода в кабинетах вебмастера.

## Живой бейдж версии

В `<head>` есть `<meta name="tgws:repo" content="">`. Впишите туда репозиторий вида `user/repo` —
секция «Скачать» начнёт подтягивать номер последнего релиза и дату из GitHub API (кэш на час).

## Технические заметки

- Служебный сценарий пересборки PNG-иконок лежит в истории чата; иконки простые,
  перегенерировать можно тем же скриптом (чистый Python + zlib, без зависимостей).
- Анимации уважают `prefers-reduced-motion`.
