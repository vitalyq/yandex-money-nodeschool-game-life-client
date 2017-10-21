# Задание по теме "WebSocket"

## Game of Life (клиентская часть)

### Описание задания:
В текущем приложении реализована **клиентская** часть игры `Game of Life`.
Но, к сожалению, файл с сетевым взаимодействием был похищен.
Вам предстоит реализовать утерянную часть кода.

Дабы облегчить ваши мучения вот те факты, которые нам известны:

* Все взаимодействие с сервером происходит по протоколу **WebSocket**;
* В **opening handshake** сервер ожидает авторизации по токену;
(прим. `ws://example.com/?token=YOUR_TOKEN`)
* Сервер присылает обновления в виде сообщения со следующей структурой:
```
{
	type: 'TYPE_HERE',
	data: {Object}
}
```
* Поле `type` имеет следующие значения: [`INITIALIZE`, `UPDATE_STATE`];
* Сервер ожидает получить сообщения со следующей структурой:
```
{
	type: 'TYPE_HERE',
	data: {Object}
}
```
* Поле `type` имеет следующие значения: [`ADD_POINT`];

#### План действий:

В глобальной области видимости вам доступен объект игры - `LifeGame`.
```
	LifeGame(user: Object, setting: Object): LifeGame instance - конструктор
	LifeGame.init(): void - метод инициализации игры
	LifeGame.setState(state: Object): void - метод обновления состояния игры
	LifeGame.send(state: Object): void - метод отправки данных на сервер
```

И объект приложения - `App`.
```
	App.onToken(token: string): void - метод вызывающийся, после ввода имени пользователя
```

* Переопределить метод `onToken`;
* Получить токен;
* Отправить токен в **opening handshake** к серверу игры по адресу: `ws://ws.rudenko.tech/life/api`;
* Установить соединение с сервером, определить обработчики событий ws: `onopen, onmessage, onerror, onclose`;
* При сообщении с `type` === `INITIALIZE` необходимо инициализировать игру исходя из приходящих данных (`new LifeGame, init, setState`), а также переопределить метод `send`;
* Метод `send` должен отправлять данные на сервер с `type` === `ADD_POINT` и данными из аргументов;
* При сообщении с `type` === `UPDATE_STATE` необходимо делать обновление состояния игры.

## P.S.
Весь код пишите в файле `./main/index.js`.<br/>
Открывать в браузере файл `./index.html`.

## P.P.S.
Серверная часть игры [тут](https://github.com/NikitaRudenko/yandex-money-nodeschool-game-life-server).
