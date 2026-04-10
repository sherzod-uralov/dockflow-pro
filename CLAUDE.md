sdfdsfds# DockFlow Pro — Project Documentation

## Overview

**DockFlow Pro** — a document workflow, task management, and process automation platform.

- **Framework:** Next.js 16 (App Router) + Turbopack
- **Language:** TypeScript 5 (strict mode)
- **UI:** Mantine 8 + Radix UI + Shadcn/UI + Tailwind CSS 4
- **State:** TanStack React Query 3 (server) + Zustand (client)
- **Forms:** React Hook Form + Zod
- **Auth:** NextAuth.js 4
- **HTTP:** Axios (with interceptors)
- **Real-time:** Socket.IO Client
- **Charts:** Recharts, FullCalendar
- **DnD:** DND Kit
- **PDF:** DocVerse PDF SDK (@docverse-pdf)
- **Testing:** Jest + Playwright + axe-core

---

## Design Philosophy

### Core Colors

| Purpose | Color | HEX |
|---------|-------|-----|
| **Primary** | Dark blue | `#1e3a5f` |
| **Primary hover** | Darker | `#162d4a` |
| **Background** | Light gray | `#f8f9fa` |
| **Border** | Gray | `#e9ecef` |
| **Text primary** | Black | `#212529` |
| **Text secondary** | Gray | `#495057` |
| **Text dimmed** | Light gray | `#868e96` |
| **Success** | Green | `#2ecc71` |
| **Warning** | Yellow | `#f39c12` |
| **Error** | Red | `#e74c3c` |
| **Info** | Blue | `#3498db` |

### Color Rules
- **Buttons:** `backgroundColor: "#1e3a5f"` — all primary buttons
- **Badge:** `variant="light"` — colored background + colored text
- **Border:** `1px solid #e9ecef` — all paper/card borders
- **Hover:** `backgroundColor: "#f8f9fa"` — default hover state
- **Active:** `backgroundColor: "#e7f5ff"` — selected element

### 4 Themes
1. **Ocean** (default) — blue / dark blue
2. **Sunset** — warm dark yellow
3. **Forest** — green / forest
4. **Lavender** — purple / ink

### Typography
- Font: Geist
- Header: `fw={600-700}`, `size="lg"`
- Body: `size="sm"`, `c="#495057"`
- Label: `size="xs"`, `fw={500}`, `c="#868e96"`, `tt="uppercase"`
- Dimmed: `c="dimmed"`

### Component Rules
- `radius="sm"` — all inputs, buttons, papers
- `size="sm"` — all inputs, selects, buttons (inside forms)
- `variant="subtle"` — action buttons
- `variant="light"` — badges
- `withBorder` + `style={{ borderColor: "#e9ecef" }}` — papers

---

## UI Libraries — When to Use What

We use three UI libraries with clear responsibilities. Do NOT mix them arbitrarily.

### Shadcn/UI — default choice for base primitives
Use for: Button, Input, Textarea, Select, Checkbox, Radio, Switch, Label,
Dialog, Sheet, Popover, Tooltip, Dropdown, Badge, Card, Separator, Skeleton,
Tabs, Accordion, Alert, Toast (Sonner)

- Always prefer Shadcn first for simple interactive elements
- Components live in `components/ui/` — never import from `shadcn` directly
- Customize via Tailwind classes, not by editing the component source

### Mantine 8 — complex and data-heavy components
Use for: DatePicker, DateRangePicker, DataTable, MultiSelect with search,
RichTextEditor, FileInput, Notifications, Spotlight (command palette),
Charts, Pagination with state, NumberInput with formatting

- Use Mantine when Shadcn doesn't have the component or would require
  significant custom logic to replicate the behavior
- Wrap Mantine components in `components/ui/` with our own props interface
  to avoid leaking Mantine types into feature code
- Example: `components/ui/date-picker.tsx` wraps `@mantine/dates`

### Radix UI — escape hatch only
Use for: cases where neither Shadcn nor Mantine has what we need,
or when we need full control over a headless primitive

- Do NOT use Radix directly if Shadcn already wraps that primitive
  (Shadcn is built on Radix — use the Shadcn version)
- Always wrap in `components/ui/` before using in features

### Decision Flow
```
Shadcn has it?              → Use Shadcn
Complex / data component?   → Use Mantine
Need full headless control? → Use Radix
Still not enough?           → Build custom, document why
```

---

## Project Structure

```
app/                          # Next.js pages
├── dashboard/
│   ├── document/             # Documents
│   ├── workflow/             # Workflows
│   ├── project/[id]/tasks/   # Project tasks
│   ├── task/                 # All tasks
│   ├── department/           # Departments
│   ├── admin/                # Admin (users, roles, permissions)
│   ├── kpi/                  # KPI (score-config, reward-tiers, monthly-kpi, rewards)
│   ├── audit-log/            # Audit log
│   ├── analytics/            # Analytics
│   └── setting/              # Settings
├── login/
├── view/[id]/                # Public document view
└── document-edit/            # Document editing (WOPI)

features/                     # Module architecture
└── [feature]/
    ├── type/                 # TypeScript types
    ├── schema/               # Zod validation schemas
    ├── service/              # API service (CRUD)
    ├── hook/                 # React Query hooks
    ├── component/            # UI components
    ├── page/                 # Page components
    └── index.ts              # Public exports

components/shared/
├── ui/                       # custom-table, custom-modal, custom-file-upload
└── layout/                   # sidebar, header, document.management.layout

lib/
├── crud-service.ts           # CRUD service factory
├── crud-hooks.ts             # CRUD hooks factory
└── socket/                   # WebSocket management

api/
├── axios.instance.ts         # Axios config + token refresh
└── axios.endpoints.ts        # All API endpoints
```

---

## Pages (30 total)

### Document Management
| Route | Page |
|-------|------|
| `/dashboard` | Home (statistics) |
| `/dashboard/document` | Document list (split layout) |
| `/dashboard/document/[id]` | Document detail |
| `/dashboard/document-type` | Document types |
| `/dashboard/document-template` | Document templates |
| `/dashboard/journal` | Journals |
| `/dashboard/journal/[id]` | Journal detail |

### Workflow
| Route | Page |
|-------|------|
| `/dashboard/workflow` | Workflow list |
| `/dashboard/workflow/[id]` | Workflow detail |
| `/dashboard/workflow-template` | Workflow templates |
| `/dashboard/workflow-calendar` | Workflow calendar |

### Task Management
| Route | Page |
|-------|------|
| `/dashboard/task` | All tasks (kanban / list / calendar) |
| `/dashboard/task/[id]` | Task detail |
| `/dashboard/project` | Projects |
| `/dashboard/project/[id]/tasks` | Project tasks (kanban) |

### Organization
| Route | Page |
|-------|------|
| `/dashboard/department` | Departments (table + hierarchy) |
| `/dashboard/admin/users` | Users |
| `/dashboard/admin/roles` | Roles |
| `/dashboard/admin/permissions` | Permissions |

### KPI & Rewards
| Route | Page |
|-------|------|
| `/dashboard/kpi/task-score-config` | Score settings |
| `/dashboard/kpi/reward-tiers` | Reward tiers |
| `/dashboard/kpi/monthly-kpi` | Monthly KPI results |
| `/dashboard/kpi/rewards` | Rewards management |

### Other
| Route | Page |
|-------|------|
| `/dashboard/audit-log` | Audit log |
| `/dashboard/analytics` | Analytics |
| `/dashboard/setting/profile` | Profile settings |
| `/dashboard/setting/system-setting` | System settings |
| `/login` | Login |
| `/view/[id]` | Public document |
| `/document-edit` | Document editing (Collabora) |

---

## Feature Modules (40 total)

### Documents
`document`, `document-type`, `document-template`, `document-editor`, `attachment`, `pdf-editor`

### Workflow
`workflow`, `workflow-template`

### Tasks
`task`, `task-attachment`, `task-comment`, `task-checklist`, `task-dependency`,
`task-time-entry`, `task-label`, `task-watcher`, `task-activity`, `task-category`

### Projects
`project`, `project-member`, `project-label`

### Board
`board-column`, `sprint`

### Organization
`department`, `admin` (admin-users, roles, permissions)

### KPI
`task-score-config`, `kpi-reward-tier`, `kpi-reward`, `user-monthly-kpi`

### Integrations
`telegram`, `sessions`

### Other
`statistics`, `audit-logs`, `login`, `setting`, `journal`, `view`

---

## API Endpoints (130+)

### Base Configuration
- **Base URL:** `NEXT_PUBLIC_SERVER_URL` (env)
- **Timeout:** 30s
- **Auth:** Bearer token (Authorization header)
- **Token refresh:** Automatic on 401/403

### Auth
```
POST  /auth/login
POST  /auth/refresh-token
POST  /auth/logout
GET   /auth/profile
PATCH /auth/profile
```

### Documents
```
CRUD  /document
GET   /document/{id}/download
PATCH /document/{id}/pdf-url
```

### Workflow
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

### Tasks
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

### Projects
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

### Organization
```
CRUD  /department
CRUD  /user
CRUD  /role
CRUD  /permission
POST  /user/{id}/telegram/link
DELETE /user/{id}/telegram
```

### Notifications
```
GET   /notifications
GET   /notifications/unread-count
POST  /notifications/{id}/read
POST  /notifications/read-all
DELETE /notifications/{id}
GET   /notifications/online-users
```

### Files
```
CRUD  /attachment
POST  /attachment/repair-filenames
```

### Other
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

## Core Data Models

### Task
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

### Project
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

### Board Column
```typescript
{
  id, projectId, name, color, position,
  wipLimit, isClosed, isDefault
}
```
Default columns (auto-created for new projects):
- **New** `#3B82F6` (default, open)
- **In Progress** `#F59E0B` (open)
- **In Review** `#8B5CF6` (open)
- **Done** `#10B981` (closed — backend sets `completedAt`)

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

## Architecture Patterns

### CRUD Factory
Single pattern for every feature:
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
  taskService, "tasks", { successMessages: { create: "Created" } }
);
```

### Token Refresh Flow
1. 401/403 received → request added to refresh queue
2. Single refresh request sent
3. All queued requests retried with new token
4. Refresh fails → logout

### Kanban Board Flow
1. `GET /board-column?projectId=xxx` → fetch columns
2. `GET /task?projectId=xxx` → fetch tasks
3. Drag-drop → `PATCH /task/:id { boardColumnId }` + subtask cascade
4. "Done" column (`isClosed=true`) → backend sets `completedAt`

### KPI Flow
1. Task moved to "Done" → backend calculates score
2. `score - (daysLate * penaltyPerDay)` = `earnedScore`
3. Monthly total → `user-monthly-kpi` record created
4. Finalize → `kpi-reward` created (based on reward tier)
5. Approve → Pay

---

## Authentication

### NextAuth Session
```typescript
Session {
  user: { id, username, fullname, bio },
  accessToken, refreshToken
}
```

### Permission System
- Format: `"resource:action"` (e.g. `document:list`, `user:create`)
- Checked via `usePermission()` hook
- Sidebar menu filtered based on permissions

---

## Real-time (WebSocket)

### Socket.IO
- **Namespace:** `/notifications`
- **Events:** `notification`, `online-users`
- **Usage:** Active workflow badge in sidebar, notification bell in header

### Notification Types
```
workflow_step_assigned   — Workflow step assigned to user
workflow_step_completed  — Workflow step completed
workflow_step_rejected   — Workflow step rejected
workflow_completed       — Entire workflow completed
task_assigned            — Task assigned to user
document_approved        — Document approved
document_rejected        — Document rejected
```

---

## Language & Localization

- **Primary language:** Uzbek (uz-UZ)
- **Date format:** `d-MMM yyyy` (e.g. `2 Apr 2026`)
- **Time:** `date-fns` + `uz` locale
- **Currency format:** `toLocaleString("uz-UZ")` + "so'm"

---

## Getting Started

```bash
# Install
npm install

# Development
npm run dev        # http://localhost:3000

# Production
npm run build
npm run start

# Testing
npm run test
npm run lint

# New feature scaffolding
npm run generate
```

### Environment Variables
```env
NEXT_PUBLIC_SERVER_URL=https://sandbox-back.nordicuniversity.org/api/v1
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
```