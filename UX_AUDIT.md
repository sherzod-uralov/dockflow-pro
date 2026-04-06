# DockFlow Pro — UX Audit & Improvement Plan

**Sana:** 2026-04-02
**Audit turi:** To'liq platforma tahlili (Frontend + Backend API)
**Sahifalar soni:** 29 ta sahifa, 50+ komponent

---

## 1. UMUMIY BAHO

| Mezon | Baho (1-10) | Izoh |
|-------|:-----------:|------|
| Funksionallik | 8 | Barcha asosiy CRUD ishlaydi |
| UX/UI sifati | 5 | Loading, error, empty state yetishmaydi |
| Performance | 6 | 1000 ta task yuklanadi, sort backend'da yo'q |
| Accessibility | 3 | ARIA label, keyboard nav yetarli emas |
| Mobile | 4 | Jadvallar tor ekranda buziladi |
| Real-time | 7 | WebSocket bor, lekin cheklangan |
| Error handling | 4 | Generic xabarlar, retry yo'q |

---

## 2. SAHIFALAR BO'YICHA TAHLIL

### 2.1 Dashboard (`/dashboard`)

**Hozirgi holat:** Statistika sahifasi — hujjatlar, workflow, foydalanuvchilar analytics.

**Muammolar:**
- Task manager statistikasi yo'q (bajarilgan/muddati o'tgan tasklar)
- "Bugun" ko'rinishi yo'q — foydalanuvchi nimadan boshlashini bilmaydi
- KPI xulosa ko'rinmaydi
- Har bir chart uchun alohida loading yo'q

**Taklif — "Bugungi kun" dashboard:**
- Menga biriktirilgan vazifalar (top 5)
- Bugun/3 kun ichida muddati tugaydiganlar
- Oylik KPI progress (bar chart)
- Jamoa faoliyati (oxirgi 24 soat)
- Muddati o'tgan vazifalar soni (qizil badge)

**Backend kerak:**
- `GET /task?assigneeId=me&dueBefore=2026-04-05` — date range filter
- `GET /analytics/dashboard` da `overdueTasks`, `myTasks` qo'shish

---

### 2.2 Hujjatlar (`/dashboard/document`)

**Hozirgi holat:** Ikki panelli layout — chap ro'yxat, o'ng tafsilot.

**Muammolar:**
- Bo'sh holat — hech narsa ko'rsatilmaydi (blank sahifa)
- Bulk delete yo'q
- Version history ko'rinmaydi
- Hujjat o'rtasida aloqa (related documents) yo'q
- Export funksiyasi yo'q

**Taklif:**
- Empty state: illustratsiya + "Birinchi hujjatni yarating" CTA
- Hujjat kartochkasida: versiya raqami, oxirgi o'zgartirgan shaxs
- Filter saqlash (saved filters)
- CSV/PDF export

**Backend kerak:**
- `GET /document?sortBy=updatedAt` — sorting
- Bulk delete endpoint

---

### 2.3 Workflow (`/dashboard/workflow`)

**Hozirgi holat:** Tab'li ro'yxat (Active, Completed, Cancelled), progress bar, create from template.

**Muammolar:**
- Workflow step'larda comment yo'q (faqat reject reason)
- Step reassign ko'rinmaydi
- Workflow analytics yo'q (o'rtacha bajarilish vaqti)
- Overdue warning faqat active workflow'larda
- Bulk action yo'q

**Taklif:**
- Workflow card'da: qolgan vaqt (deadline - today), joriy step assignee
- Step-level comment qo'shish
- Workflow template usage statistics
- Auto-reminder sozlamalari

**Backend kerak:**
- `GET /analytics/workflows` da `averageCompletionTimeByTemplate` qo'shish
- Workflow step comment endpoint (agar yo'q bo'lsa)

---

### 2.4 Workflow Taqvim (`/dashboard/workflow-calendar`)

**Hozirgi holat:** FullCalendar — workflow step'lar sana bo'yicha.

**Muammolar:**
- Drag-to-reschedule yo'q
- Task count per day ko'rinmaydi
- Filter faqat status bo'yicha — assignee filter yo'q

**Taklif:**
- Assignee filter qo'shish
- Kunlik task soni badge
- Click → drawer ochilishi (modal emas)

---

### 2.5 Workflow Templates (`/dashboard/workflow-template`)

**Hozirgi holat:** Card ko'rinishidagi template ro'yxat.

**Muammolar:**
- Template preview step'larni ko'rsatmaydi
- Template clone/duplicate yo'q
- Usage count ko'rinmaydi (nechta workflow shu template'dan yaratilgan)

**Taklif:**
- Template card'da: step soni, oxirgi ishlatilgan sana
- "Nusxalash" tugmasi
- Template versioning

**Backend kerak:**
- Template usage count (workflow count per template)

---

### 2.6 Task Manager — Kanban (`/dashboard/project/[id]/tasks`)

**Hozirgi holat:** Drag-drop board, dynamic column'lar, subtask tree.

**Muammolar:**
- "Ustun qo'shish" tugmasi scroll oxirida yashirinadi
- WIP limit backend'da bor, UI'da ko'rsatilmaydi
- Task'ni tezda "Yakunlangan"ga o'tkazish uchun 2 click kerak
- Task card'da column nomi ko'rinmaydi
- Due date warning (yaqin 3 kun) yo'q
- `includeTaskCount=true` backend param ishlatilmaydi
- Bulk select/move yo'q
- Assignee workload ko'rinmaydi

**Taklif:**
- Column header'da WIP limit indicator (5/8 kabi)
- Task card'da: column badge, due warning ranglar (yashil/sariq/qizil)
- Quick-complete checkbox (bitta click)
- Column footer'da "Ustun qo'shish" sticky button
- Swimlane rejimi (assignee bo'yicha guruhlanish)

**Backend kerak:**
- `GET /board-column?includeTaskCount=true` — allaqachon bor, frontend ulashi kerak
- `GET /task?sortBy=dueDate&sortOrder=asc` — sorting
- `PATCH /task/bulk` — bulk column move

---

### 2.7 Task Manager — List View

**Hozirgi holat:** Oddiy jadval — nom, loyiha, ustun, muhimlik, mas'ul, sana.

**Muammolar:**
- Sort qilmaydi (column header clickable emas)
- Selection (checkbox) yo'q
- Inline edit yo'q
- Pagination yo'q (1000 ta task birdan yuklanadi)
- Search natijasi highlight qilinmaydi
- Row grouping yo'q

**Taklif:**
- Sortable column headers (dueDate, priority, score, createdAt)
- Checkbox selection + bulk toolbar
- Inline status change (column dropdown)
- Server-side pagination (50 per page)
- Group by: project, assignee, priority

**Backend kerak:**
- `GET /task?sortBy=...&sortOrder=...` — sorting params
- `GET /task?page=1&limit=50` — true pagination

---

### 2.8 Task Manager — Calendar View

**Hozirgi holat:** FullCalendar — tasklar dueDate bo'yicha.

**Muammolar:**
- Faqat dueDate ko'rsatiladi, startDate yo'q (duration bar yo'q)
- Task yaratish faqat sana bosganda (discoverable emas)
- Priority ranglar legend yo'q

**Taklif:**
- Start-to-due date range bar (Gantt-like)
- Floating "+" tugma
- Priority legend

---

### 2.9 Task Detail Drawer

**Hozirgi holat:** O'ng panelda ochiladi — details, comments, attachments, checklist, time, activity tab'lari.

**Muammolar:**
- Tab'lar ko'p — 6 ta tab overwhelming
- Estimated vs actual hours taqqoslanmaydi
- Checklist progress bar yo'q
- Subtask tree ko'rinishi cheklangan
- Fullscreen tugma yashirin
- Save confirmation yo'q (silent save)

**Taklif:**
- Tab'larni 3 taga kamaytirish: Tafsilot, Faoliyat, Fayllar
- Time tracking: progress bar (estimated vs logged)
- Checklist: "3/5 bajarildi" progress
- Subtask: progress percentage

---

### 2.10 Projects (`/dashboard/project`)

**Hozirgi holat:** Grid/table ko'rinish — nom, key, status, rang.

**Muammolar:**
- Progress bar soxta (status-based, task-based emas)
- Jamoa a'zolari ko'rinmaydi
- Task soni ko'rinmaydi
- Muddati o'tgan task soni ko'rinmaydi
- Favorite/pin yo'q
- Recently viewed yo'q

**Taklif:**
- Haqiqiy progress: `completedTasks / totalTasks * 100`
- Card'da: avatar stack (jamoa), task soni, overdue count
- "Yulduzcha" bilan sevimli loyihalar
- Sidebar'da: oxirgi 3 ta ko'rilgan loyiha

**Backend kerak:**
- `GET /project/:id/stats` — `{ totalTasks, completedTasks, overdueCount, memberCount, completionPercentage }`

---

### 2.11 Bo'limlar (`/dashboard/department`)

**Hozirgi holat:** Jadval + Ierarxiya grafik (tree view).

**Muammolar:**
- Statistika yo'q (nechta xodim, nechta hujjat)
- Ierarxiya drag-and-drop ishlaydi, lekin sekin
- Bo'lim tarkibi (xodimlar ro'yxati) alohida sahifada

**Taklif:**
- Department card'da: xodim soni, hujjat soni, faol workflow soni
- Inline xodim ro'yxati (expandable row)

**Backend kerak:**
- `GET /department/:id/stats` — `{ userCount, documentCount, activeWorkflowCount }`

---

### 2.12 Admin — Foydalanuvchilar (`/dashboard/admin/users`)

**Hozirgi holat:** Jadval — ism, username, rol, bo'lim, oxirgi kirish.

**Muammolar:**
- Status (faol/nofaol) aniq ko'rinmaydi
- Telegram ulangan/ulanmagan ko'rinmaydi
- Bulk rol tayinlash yo'q
- Password reset admin tomonidan yo'q
- Foydalanuvchi faoliyati (activity) ko'rinmaydi

**Taklif:**
- Status badge: faol (yashil), nofaol (kulrang)
- Telegram icon: ulangan (ko'k), ulanmagan (kulrang)
- "Parolni tiklash" tugmasi
- Oxirgi faoliyat: "2 soat oldin"

---

### 2.13 Admin — Rollar (`/dashboard/admin/roles`)

**Hozirgi holat:** Jadval — rol nomi, tavsif, ruxsatlar soni, foydalanuvchilar soni.

**Muammolar:**
- Permission oldindan ko'rish (preview) yo'q
- Rol clone qilish yo'q
- Permission grouped ko'rinmaydi (modul bo'yicha)

**Taklif:**
- Permission tree (modul → permission) ko'rinishi
- "Nusxalash" tugmasi
- Impact analysis: "Bu rolni o'chirsangiz 5 ta foydalanuvchi ta'sirlanadi"

---

### 2.14 Admin — Ruxsatlar (`/dashboard/admin/permissions`)

**Hozirgi holat:** Jadval — nom, tavsif, key, modul.

**Muammolar:**
- Qaysi rol'da ishlatilganini ko'rsatmaydi
- Modul bo'yicha guruhlash cheklangan

**Taklif:**
- "Ishlatilgan rol'lar" ustuni
- Modul bo'yicha accordion guruhlash

---

### 2.15 Audit Log (`/dashboard/audit-log`)

**Hozirgi holat:** Jadval — entity, action, user, vaqt, IP.

**Muammolar:**
- Entity type filtri yo'q
- Action type filtri yo'q
- Sana oralig'i filtri yo'q
- Export yo'q

**Taklif:**
- Filter: entity type dropdown, action type dropdown, date range picker
- CSV export
- Grafiklar: kunlik action soni, eng faol foydalanuvchilar

**Backend:**
- `GET /audit-log` da `entity`, `action`, `startDate`, `endDate` params **allaqachon bor** — frontend ishlatmaydi!

---

### 2.16 Jurnallar (`/dashboard/journal`)

**Hozirgi holat:** Jadval — nom, prefiks, format, bo'lim, mas'ul.

**Muammolar:**
- Hujjat soni ko'rinmaydi
- Format tushuntirmasi yo'q (foydalanuvchi "{YYYY}-{MM}-{###}" ni tushinmaydi)

**Taklif:**
- "Hujjatlar soni" ustuni
- Format preview: "2026-04-001" kabi namuna

---

### 2.17 Hujjat turlari (`/dashboard/document-type`)

**Hozirgi holat:** Oddiy jadval — nom, tavsif.

**Muammolar:**
- Hujjat soni ko'rinmaydi
- Bog'liq template'lar ko'rinmaydi

**Taklif:**
- "Hujjatlar" va "Shablonlar" soni ustunlari

---

### 2.18 Hujjat shablonlari (`/dashboard/document-template`)

**Hozirgi holat:** Jadval — nom, tavsif, tur, fayl nomi, holat.

**Muammolar:**
- Preview/download yo'q
- Clone qilish yo'q
- Oxirgi ishlatilgan sana yo'q

**Taklif:**
- "Yuklab olish" tugmasi
- "Nusxalash" tugmasi
- "Oxirgi ishlatilgan" ustuni

---

### 2.19 KPI — Ball sozlamalari (`/dashboard/kpi/task-score-config`)

**Hozirgi holat:** CRUD jadval — prioritet, ball, jarima, kunlar.

**Muammolar:**
- Ball hisoblash formulasi tushuntirilmaydi
- O'zgartirish ta'siri ko'rinmaydi (nechta task ta'sirlanadi)

**Taklif:**
- Formulani vizual ko'rsatish: `Yakuniy ball = Asosiy ball - (Kechikkan kunlar x Kunlik jarima)`
- "Preview" tugmasi — masalan "30 ball, 3 kun kechiksa = 15 ball"

---

### 2.20 KPI — Mukofot darajalari (`/dashboard/kpi/reward-tiers`)

**Hozirgi holat:** CRUD jadval.

**Muammolar:**
- Daraja vizualizatsiyasi yo'q (qaysi ball oralig'ida qaysi mukofot)
- Overlap tekshiruvi yo'q

**Taklif:**
- Rangli bar chart: 0-50 (qizil), 51-100 (sariq), 101+ (yashil)
- Overlap warning agar ball oralig'i kesishsa

---

### 2.21 KPI — Oylik natijalar (`/dashboard/kpi/monthly-kpi`)

**Hozirgi holat:** Jadval + Leaderboard tab'lari.

**Muammolar:**
- Trend grafik yo'q (oylar bo'yicha ball o'zgarishi)
- Bo'lim filtri ishlatilmaydi (API'da bor)
- "Mening KPI'm" sahifasi yo'q
- Export yo'q

**Taklif:**
- Line chart: oxirgi 6 oy trend
- Bo'lim dropdown filtri
- "Mening natijam" tab
- PDF export

**Backend:**
- `GET /user-monthly-kpi/history` — **allaqachon bor**, frontend ishlatmaydi
- `GET /user-monthly-kpi/me` — **allaqachon bor**, frontend ishlatmaydi
- `departmentId` filter — **allaqachon bor**, frontend ishlatmaydi

---

### 2.22 KPI — Mukofotlar (`/dashboard/kpi/rewards`)

**Hozirgi holat:** Jadval + Mening mukofotlarim tab.

**Muammolar:**
- To'lov tarixi yo'q
- Mukofot hisobot yo'q (oylik jami)
- Rad etilgan mukofotga e'tiroz bildirish yo'q

**Taklif:**
- Oylik jami: "Aprel 2026 — 15,000,000 so'm (4 ta mukofot)"
- To'lov tarixi timeline
- CSV export (buxgalteriya uchun)

---

### 2.23 Sozlamalar — Profil (`/dashboard/setting/profile`)

**Hozirgi holat:** 3 tab — umumiy, xavfsizlik, tizim.

**Muammolar:**
- Parol kuchliligi ko'rsatilmaydi
- 2FA yo'q
- Session boshqaruvi alohida sahifada
- Telegram ulash bu yerda ko'rinmaydi

**Taklif:**
- Parol strength meter
- Session ro'yxati shu yerda
- Telegram connect/disconnect tugmasi

---

### 2.24 Sozlamalar — Tizim (`/dashboard/setting/system-setting`)

**Hozirgi holat:** Keng accessibility sozlamalari — theme, font, colorblind mode.

**Muammolar:**
- Sozlamalar faqat localStorage (server sync yo'q)
- Boshqa qurilmada sozlamalar yo'qoladi

**Taklif:**
- Server-side sync (user preferences endpoint)

---

### 2.25 Login sahifasi

**Hozirgi holat:** Username + password.

**Muammolar:**
- "Parolni unutdim" yo'q
- "Meni eslab qol" yo'q
- Loading animation yo'q
- Xato xabari generic

**Taklif:**
- Password reset link
- Remember me checkbox
- Animated loading state
- Aniq xato: "Username noto'g'ri" vs "Parol noto'g'ri"

---

### 2.26 Public Document View (`/view/[id]`)

**Hozirgi holat:** Hujjat tekshiruv sahifasi — workflow timeline bilan.

**Muammolar:**
- Link muddati (expiration) yo'q
- Kim ko'rganini tracking qilmaydi
- QR code yo'q

**Taklif:**
- QR code generatsiya (hujjat sahifasidan)
- Ko'rishlar soni
- Link muddati sozlamasi

---

## 3. UMUMIY PLATFORMAGA TEGISHLI MUAMMOLAR

### 3.1 Loading States
| Sahifa | Loading holati | Kerak |
|--------|:---:|:---:|
| Dashboard charts | Yo'q | Har bir chart uchun skeleton |
| Document list | Yo'q | Skeleton rows |
| Task kanban | Bor | OK |
| Workflow list | Bor (skeleton) | OK |
| KPI jadval | Bor | OK |
| Audit log | Yo'q | Skeleton rows |
| Settings | Yo'q | Spinner kerak |

### 3.2 Empty States
| Sahifa | Empty state | Kerak |
|--------|:-----------:|:---:|
| Documents | Blank sahifa | Illustratsiya + CTA |
| Tasks (list) | "Topilmadi" text | Illustratsiya + CTA |
| Tasks (kanban) | "Vazifalar yo'q" har ustunda | OK |
| Projects | "Topilmadi" | Illustratsiya + CTA |
| Workflows | "Topilmadi" | Illustratsiya + CTA |
| KPI | "Topilmadi" | Illustratsiya |
| Audit log | Yo'q | "Faoliyat yo'q" xabar |

### 3.3 Error Handling
- API xatolari: generic toast — aniq xabar kerak
- 401 (token expired): faqat login'ga redirect — "Sessiya muddati tugadi" xabar kerak
- 403 (permission denied): hech narsa — "Ruxsat yo'q" sahifa kerak
- 500 (server error): generic — "Tizim xatosi, qayta urinib ko'ring" + retry tugma

### 3.4 Sana Formatlari (Inconsistent)
| Sahifa | Hozir | Standart |
|--------|-------|----------|
| Task card | "10 mart" | `10-mar 2026` |
| Workflow | "01.04.2026" | `1-apr 2026` |
| Audit log | "01.04.2026 12:00" | `1-apr 2026, 12:00` |
| KPI | "Aprel 2026" | OK |
| Document | locale-dependent | `1-apr 2026` |

**Taklif:** Barcha sahifalarda yagona `formatDate()` utility ishlatish.

### 3.5 Keyboard Shortcuts (yo'q)
| Shortcut | Amal |
|----------|------|
| `/` yoki `Ctrl+K` | Global search focus |
| `C` | Yangi yaratish (context-dependent) |
| `Esc` | Modal/drawer yopish |
| `?` | Shortcut guide |

---

## 4. BACKEND API — ISHLATILMAYOTGAN IMKONIYATLAR

Bu API paramlar/endpointlar **allaqachon mavjud**, lekin frontend hech birini ishlatmaydi:

| # | API | Param | Frontend holati |
|---|-----|-------|-----------------|
| 1 | `GET /audit-log` | `entity`, `action`, `startDate`, `endDate`, `performedByUserId` | Hech biri ishlatilmaydi — faqat `search` |
| 2 | `GET /board-column` | `includeTaskCount` | Ishlatilmaydi |
| 3 | `GET /user-monthly-kpi/history` | `userId`, `limit` | Sahifa yo'q |
| 4 | `GET /user-monthly-kpi/me` | `year`, `month` | Sahifa yo'q |
| 5 | `GET /user-monthly-kpi/leaderboard` | `departmentId` | Ishlatilmaydi |
| 6 | `GET /task-time-entry` | `dateFrom`, `dateTo`, `isBillable` | Ishlatilmaydi |
| 7 | `GET /task-activity` | `action`, `startDate`, `endDate` | Ishlatilmaydi |
| 8 | `GET /task-label` | butun endpoint | Hech qayerda ko'rsatilmaydi |
| 9 | `GET /project-member` | `role` filter | Ishlatilmaydi |
| 10 | `GET /task-watcher` | `userId` filter | Ishlatilmaydi |
| 11 | `GET /task-dependency` | `dependsOnTaskId` | Faqat drawer'da minimal |
| 12 | `GET /notifications/online-users` | butun endpoint | Socket orqali bor, REST ishlatilmaydi |
| 13 | `GET /analytics/*` | `departmentId`, `userId` filtrlari | Ishlatilmaydi |
| 14 | `GET /workflow-step/calendar/view` | `status` filter | Qisman |

---

## 5. BACKEND'GA QO'SHILISHI KERAK BO'LGAN YANGI APILAR

| # | Endpoint | Nima uchun |
|---|----------|-----------|
| 1 | `GET /task?sortBy=...&sortOrder=...` | List view sorting |
| 2 | `GET /project/:id/stats` | Haqiqiy project progress |
| 3 | `PATCH /task/bulk` | Bulk status/column change |
| 4 | `GET /task/my` yoki `assigneeId=me` | Dashboard "Mening vazifalarim" |
| 5 | `GET /task?dueBefore=...&dueAfter=...` | Date range filter |
| 6 | `GET /analytics/dashboard` +`overdueTasks` | Dashboard overdue count |
| 7 | `GET /analytics/team-workload` | Jamoa yuklamasi |
| 8 | `DELETE /task/bulk` | Bulk delete |
| 9 | `GET /department/:id/stats` | Bo'lim statistikasi |
| 10 | `GET /workflow-template` +`usageCount` | Template ishlatilish soni |

---

## 6. PRIORITETLANGAN ISH REJASI

### Faza 1 — Tezkor yutuklar (1-3 kun)
1. Audit log filtrlari ulash (backend allaqachon qo'llab-quvvatlaydi)
2. `includeTaskCount=true` ni kanban board'ga ulash
3. `user-monthly-kpi/history` va `/me` endpointlarni ulash
4. `departmentId` filtrni KPI leaderboard'ga ulash
5. Sana formatini barcha sahifalarda standartlashtirish
6. Task label'larni card va drawer'da ko'rsatish
7. Empty state'larni barcha sahifalarga qo'shish

### Faza 2 — Asosiy UX yaxshilashlar (1 hafta)
8. Task card'ga quick-complete checkbox
9. List view'ga sort + selection
10. Kanban'da WIP limit ko'rsatish
11. Project card'da haqiqiy progress (backend API kerak)
12. Dashboard "Bugungi kun" bo'limi
13. Loading skeleton barcha sahifalarga
14. Error handling yaxshilash (aniq xabarlar, retry)

### Faza 3 — Professional polish (2 hafta)
15. Keyboard shortcuts
16. Bulk operations (select + move/delete)
17. KPI trend grafik
18. Team workload view
19. Filter persistence (URL params)
20. CSV/PDF export (KPI, audit log, documents)
21. Notification click → task detail ochilishi
22. Date range filter (task, audit log, analytics)

### Faza 4 — Ilg'or funksiyalar (1 oy)
23. Task dependencies vizualizatsiya
24. Gantt chart view
25. Recurring tasks
26. Advanced search (AND/OR logic)
27. Dashboard customization (widget drag-drop)
28. Mobile responsive overhaul
29. Accessibility audit va tuzatish (WCAG 2.1 AA)
30. Performance optimization (virtual scroll, lazy loading)
