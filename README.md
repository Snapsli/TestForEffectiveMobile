
## Эндпоинты
1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `POST /api/auth/logout`
4. `GET /api/users/:id` — админ или сам
5. `GET /api/users` — только админ
6. `PATCH /api/users/:id/block` — админ или сам
7. `PATCH /api/users/:id/unblock` — админ или сам

## Быстрый старт (локально)
```bash
npm install
docker compose up --build
```

## Тесты
```bash
npm test
```

Процесс запустится по адресу http://localhost:3000/


Данные админа для входа :
admin@example.com
admin12345
