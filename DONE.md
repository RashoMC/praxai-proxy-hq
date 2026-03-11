# PraxAi Proxy HQ — Build Complete

## What Was Built

### Pages
| Route | Description |
|-------|-------------|
| `/` | Dashboard — KPI cards, drag-drop Kanban, Agent Office panel, Follow-ups |
| `/leads/new` | Add Lead form with all fields: company, contact, email, phone, LinkedIn, status, priority, source, follow-up date, notes, message draft |
| `/leads/[id]` | Lead detail — inline edit, activity log, delete, message draft, follow-up |
| `/settings` | Settings page with Instantly API key (pre-filled), eye toggle, save |

### Components
| Component | Description |
|-----------|-------------|
| `components/kanban/KanbanBoard.tsx` | Full drag-drop Kanban board using @dnd-kit/core + sortable. 4 columns: LEAD → CONNECT → MESSAGE → CLOSE. Drag cards between columns, optimistic updates. |
| `components/kanban/LeadCard.tsx` | Sortable lead card with priority badge, contact info, message sent indicator, overdue follow-up indicator |
| `components/FollowUps.tsx` | Follow-ups sidebar widget pulling from `/api/followups/due` |
| `components/KpiCards.tsx` | 4 KPI cards: Total Leads, Leads This Week, Messages Sent, Conversion Rate |
| `components/AgentOffice.tsx` | Live agent status panel: Mark 📈, Prism 🚀, Crafter ⚒️ |
| `components/Navbar.tsx` | Sticky top nav: Dashboard / Add Lead / Settings |

### API Routes
| Endpoint | Methods |
|----------|---------|
| `/api/leads` | GET (all leads), POST (create) |
| `/api/leads/[id]` | GET, PUT (update), DELETE |
| `/api/leads/[id]/activity` | POST (log activity) |
| `/api/leads/[id]/status` | PUT (quick status change) |
| `/api/agents` | GET (all agents) |
| `/api/agents/[id]` | PUT (update agent status/task) |
| `/api/kpis` | GET (dashboard KPIs) |
| `/api/followups` | GET (all follow-ups) |
| `/api/followups/due` | GET (due within 24h) |
| `/api/settings` | GET, POST (Instantly API key) |

### Database
- **PostgreSQL** running in Docker: `leadflow-postgres` on port 5432
- **Database**: `praxai_proxy`
- **Migration**: applied (`20260311164455_init`)
- **Seed**: 3 agents (Mark, Prism, Crafter), 10 leads across all pipeline stages, activities

### Stack
- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 + shadcn/ui
- Prisma 7 + PostgreSQL
- @dnd-kit/core + @dnd-kit/sortable (drag-drop Kanban)
- date-fns (date formatting)
- sonner (toast notifications)
- Pixelify Sans pixel font for headers

## How to Run

```bash
cd /home/agent/projects/praxai-proxy-hq

# Ensure postgres is running
docker ps | grep leadflow-postgres

# Run dev server
DATABASE_URL="postgresql://leadflow:leadflow@localhost:5432/praxai_proxy" npm run dev

# Open http://localhost:3000
```

## Re-seed Database
```bash
DATABASE_URL="postgresql://leadflow:leadflow@localhost:5432/praxai_proxy" npx prisma db seed
```

## Instantly API Key
Pre-configured in `/api/settings`: `ZTU0MzA4YjYtYmFmMi00YWU4LTk0MTctMzdkNjI1ZTMwMTFlOkhJRFhBTExsY3VDRA==`

Change it any time in Settings → Instantly.ai

## Build Status
```
✓ Compiled successfully (Turbopack)
✓ 15 routes (API + pages)
✓ All API endpoints returning correct data
✓ 10 seeded leads, 3 agents, 6 activities
```
