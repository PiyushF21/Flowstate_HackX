# InfraLens — Master Implementation Plan

> **AI-Powered Civic Infrastructure Intelligence Platform**
> 11 Agents · 5 Dashboards · 19 Pages · 4 Team Members · Phase-wise Development

---

## Team Assignments

| Member | Role | Scope |
|---|---|---|
| **Stavan** | Backend Lead | Project scaffolding, FastAPI core, data layer, NEXUS orchestrator, SENTINEL middleware, WebSocket manager, COGNOS agent, COMMANDER agent |
| **Yash** | Frontend Lead | Entire frontend — React 19 + Vite 6 + TailwindCSS v4, all 5 dashboards (19 pages), design system, mapcn.dev maps, Framer Motion animations |
| **Piyush** | Backend Agent Dev | VIRA agent, GUARDIAN agent, PRESCIENT agent, FLEET agent, all their routers |
| **Amit** | Backend Agent Dev + Data | LOOP agent, ORACLE agent, FIELD_COPILOT agent, seed data creation, all their routers |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, TailwindCSS v4, Framer Motion, mapcn.dev (MapLibre GL), recharts, lucide-react |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, WebSockets |
| **AI Orchestration** | LangGraph (StateGraph), LangChain, Grok by xAI (grok-3) |
| **Voice** | Web Speech API (STT), Sarvam AI (TTS) |
| **Maps** | mapcn.dev (MapLibre GL — shadcn-style, zero-config, free tiles) |
| **Auth** | Custom AuthContext with role-based routing |
| **Data** | JSON flat-file store, JSON seed data |
| **Real-time** | WebSockets (FastAPI native) |

---

## Complete File Structure

```
hackx2.0_flowstate/
├── README.md
├── idea.md
├── agents.md
├── frontend.md
├── implementationplan.md
├── implementationplan-stavan.md
├── implementationplan-yash.md
├── implementationplan-piyush.md
├── implementationplan-amit.md
├── task-stavan.md
├── task-yash.md
├── task-piyush.md
├── task-amit.md
├── gitc.md
├── prompt.md
│
├── backend/                                    # [STAVAN + PIYUSH + AMIT]
│   ├── main.py                                 # [STAVAN] FastAPI app entrypoint
│   ├── config.py                               # [STAVAN] Environment config + API keys
│   ├── requirements.txt                        # [STAVAN] Python dependencies
│   ├── .env                                    # [STAVAN] API keys (gitignored)
│   ├── .env.example                            # [STAVAN] Template for .env
│   ├── models.py                               # [STAVAN] All Pydantic data models
│   ├── data_store.py                           # [STAVAN] In-memory JSON-backed data store
│   ├── ws_manager.py                           # [STAVAN] WebSocket connection manager
│   │
│   ├── middleware/                              # [STAVAN]
│   │   └── sentinel_middleware.py              # SENTINEL RBAC middleware
│   │
│   ├── agents/                                 # [STAVAN + PIYUSH + AMIT]
│   │   ├── __init__.py
│   │   ├── nexus.py                            # [STAVAN] Master orchestrator (LangGraph)
│   │   ├── cognos.py                           # [STAVAN] Issue detection & classification
│   │   ├── sentinel.py                         # [STAVAN] RBAC agent logic
│   │   ├── commander.py                        # [STAVAN] Task auto-assignment
│   │   ├── vira.py                             # [PIYUSH] Citizen voice/chat
│   │   ├── guardian.py                         # [PIYUSH] Deadline monitor & escalation
│   │   ├── prescient.py                        # [PIYUSH] Reporting & forecasting
│   │   ├── fleet.py                            # [PIYUSH] Cross-MC pattern analytics
│   │   ├── loop.py                             # [AMIT] Completion verification & feedback
│   │   ├── oracle.py                           # [AMIT] Fund & resource allocation
│   │   └── field_copilot.py                    # [AMIT] Worker AI assistant
│   │
│   ├── routers/                                # [STAVAN + PIYUSH + AMIT]
│   │   ├── __init__.py
│   │   ├── nexus_router.py                     # [STAVAN]
│   │   ├── cognos_router.py                    # [STAVAN]
│   │   ├── sentinel_router.py                  # [STAVAN]
│   │   ├── commander_router.py                 # [STAVAN]
│   │   ├── issues_router.py                    # [STAVAN] Generic issue CRUD
│   │   ├── vira_router.py                      # [PIYUSH]
│   │   ├── guardian_router.py                  # [PIYUSH]
│   │   ├── prescient_router.py                 # [PIYUSH]
│   │   ├── fleet_router.py                     # [PIYUSH]
│   │   ├── loop_router.py                      # [AMIT]
│   │   ├── oracle_router.py                    # [AMIT]
│   │   ├── field_copilot_router.py             # [AMIT]
│   │   └── notifications_router.py             # [AMIT]
│   │
│   └── seed_data/                              # [AMIT]
│       ├── issues.json                         # 25-30 sample issues
│       ├── workers.json                        # 15-20 workers
│       ├── mcs.json                            # 5-8 Municipal Corporations
│       └── reports.json                        # 3-5 daily reports
│
└── frontend/                                   # [YASH — entire directory]
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── tailwind.config.ts                      # TailwindCSS v4 config (if needed)
    │
    ├── public/
    │   └── favicon.svg
    │
    └── src/
        ├── main.tsx                            # React entry point
        ├── App.tsx                             # Root with React Router
        ├── index.css                           # Design system (CSS variables, tokens, animations)
        ├── vite-env.d.ts
        │
        ├── context/
        │   └── AuthContext.tsx                 # Role-based auth + routing
        │
        ├── hooks/
        │   ├── useWebSocket.ts                 # WebSocket connection management
        │   ├── useApi.ts                       # Fetch wrapper with auth headers
        │   └── useRealtime.ts                  # Subscribe to WebSocket channels
        │
        ├── lib/
        │   └── utils.ts                        # Utility functions (clsx, date formatting)
        │
        ├── pages/
        │   ├── LoginPage.tsx                   # Role-select login (5 roles)
        │   ├── citizen/
        │   │   ├── AreaMapPage.tsx             # Page 1.1 — Area Map
        │   │   ├── MyCarsPage.tsx              # Page 1.2 — My Cars
        │   │   ├── ReportPage.tsx              # Page 1.3 — Report Complaint
        │   │   └── ProfilePage.tsx             # Page 1.4 — Citizen Profile
        │   ├── bmc/
        │   │   ├── IssuesDashboard.tsx         # Page 2.1 — Issues Dashboard
        │   │   ├── WorkersPage.tsx             # Page 2.2 — Workers Management
        │   │   ├── CompletedPage.tsx           # Page 2.3 — Completed Work
        │   │   └── ReportsPage.tsx             # Page 2.4 — Reports & Analytics
        │   ├── state/
        │   │   ├── OverviewPage.tsx            # Page 3.1 — State Overview
        │   │   ├── WeeklyReports.tsx           # Page 3.2 — Weekly Reports
        │   │   ├── AllocationPage.tsx          # Page 3.3 — Fund Allocation
        │   │   └── AccountabilityPage.tsx      # Page 3.4 — Accountability Board
        │   ├── worker/
        │   │   ├── DashboardPage.tsx           # Page 4.1 — Worker Home
        │   │   ├── TasksPage.tsx               # Page 4.2 — My Tasks
        │   │   ├── AssistantPage.tsx           # Page 4.3 — FIELD_COPILOT
        │   │   └── ProfilePage.tsx             # Page 4.4 — Worker Profile
        │   └── nexus/
        │       ├── ConstellationPage.tsx       # Page 5.1 — Agent Constellation
        │       ├── EventStreamPage.tsx         # Page 5.2 — Event Stream
        │       └── PipelinePage.tsx            # Page 5.3 — Pipeline Visualizer
        │
        └── components/
            ├── shared/                         # Shared across all dashboards
            │   ├── SeverityBadge.tsx
            │   ├── StatusPill.tsx
            │   ├── KPICard.tsx
            │   ├── MapView.tsx                # mapcn.dev map wrapper
            │   ├── IssueDetailModal.tsx
            │   ├── CategoryIcon.tsx
            │   ├── SourceIcon.tsx
            │   ├── Chart.tsx                  # Recharts wrapper
            │   ├── GlassCard.tsx
            │   ├── AnimatedCounter.tsx
            │   ├── LoadingSpinner.tsx
            │   ├── NotificationBell.tsx
            │   └── Timeline.tsx
            ├── citizen/
            │   ├── CitizenLayout.tsx           # Mobile frame + bottom tabs
            │   ├── BottomTabNav.tsx
            │   ├── IssuePin.tsx
            │   ├── CarCard.tsx
            │   ├── CategoryTile.tsx
            │   └── ViraChat.tsx
            ├── bmc/
            │   ├── BMCLayout.tsx               # Desktop sidebar layout
            │   ├── Sidebar.tsx
            │   ├── IssueTable.tsx
            │   ├── IssueDetailPanel.tsx
            │   ├── ActivityFeed.tsx
            │   ├── WorkerMap.tsx
            │   ├── WorkerTable.tsx
            │   ├── ConfidenceScore.tsx
            │   └── ReportGenerator.tsx
            ├── state/
            │   ├── StateLayout.tsx             # Desktop sidebar layout
            │   ├── StateSidebar.tsx
            │   ├── StateMap.tsx
            │   ├── MCPerformanceTable.tsx
            │   ├── EscalationPanel.tsx
            │   ├── ReportViewer.tsx
            │   ├── AllocationTable.tsx
            │   ├── ScorecardGrid.tsx
            │   └── LeagueTable.tsx
            ├── worker/
            │   ├── WorkerLayout.tsx            # Mobile frame + bottom tabs
            │   ├── WorkerTabNav.tsx
            │   ├── TaskCard.tsx
            │   ├── TaskDetail.tsx
            │   ├── ProcedureAccordion.tsx
            │   ├── ProofUpload.tsx
            │   └── CopilotChat.tsx
            └── nexus/
                ├── NexusLayout.tsx             # Full-screen dark immersive
                ├── NexusTopBar.tsx
                ├── AgentNode.tsx
                ├── NexusCentralNode.tsx
                ├── ConnectionLine.tsx
                ├── DataPacket.tsx
                ├── AgentDetailPanel.tsx
                ├── LiveTicker.tsx
                ├── EventCard.tsx
                ├── PipelineNode.tsx
                └── PipelineArrow.tsx
```

---

## Phase Overview

| Phase | Description | Members | Duration |
|---|---|---|---|
| **Phase 1** | Project Scaffolding | Stavan + Yash | Day 1 Morning |
| **Phase 2** | Backend Core (models, data store, middleware, WebSocket) | Stavan | Day 1 |
| **Phase 3** | Frontend Core (design system, auth, routing, shared components) | Yash | Day 1 |
| **Phase 4** | Backend Agents — Group A (NEXUS, COGNOS, SENTINEL, COMMANDER) | Stavan | Day 1–2 |
| **Phase 5** | Backend Agents — Group B (VIRA, GUARDIAN, PRESCIENT, FLEET) | Piyush | Day 1–2 |
| **Phase 6** | Backend Agents — Group C (LOOP, ORACLE, FIELD_COPILOT) + Seed Data | Amit | Day 1–2 |
| **Phase 7** | Frontend Dashboards — Citizen + Worker (mobile) | Yash | Day 2 |
| **Phase 8** | Frontend Dashboards — BMC + State (desktop) | Yash | Day 2–3 |
| **Phase 9** | Frontend Dashboard — NEXUS Agent (immersive) | Yash | Day 3 |
| **Phase 10** | Integration + WebSocket wiring + Voice + Polish + Demo prep | All | Day 3 |

---

## Phase Dependencies

```
Phase 1 (Scaffolding) ──────────────────────────────────────────────────┐
    │                                                                    │
    ├── Phase 2 (Backend Core) [STAVAN]                                  ├── Phase 3 (Frontend Core) [YASH]
    │       │                                                            │
    │       ├── Phase 4 (Agents A) [STAVAN]                              ├── Phase 7 (Citizen + Worker) [YASH]
    │       │                                                            │
    │       ├── Phase 5 (Agents B) [PIYUSH] ←── waits for Phase 2       ├── Phase 8 (BMC + State) [YASH]
    │       │                                                            │
    │       ├── Phase 6 (Agents C + Data) [AMIT] ←── waits for Phase 2  ├── Phase 9 (NEXUS) [YASH]
    │       │                                                            │
    │       └───────────────── Phase 10 (Integration) [ALL] ─────────────┘
```

> **Key rule:** Piyush and Amit start their agent work AFTER Stavan completes Phase 2 (backend core) so they can import models, data_store, and config. Yash works independently on frontend from Phase 3 onward. Phase 10 brings everything together.

---

## Phase Details

### Phase 1: Project Scaffolding (Stavan + Yash)

**Stavan does:**
- Create project root structure
- `backend/` directory with `requirements.txt`, `main.py` (hello world), `.env.example`, `config.py`
- Initialize git repo, create `.gitignore`

**Yash does:**
- Scaffold `frontend/` with `npx -y create-vite@latest ./ --template react-ts`
- Install dependencies: `react-router-dom`, `framer-motion`, `recharts`, `lucide-react`, `clsx`, `date-fns`
- Install mapcn.dev components (MapLibre GL)
- Install TailwindCSS v4 with `@tailwindcss/vite`
- Verify `npm run dev` works

**Commit:** `feat: project scaffolding — backend + frontend initialized`

---

### Phase 2: Backend Core (Stavan only)

- `models.py` — All Pydantic models (Issue, Worker, DailyReport, AuditEntry, AgentState, Location, etc.)
- `data_store.py` — In-memory data store with JSON file persistence, CRUD methods
- `ws_manager.py` — WebSocket connection manager (connect, disconnect, broadcast, send_to_role)
- `middleware/sentinel_middleware.py` — RBAC middleware, role permissions, audit logging
- `config.py` — env vars, API key loading
- `main.py` — FastAPI app with CORS, SENTINEL middleware, WebSocket endpoint, health check
- `routers/issues_router.py` — Generic issue CRUD (GET /api/issues, POST /api/issues, etc.)

**Commit:** `feat(backend): core infrastructure — models, data store, WebSocket, SENTINEL middleware`

---

### Phase 3: Frontend Core (Yash only)

- `src/index.css` — Full design system (CSS tokens, glassmorphism, animations, dark theme, fonts)
- `src/App.tsx` — React Router with all 19 routes + login
- `src/context/AuthContext.tsx` — Role-based auth with login/logout
- `src/pages/LoginPage.tsx` — 5-role selection page
- `src/hooks/useWebSocket.ts`, `useApi.ts`, `useRealtime.ts`
- `src/lib/utils.ts`
- All `src/components/shared/` components (13 shared components)

**Commit:** `feat(frontend): core setup — design system, auth, routing, shared components`

---

### Phase 4: Backend Agents Group A (Stavan only)

- `agents/nexus.py` — LangGraph StateGraph orchestrator
- `agents/cognos.py` — Dual-brain classification (rule engine + LLM)
- `agents/sentinel.py` — RBAC agent logic
- `agents/commander.py` — Multi-factor scoring assignment + procedure generation
- `routers/nexus_router.py`, `cognos_router.py`, `sentinel_router.py`, `commander_router.py`
- Wire routers into `main.py`

**Commit:** `feat(backend): agents NEXUS, COGNOS, SENTINEL, COMMANDER with routers`

---

### Phase 5: Backend Agents Group B (Piyush only)

> **Prerequisite:** Phase 2 must be complete (Piyush pulls latest from `main`)

- `agents/vira.py` — Citizen chat/voice (mode detection, extraction, query)
- `agents/guardian.py` — Deadline monitoring, escalation cascade, auto-escalation
- `agents/prescient.py` — Daily/weekly report generation, forecasting
- `agents/fleet.py` — Geographic clustering, trend detection, MC comparison
- `routers/vira_router.py`, `guardian_router.py`, `prescient_router.py`, `fleet_router.py`

**Commit:** `feat(backend): agents VIRA, GUARDIAN, PRESCIENT, FLEET with routers`

---

### Phase 6: Backend Agents Group C + Seed Data (Amit only)

> **Prerequisite:** Phase 2 must be complete (Amit pulls latest from `main`)

- `agents/loop.py` — Proof validation, citizen notification, feedback, re-report detection
- `agents/oracle.py` — Fund allocation, resource allocation, budget tracking
- `agents/field_copilot.py` — Context-aware worker AI assistant
- `routers/loop_router.py`, `oracle_router.py`, `field_copilot_router.py`, `notifications_router.py`
- `seed_data/issues.json`, `workers.json`, `mcs.json`, `reports.json`

**Commit:** `feat(backend): agents LOOP, ORACLE, FIELD_COPILOT + seed data`

---

### Phase 7: Frontend — Citizen + Worker Dashboards (Yash only)

- `components/citizen/` — All 6 citizen components
- `pages/citizen/` — All 4 citizen pages (AreaMapPage, MyCarsPage, ReportPage, ProfilePage)
- `components/worker/` — All 7 worker components
- `pages/worker/` — All 4 worker pages (DashboardPage, TasksPage, AssistantPage, ProfilePage)

**Commit:** `feat(frontend): citizen dashboard (4 pages) + worker dashboard (4 pages)`

---

### Phase 8: Frontend — BMC + State Dashboards (Yash only)

- `components/bmc/` — All 9 BMC components
- `pages/bmc/` — All 4 BMC pages (IssuesDashboard, WorkersPage, CompletedPage, ReportsPage)
- `components/state/` — All 9 state components
- `pages/state/` — All 4 state pages (OverviewPage, WeeklyReports, AllocationPage, AccountabilityPage)

**Commit:** `feat(frontend): BMC dashboard (4 pages) + state dashboard (4 pages)`

---

### Phase 9: Frontend — NEXUS Agent Dashboard (Yash only)

- `components/nexus/` — All 11 NEXUS components (constellation, connections, particles, pipeline)
- `pages/nexus/` — All 3 NEXUS pages (ConstellationPage, EventStreamPage, PipelinePage)
- Deep space dark theme, glassmorphism, neon glows, data packet animations

**Commit:** `feat(frontend): NEXUS agent dashboard (3 pages) — constellation, events, pipeline`

---

### Phase 10: Integration + Polish (ALL members)

**Stavan:**
- Wire all agent routers into `main.py`
- End-to-end pipeline test: sensor data → NEXUS → COGNOS → COMMANDER → assignment
- WebSocket broadcast verification
- Fix any backend bugs

**Yash:**
- Connect frontend to backend APIs (replace mock data with real API calls)
- WebSocket integration for real-time updates (activity feed, alerts, NEXUS constellation)
- Voice integration (Web Speech API STT)
- Final UI polish, animations, responsiveness
- Cross-browser testing

**Piyush:**
- Test VIRA chat flow end-to-end
- Test GUARDIAN escalation cascade
- Test PRESCIENT report generation
- Fix any agent bugs

**Amit:**
- Test LOOP verification + citizen notification flow
- Test ORACLE fund recommendations
- Test FIELD_COPILOT voice chat
- Verify seed data loads correctly
- Fix any agent bugs

**Commit:** `feat: full integration — frontend ↔ backend connected, WebSocket live, voice enabled`

---

## Conflict Prevention Rules

1. **Stavan** owns ALL files in `backend/` root + `backend/middleware/` + agents `nexus.py`, `cognos.py`, `sentinel.py`, `commander.py` + their routers
2. **Piyush** owns ONLY agents `vira.py`, `guardian.py`, `prescient.py`, `fleet.py` + their routers
3. **Amit** owns ONLY agents `loop.py`, `oracle.py`, `field_copilot.py` + their routers + `seed_data/` + `notifications_router.py`
4. **Yash** owns the ENTIRE `frontend/` directory — no one else touches it
5. **Only Stavan** modifies `main.py` — Piyush and Amit provide router files, Stavan imports them
6. **Only Stavan** modifies `models.py` and `data_store.py` — others request additions via message
7. In Phase 10, Stavan is the integration gatekeeper for backend merges

---

*InfraLens — Because infrastructure shouldn't wait for a headline.*
