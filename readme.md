# jobs.uber

## adaptive html / css/ js page layout

Ссылка на макет: https://www.figma.com/file/qiD8r6qU5smMRnELCieNZ6/jobs.uber-(Copy)-(Copy)?node-id=0%3A1

Ссылка на страницу на githubpages:

---
Обязательно добавьте поддержку [editorconfig](https://editorconfig.org/#download) в ваш редактор кода.

```bash
npm i             # установить зависимости
npm start         # запустить сервер разработки (остановить: Ctrl+C)
npm build         # запустить сборку проекта
npm run bemlint   # проверить html-файлы папки build на соответствие BEM
npm run puglint   # проверить pug-файлы
npm run stylelint # проверить scss-файлы
```

Перед коммитом происходит автопроверка файлов. Если проверка выявила ошибки, они будут показаны в терминале.

---
## О сборке:
### в составе:
- Sass (SCSS)
- PostCSS
  - Autoprefixer
  - PostCSS Flexbugs Fixes
    https://github.com/luisrudge/postcss-flexbugs-fixes
  - PostCSS animation
    https://github.com/zhouwenbin/postcss-animation
- Pug (Jade)
- stylelint
- eslint
- puglint
- Babel
- GitPages
- gulp.spritesmith

### файл config.js

Файл **`config.js`** содержит глобальные настройки проекта в объекте `config`:

> **dir** — переменные директорий проекта
> **addAssets** — дополнительные файлы проекта
> **options** — флаги, если нужно отключить какую-то часть сборки (например, в случае полной ненадобности js или сторонних модулей (Vendors)):
>* **copyAssets** — отключает копирование дополнительных файлов проекта
>* **processJs** — отключает создание `/js/script.min.js` и отслеживание изменений в js-файлах
>* **copyJsVendors** — отключает обработку дополнительных js-модулей и создание `/js/vendors.min.js`
> при **`processJs`**` = false` и **`processJs`**` = false` папка `/js` не создается

### gh-pages
Модуль `gh-pages` для публикации результатов верстки уже установлен

```bash
npx gulp deploy  # инициализация
npm start deploy # отправка последнего коммита
```
