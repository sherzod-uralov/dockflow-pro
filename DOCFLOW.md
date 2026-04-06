# DockFlow Pro — Loyiha hujjati

## Umumiy ma'lumot

**DockFlow Pro** — hujjat aylanmasi, vazifalar boshqaruvi va ish jarayonlarini avtomatlashtirish platformasi.

- **Framework:** Next.js 16 (App Router) + Turbopack
- **Til:** TypeScript 5 (strict mode)
- **UI:** Mantine 8 + Radix UI + Shadcn/UI + Tailwind CSS 4
- **State:** TanStack React Query 3 (server) + Zustand (client)
- **Form:** React Hook Form + Zod
- **Auth:** NextAuth.js 4
- **HTTP:** Axios (interceptor bilan)
- **Real-time:** Socket.IO Client
- **Grafik:** Recharts, FullCalendar
- **DnD:** DND Kit
- **PDF:** PDFTron WebViewer
- **Test:** Jest + Playwright + axe-core

---

## Dizayn falsafasi

### Asosiy ranglar

| Maqsad | Rang | HEX |
|--------|------|-----|
| **Primary (asosiy)** | To'q ko'k | `#1e3a5f` |
| **Primary hover** | Yanada to'q | `#162d4a` |
| **Background** | Och kulrang | `#f8f9fa` |
| **Border** | Kulrang | `#e9ecef` |
| **Text primary** | Qora | `#212529` |
| **Text secondary** | Kulrang | `#495057` |
| **Text dimmed** | Och kulrang | `#868e96` |
| **Success** | Yashil | `#2ecc71` |
| **Warning** | Sariq | `#f39c12` |
| **Error** | Qizil | `#e74c3c` |
| **Info** | Ko'k | `#3498db` |

### Ranglar qoidasi
- **Tugmalar:** `backgroundColor: "#1e3a5f"` — barcha primary buttonlarda
- **Badge:** `variant="light"` — rangli fon + rangli matn
- **Border:** `1px solid #e9ecef` — barcha paper/card chegaralari
- **Hover:** `backgroundColor: "#f8f9fa"` — oddiy hover
- **Active:** `backgroundColor: "#e7f5ff"` — tanlangan element

### 4 ta mavzu (Theme)
1. **Ocean** (default) — ko'k-to'q ko'k
2. **Sunset** — issiq to'q sariq
3. **Forest** — yashil-o'rmon
4. **Lavender** — binafsha-siyoh

### Tipografiya
- Font: Geist
- Header: `fw={600-700}`, `size="lg"`
- Body: `size="sm"`, `c="#495057"`
- Label: `size="xs"`, `fw={500}`, `c="#868e96"`, `tt="uppercase"`
- Dimmed: `c="dimmed"`

### Komponent qoidalari
- `radius="sm"` — barcha input, button, paper
- `size="sm"` — barcha input, select, button (form ichida)
- `variant="subtle"` — action button'lar
- `variant="light"` — badge'lar
- `withBorder` + `style={{ borderColor: "#e9ecef" }}` — paper'lar

---

## Loyiha strukturasi

```
app/                          # Next.js sahifalar
├── dashboard/                # Asosiy sahifalar
│   ├── document/             # Hujjatlar
│   ├── workflow/             # Ish jarayonlari
│   ├── project/[id]/tasks/   # Loyiha vazifalari
│   ├── task/                 # Barcha vazifalar
│   ├── department/           # Bo'limlar
│   ├── admin/                # Boshqaruv (users, roles, permissions)
│   ├── kpi/                  # KPI (score-config, reward-tiers, monthly-kpi, rewards)
│   ├── audit-log/            # Audit jurnali
│   ├── analytics/            # Tahlillar
│   └── setting/              # Sozlamalar
├── login/                    # Kirish sahifasi
├── view/[id]/                # Ochiq hujjat ko'rish
└── document-edit/            # Hujjat tahrirlash (WOPI)

features/                     # Modul arxitekturasi
├── [feature]/
│   ├── type/                 # TypeScript turlar
│   ├── schema/               # Zod validatsiya
│   ├── service/              # API service (CRUD)
│   ├── hook/                 # React Query hooklar
│   ├── component/            # UI komponentlar
│   ├── page/                 # Sahifa komponentlari
│   └── index.ts              # Ommaviy eksportlar

components/shared/            # Umumiy komponentlar
├── ui/                       # custom-table, custom-modal, custom-file-upload
└── layout/                   # sidebar, header, document.management.layout

lib/                          # Yordamchi
├── crud-service.ts           # CRUD service factory
├── crud-hooks.ts             # CRUD hooks factory
└── socket/                   # WebSocket boshqaruvi

api/
├── axios.instance.ts         # Axios konfiguratsiya + token refresh
└── axios.endpoints.ts        # Barcha API yo'llari
```

---

## Sahifalar (30 ta)

### Hujjat boshqaruvi
| Yo'l | Sahifa |
|------|--------|
| `/dashboard` | Bosh sahifa (statistika) |
| `/dashboard/document` | Hujjatlar ro'yxati (split layout) |
| `/dashboard/document/[id]` | Hujjat tafsiloti |
| `/dashboard/document-type` | Hujjat turlari |
| `/dashboard/document-template` | Hujjat andozalari |
| `/dashboard/journal` | Jurnallar |
| `/dashboard/journal/[id]` | Jurnal tafsiloti |

### Ish jarayoni
| Yo'l | Sahifa |
|------|--------|
| `/dashboard/workflow` | Jarayonlar ro'yxati |
| `/dashboard/workflow/[id]` | Jarayon tafsiloti |
| `/dashboard/workflow-template` | Jarayon shablonlari |
| `/dashboard/workflow-calendar` | Jarayon taqvimi |

### Vazifalar boshqaruvi
| Yo'l | Sahifa |
|------|--------|
| `/dashboard/task` | Barcha vazifalar (kanban/list/calendar) |
| `/dashboard/task/[id]` | Vazifa tafsiloti |
| `/dashboard/project` | Loyihalar |
| `/dashboard/project/[id]/tasks` | Loyiha vazifalari (kanban) |

### Tashkilot
| Yo'l | Sahifa |
|------|--------|
| `/dashboard/department` | Bo'limlar (jadval + ierarxiya) |
| `/dashboard/admin/users` | Foydalanuvchilar |
| `/dashboard/admin/roles` | Rollar |
| `/dashboard/admin/permissions` | Ruxsatlar |

### KPI va natijalar
| Yo'l | Sahifa |
|------|--------|
| `/dashboard/kpi/task-score-config` | Ball sozlamalari |
| `/dashboard/kpi/reward-tiers` | Mukofot darajalari |
| `/dashboard/kpi/monthly-kpi` | Oylik KPI natijalari |
| `/dashboard/kpi/rewards` | Mukofotlar boshqaruvi |

### Boshqa
| Yo'l | Sahifa |
|------|--------|
| `/dashboard/audit-log` | Audit jurnali |
| `/dashboard/analytics` | Tahlillar |
| `/dashboard/setting/profile` | Profil sozlamalari |
| `/dashboard/setting/system-setting` | Tizim sozlamalari |
| `/login` | Kirish |
| `/view/[id]` | Ochiq hujjat |
| `/document-edit` | Hujjat tahrirlash (Collabora) |

---

## Feature modullari (40 ta)

### Hujjat
`document`, `document-type`, `document-template`, `document-editor`, `attachment`, `pdf-editor`

### Ish jarayoni
`workflow`, `workflow-template`

### Vazifalar
`task`, `task-attachment`, `task-comment`, `task-checklist`, `task-dependency`, `task-time-entry`, `task-label`, `task-watcher`, `task-activity`, `task-category`

### Loyiha
`project`, `project-member`, `project-label`

### Board
`board-column`, `sprint`

### Tashkilot
`department`, `admin` (admin-users, roles, permissions)

### KPI
`task-score-config`, `kpi-reward-tier`, `kpi-reward`, `user-monthly-kpi`

### Integratsiya
`telegram`, `sessions`

### Boshqa
`statistics`, `audit-logs`, `login`, `setting`, `journal`, `view`

---

## API endpointlar (130+)

### Asosiy konfiguratsiya
- **Base URL:** `NEXT_PUBLIC_SERVER_URL` (env)
- **Timeout:** 30s
- **Auth:** Bearer token (Authorization header)
- **Token refresh:** 401/403 da avtomatik

### Auth
```
POST /auth/login
POST /auth/refresh-token
POST /auth/logout
GET  /auth/profile
PATCH /auth/profile
```

### Hujjatlar
```
CRUD  /document
GET   /document/{id}/download
PATCH /document/{id}/pdf-url
```

### Ish jarayoni
```
CRUD  /workflow
CRUD  /workflow-template
CRUD  /workflow-step
POST  /workflow-step/{id}/assign
POST  /workflow-step/{id}/complete
POST  /workflow-step/{id}/reject
POST  /workflow-step/{id}/verify
GET   /workflow-step/calendar/view
```

### Vazifalar
```
CRUD  /task
CRUD  /task-category
CRUD  /task-label
CRUD  /task-comment
CRUD  /task-attachment
CRUD  /task-checklist
CRUD  /task-dependency
CRUD  /task-time-entry
GET   /task-activity
POST  /task-watcher/watch/{taskId}
POST  /task-watcher/unwatch/{taskId}
```

### Loyiha
```
CRUD  /project
CRUD  /project-member
CRUD  /project-label
```

### Board
```
CRUD  /board-column
POST  /board-column/reorder
CRUD  /sprint
POST  /sprint/{id}/start
POST  /sprint/{id}/complete
```

### KPI
```
CRUD  /task-score-config
GET   /task-score-config/priority/{level}
CRUD  /kpi-reward-tier
GET   /user-monthly-kpi
GET   /user-monthly-kpi/me
GET   /user-monthly-kpi/history
GET   /user-monthly-kpi/leaderboard
GET   /user-monthly-kpi/task-scores
POST  /user-monthly-kpi/finalize
GET   /kpi-reward
GET   /kpi-reward/my
GET   /kpi-reward/pending
POST  /kpi-reward/{id}/approve
POST  /kpi-reward/{id}/pay
POST  /kpi-reward/{id}/reject
POST  /kpi-reward/bulk-approve
```

### Tashkilot
```
CRUD  /department
CRUD  /user
CRUD  /role
CRUD  /permission
POST  /user/{id}/telegram/link
DELETE /user/{id}/telegram
```

### Bildirishnomalar
```
GET   /notifications
GET   /notifications/unread-count
POST  /notifications/{id}/read
POST  /notifications/read-all
DELETE /notifications/{id}
GET   /notifications/online-users
```

### Fayllar
```
CRUD  /attachment
POST  /attachment/repair-filenames
```

### Boshqa
```
GET   /audit-log
GET   /sessions
POST  /sessions/revoke-all
GET   /analytics/dashboard
GET   /analytics/documents
GET   /analytics/workflows
GET   /analytics/users
POST  /wopi/token
```

---

## Asosiy data modellari

### Task (Vazifa)
```typescript
{
  id, title, description, taskNumber,
  projectId, project: { id, name, key, color },
  priority: LOW | MEDIUM | HIGH | URGENT | CRITICAL,
  score: number | null,
  assignees: [{ user: { id, fullname, avatarUrl } }],
  parentTaskId, subtasks,
  boardColumnId, boardColumn: { id, name, color, isClosed },
  startDate, dueDate, estimatedHours,
  completedAt, coverImageUrl,
  _count: { subtasks, comments, attachments, watchers }
}
```

### Project (Loyiha)
```typescript
{
  id, name, key, description,
  status: PLANNING | ACTIVE | ON_HOLD | COMPLETED | CANCELLED | ARCHIVED,
  departmentId, department,
  startDate, endDate, budget, color, icon,
  penaltyPerDay: number,
  _count: { tasks, members }
}
```

### Board Column (Kanban ustuni)
```typescript
{
  id, projectId, name, color, position,
  wipLimit, isClosed, isDefault
}
```
Default ustunlar (yangi loyihada avtomatik):
- **Yangi** `#3B82F6` (default, ochiq)
- **Bajarilmoqda** `#F59E0B` (ochiq)
- **Tekshiruvda** `#8B5CF6` (ochiq)
- **Yakunlangan** `#10B981` (yopiq — completedAt set bo'ladi)

### UserMonthlyKpi
```typescript
{
  id, userId, user, departmentId, department,
  year, month,
  totalBaseScore, totalEarnedScore, totalPenalty,
  tasksCompleted, tasksOnTime, tasksLate,
  finalScore, isFullScore, consecutiveFullMonths,
  isFinalized, scoreBreakdown
}
```

### KpiReward
```typescript
{
  id, userId, user, rewardTierId,
  rewardTier: { id, name, color },
  year, month, finalScore,
  rewardAmount, rewardBhm, isPenalty,
  status: PENDING | APPROVED | PAID | REJECTED,
  approvedBy, approvedAt
}
```

### Notification
```typescript
{
  id, type, title, message,
  metadata: { taskId?, taskNumber?, projectKey?, workflowId?, documentId? },
  isRead, createdAt
}
// Types: workflow_step_assigned, task_assigned, document_approved, ...
```

---

## Arxitektura patternlari

### CRUD Factory
Har bir feature uchun yagona pattern:
```
type → schema → service (CRUD factory) → hook (CRUD factory) → component → page
```

```typescript
// Service
const taskService = createCRUDService<Task, CreatePayload, UpdatePayload, QueryParams, ListResponse>(
  endpoints.task, { transformParams: (p) => ({ ... }) }
);

// Hooks
const { useGetAll, useGetById, useCreate, useUpdate, useDelete } = createCRUDHooks(
  taskService, "tasks", { successMessages: { create: "Yaratildi" } }
);
```

### Token Refresh
1. 401/403 kelsa → refresh queue'ga qo'shiladi
2. Bitta refresh so'rovi yuboriladi
3. Yangi token bilan barcha kutayotgan so'rovlar qayta yuboriladi
4. Refresh xato bo'lsa → logout

### Kanban Board flow
1. `GET /board-column?projectId=xxx` → ustunlar
2. `GET /task?projectId=xxx` → vazifalar
3. Drag-drop → `PATCH /task/:id { boardColumnId }` + subtask cascade
4. "Yakunlangan" ustun (`isClosed=true`) → backend `completedAt` set qiladi

### KPI flow
1. Vazifa "Yakunlangan" ga o'tadi → backend ball hisoblanadi
2. `score - (daysLate * penaltyPerDay)` = `earnedScore`
3. Oylik jami → `user-monthly-kpi` yozuvi
4. Finalize → `kpi-reward` yaratiladi (reward tier asosida)
5. Approve → Pay

---

## Autentifikatsiya

### NextAuth sessiya
```typescript
Session {
  user: { id, username, fullname, bio },
  accessToken, refreshToken
}
```

### Ruxsat tizimi
- Format: `"resurs:amal"` (masalan `document:list`, `user:create`)
- `usePermission()` hook bilan tekshiriladi
- Sidebar menyu permission asosida filtrlanadi

---

## Real-time (WebSocket)

### Socket.IO
- **Namespace:** `/notifications`
- **Events:** `notification`, `online-users`
- **Foydalanish:** Sidebar'da faol workflow badge, header'da bildirishnomalar

### Notification turlari
```
workflow_step_assigned   — Jarayon bosqichi tayinlandi
workflow_step_completed  — Jarayon bosqichi yakunlandi
workflow_step_rejected   — Jarayon bosqichi rad etildi
workflow_completed       — Jarayon yakunlandi
task_assigned           — Vazifa tayinlandi
document_approved       — Hujjat tasdiqlandi
document_rejected       — Hujjat rad etildi
```

---

## Til va lokalizatsiya

- **Asosiy til:** O'zbek (uz-UZ)
- **Sana formati:** `d-MMM yyyy` (masalan: `2-apr 2026`)
- **Vaqt:** `date-fns` + `uz` locale
- **Pul formati:** `toLocaleString("uz-UZ")` + "so'm"

---

## Ishga tushirish

```bash
# O'rnatish
npm install

# Development
npm run dev        # http://localhost:3000

# Production
npm run build
npm run start

# Test
npm run test
npm run lint

# Yangi feature scaffolding
npm run generate
```

### Environment variables
```env
NEXT_PUBLIC_SERVER_URL=https://sandbox-back.nordicuniversity.org/api/v1
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```
