# vkui-connect c поддержкой веба

Установить зависимости
```bash
yarn install
```

Запустить dev-сборку
```bash
yarn run start
```

Собрать и опубликовать на gh-pages
```bash
yarn run build && yarn run deploy
```

Пакет для интеграции VKUI-приложений с нативными клиентами VK для iOS и Android.

```js
const connect = require('vkui-connect');

// Отправляет событие нативному клиенту
connect.send('VKWebAppInit');

// Подписывается на события, отправленные нативным клиентом
connect.subscribe((e) => console.log(e));
```