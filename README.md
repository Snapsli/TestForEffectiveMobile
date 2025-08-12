# Users Service (Express + TypeScript + MongoDB)

## Что внутри
- Модель `User`: `fullName`, `birthDate`, `email` (unique), `passwordHash`, `role`, `isActive`
- JWT авторизация; токен также записывается в `httpOnly` куку `token` — удобно для существующей админ-панели
- Rate limiting на `/api/auth/*`
- Логирование через `pino-http`
- Тесты: Vitest + Supertest + mongodb-memory-server
- Dockerfile / docker-compose.yml

## Эндпоинты
1. `POST /api/auth/register`
2. `POST /api/auth/login`
3. `POST /api/auth/logout`
4. `GET /api/users/:id` — админ или сам
5. `GET /api/users` — только админ
6. `PATCH /api/users/:id/block` — админ или сам
7. `PATCH /api/users/:id/unblock` — админ или сам
8. `PATCH /api/users/:id` — обновление профиля (админ может менять роль)
9. `PATCH /api/users/:id/password` — смена пароля (только сам)

## Быстрый старт (локально)
```bash
cp .env.example .env
# пропишите MONGO_URI и JWT_SECRET
npm i
npm run dev
```

## Docker
```bash
docker compose up --build
```

## Тесты
```bash
npm test
```
