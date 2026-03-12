# PraxAi Proxy HQ: Todo API + Custom KPI Endpoints

## Implemented

- Added Prisma models: `Todo`, `CustomKpi`
- Added enums: `TodoPriority`, `TodoStatus`
- Added API routes:
  - `POST /api/todos`
  - `GET /api/todos`
  - `PUT /api/todos/[id]`
  - `DELETE /api/todos/[id]`
  - `POST /api/kpis/custom`
  - `GET /api/kpis/custom`
  - `GET /api/kpis/dashboard`
- Updated dashboard `/` to show:
  - Ras todo queue
  - per-agent custom KPI cards
- Added seed data for todos, KPIs, and the `Blox` agent
- Applied migration: `20260312120339_add_todos_custom_kpis`

## Prisma Models

### `Todo`

- `id`
- `title`
- `description`
- `priority`: `LOW | MEDIUM | HIGH`
- `status`: `PENDING | DONE`
- `agent`
- `createdAt`
- `updatedAt`

### `CustomKpi`

- `id`
- `name`
- `value` (`Json`)
- `change`
- `agent`
- `timestamp`
- `createdAt`

## API Examples

### Create todo

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ship dashboard QA pass",
    "description": "Need final visual check before handoff.",
    "priority": "HIGH",
    "agent": "Crafter",
    "status": "PENDING"
  }'
```

### List todos

```bash
curl "http://localhost:3000/api/todos?status=PENDING&agent=Crafter"
```

### Update todo status

```bash
curl -X PUT http://localhost:3000/api/todos/TODO_ID \
  -H "Content-Type: application/json" \
  -d '{"status":"DONE"}'
```

### Delete todo

```bash
curl -X DELETE http://localhost:3000/api/todos/TODO_ID
```

### Report custom KPI

```bash
curl -X POST http://localhost:3000/api/kpis/custom \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Replies Booked",
    "value": 27,
    "change": "+3",
    "agent": "Prism",
    "timestamp": "2026-03-12T12:00:00.000Z"
  }'
```

### Get custom KPIs

```bash
curl "http://localhost:3000/api/kpis/custom?agent=Prism"
```

### Get dashboard aggregate

```bash
curl http://localhost:3000/api/kpis/dashboard
```

Response shape:

```json
{
  "overview": {
    "totalLeads": 10,
    "leadsThisWeek": 10,
    "messagesSent": 3,
    "conversionRate": 20,
    "closedLeads": 2,
    "pipelineLeads": 8,
    "pipelineValue": 16000
  },
  "todos": [],
  "todoSummary": {
    "total": 3,
    "pending": 2,
    "done": 1
  },
  "customKpisByAgent": []
}
```

## Files Added

- `app/api/todos/route.ts`
- `app/api/todos/[id]/route.ts`
- `app/api/kpis/custom/route.ts`
- `app/api/kpis/dashboard/route.ts`
- `prisma/migrations/20260312120339_add_todos_custom_kpis/migration.sql`

## Files Updated

- `prisma/schema.prisma`
- `prisma/seed.ts`
- `app/page.tsx`

## Verification

- `npx prisma migrate dev --name add_todos_custom_kpis`
- `npx prisma db seed`
- `npm run lint`
- `npm run build`
- Smoke-tested all new endpoints against local dev server

Smoke test results:

- `POST /api/todos` returned `201`
- `GET /api/todos?status=PENDING&agent=Crafter` returned `200`
- `PUT /api/todos/[id]` returned `200`
- `DELETE /api/todos/[id]` returned `200`
- `POST /api/kpis/custom` returned `201`
- `GET /api/kpis/custom?agent=Prism` returned `200`
- `GET /api/kpis/dashboard` returned `200`
