# InfraLens — Master Implementation Plan

> **AI-Powered Civic Infrastructure Intelligence Platform**
> 11 Agents · 5 Dashboards · 19 Pages · 4 Team Members · **Fully Simultaneous Development**

---

## Team Assignments

| Member | Role | Scope |
|---|---|---|
| **Stavan** | Backend Lead | Project scaffolding, FastAPI core, data layer, NEXUS orchestrator, SENTINEL middleware, WebSocket manager, COGNOS agent, COMMANDER agent |
| **Yash** | Frontend Lead | Entire frontend — React 19 + Vite 6 + TailwindCSS v3, all 5 dashboards (19 pages), design system, mapcn.dev maps, Framer Motion animations |
| **Piyush** | Backend Agent Dev | VIRA agent, GUARDIAN agent, PRESCIENT agent, FLEET agent, all their routers |
| **Amit** | Backend Agent Dev + Data | LOOP agent, ORACLE agent, FIELD_COPILOT agent, seed data creation, all their routers |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, TailwindCSS v3, Framer Motion, mapcn.dev (MapLibre GL), recharts, lucide-react |
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
    ├── tailwind.config.ts                      # TailwindCSS v3 config (if needed)
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

## Phase Overview — FULLY SIMULTANEOUS

> 🔑 **ALL 4 members start coding from Day 1 Morning. Zero idle time.**

| Phase | Description | Stavan | Yash | Piyush | Amit | Day |
|---|---|---|---|---|---|---|
| **Phase 1** | Scaffolding + Core Bootstrap | Backend scaffold + `models.py` + `data_store.py` + `config.py` | Frontend scaffold (Vite + React + TailwindCSS + mapcn) | Seed data creation (`seed_data/*.json`) — NO code dependencies | Agent logic drafts (pure Python, no imports) | Day 1 AM |
| **Phase 2** | Core Completion + Agent Start | `ws_manager.py`, `sentinel_middleware.py`, `main.py`, `issues_router.py` | Design system, auth, routing, login page, hooks | Pull models → start VIRA + GUARDIAN agents | Pull models → start LOOP + ORACLE agents | Day 1 |
| **Phase 3** | Agents (all 3 backend devs in parallel) | NEXUS + COGNOS + SENTINEL + COMMANDER agents + routers | Shared components (13 components) | PRESCIENT + FLEET agents + all 4 routers | FIELD_COPILOT agent + all 4 routers + notifications | Day 1–2 |
| **Phase 4** | Frontend Dashboards (Yash) + Backend Testing | Test agents end-to-end, fix bugs | Citizen + Worker dashboards (8 pages) | Test own agents individually, fix bugs | Test own agents individually, fix bugs | Day 2 |
| **Phase 5** | Frontend Dashboards (continued) | Wire all routers into `main.py`, merge PRs | BMC + State dashboards (8 pages) | Help with integration testing | Help with integration testing | Day 2–3 |
| **Phase 6** | NEXUS Dashboard + Integration | Full pipeline integration testing | NEXUS Agent Dashboard (3 pages) — THE WOW PAGE | VIRA/GUARDIAN end-to-end with frontend | LOOP/FIELD_COPILOT end-to-end with frontend | Day 3 |
| **Phase 7** | Final Integration + Polish | WebSocket broadcast verification, demo prep | API connection, WebSocket wiring, voice, polish | Final bug fixes | Final bug fixes | Day 3 |

---

## Simultaneous Work Diagram

```
DAY 1 MORNING — ALL START SIMULTANEOUSLY
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  STAVAN                    YASH                  PIYUSH              AMIT    │
│  ───────                   ────                  ──────              ────    │
│  backend/ scaffold         frontend/ scaffold    seed_data/*.json    Agent   │
│  models.py (FAST!)         Vite + React + TS     mcs.json            logic   │
│  data_store.py             TailwindCSS v3        workers.json        drafts  │
│  config.py                 mapcn.dev install     issues.json         (pure   │
│                                                  reports.json         Python │
│  ↓ PUSH models.py                                                    no     │
│    to main (1-2 hrs)                                                 imports)│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

DAY 1 AFTERNOON — FULL PARALLEL
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  STAVAN                    YASH                  PIYUSH              AMIT    │
│  ───────                   ────                  ──────              ────    │
│  ws_manager.py             index.css (design)    git pull main       git     │
│  sentinel_middleware.py    App.tsx (routing)      ↓ has models.py     pull   │
│  main.py (full)            AuthContext.tsx        Add imports to      main   │
│  issues_router.py          LoginPage.tsx          VIRA, GUARDIAN      ↓      │
│  ↓                         hooks/                 agents              Add    │
│  Start NEXUS agent         lib/utils.ts           Create routers      imports│
│  Start COGNOS agent        Shared components      ↓                   to     │
│                            (13 components)        Continue agents      LOOP,  │
│                                                                       ORACLE │
│                                                                       agents │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

DAY 2 — FULL PARALLEL
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  STAVAN                    YASH                  PIYUSH              AMIT    │
│  ───────                   ────                  ──────              ────    │
│  SENTINEL agent            Citizen Dashboard     PRESCIENT agent     FIELD_  │
│  COMMANDER agent           (4 pages)             FLEET agent         COPILOT │
│  All 5 routers             Worker Dashboard      All 4 routers       agent   │
│  Wire routers→main.py      (4 pages)             Test agents         All 4   │
│  Test pipeline              ↓                     ↓                   routers │
│  Merge PRs                 BMC Dashboard          ↓                   Test   │
│                            (4 pages)             Fix bugs            agents  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

DAY 3 — INTEGRATION + POLISH
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  STAVAN                    YASH                  PIYUSH              AMIT    │
│  ───────                   ────                  ──────              ────    │
│  Full pipeline test        State Dashboard       VIRA e2e test      LOOP    │
│  Wire all 11 agents        (4 pages)             GUARDIAN e2e       e2e test│
│  WebSocket verification    NEXUS Dashboard       Help integration   COPILOT │
│  Demo preparation          (3 pages — THE WOW)   Bug fixes          e2e test│
│                            API connection                            Bug     │
│                            WebSocket wiring                          fixes   │
│                            Voice integration                                 │
│                            Final polish                                      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## How Piyush & Amit Start Day 1 WITHOUT Waiting

### Amit — Day 1 Morning (ZERO dependencies):
1. **Create ALL seed data** — `seed_data/issues.json`, `workers.json`, `mcs.json`, `reports.json`
   - This is pure JSON. No Python imports needed. Takes ~2 hours.
   - Push immediately so Stavan can test with real data.
2. **Draft agent logic as pure Python** — write the core functions for LOOP, ORACLE, FIELD_COPILOT
   - Write all business logic (scoring formulas, validation rules, response templates)
   - Use placeholder type hints: `def submit_proof(issue_id: str, images: list, notes: str = "") -> dict:`
   - Don't import models yet — just return dicts
3. **Once Stavan pushes `models.py`** (1-2 hours in) → `git pull` → add real imports → connect to data_store

### Piyush — Day 1 Morning (ZERO dependencies):
1. **Draft agent logic as pure Python** — write core functions for VIRA, GUARDIAN, PRESCIENT, FLEET
   - VIRA: write prompt templates, mode detection logic (keyword matching), response formatting
   - GUARDIAN: write threshold constants, overdue calculation logic, alert generation
   - PRESCIENT: write aggregation formulas, narrative prompts, report structure
   - FLEET: write clustering logic (haversine distance), comparison formulas
   - All functions return dicts, no model imports needed initially
2. **Once Stavan pushes `models.py`** (1-2 hours in) → `git pull` → add Pydantic imports → wrap returns in models

### Timeline for the Handoff:
```
T+0:00  — ALL start simultaneously
T+1:00  — Stavan pushes models.py + data_store.py stubs to main (FAST delivery)
T+1:15  — Piyush & Amit: git pull → add imports → continue with real types
T+2:00  — Amit pushes seed data → Stavan/Piyush can test with real data
T+3:00  — Stavan pushes full core (ws_manager, middleware, main.py)
T+4:00+ — Everyone coding agents in parallel, no waiting
```

> ⚡ **Result: Maximum 1 hour of "draft mode" for Piyush/Amit. Then fully parallel.**

---

## Phase Details

### Phase 1: Scaffolding + Core Bootstrap (ALL 4 parallel)

**Stavan (PRIORITY: push models.py FAST):**
- Create `backend/` directory structure, `.gitignore`, `requirements.txt`
- Create `models.py` with ALL Pydantic models — **PUSH THIS TO MAIN WITHIN 1 HOUR**
- Create `data_store.py` with DataStore class (can be stubs initially)
- Create `config.py` with env loader

**Yash (fully independent):**
- Scaffold `frontend/` with Vite + React + TypeScript
- Install all dependencies (react-router-dom, framer-motion, recharts, lucide-react, clsx, date-fns)
- Install mapcn.dev + TailwindCSS v3
- Verify `npm run dev` works

**Piyush (no dependencies — pure Python):**
- Write VIRA prompt templates and mode detection logic
- Write GUARDIAN threshold constants and overdue calculation
- Write PRESCIENT aggregation formulas and narrative prompts
- Write FLEET clustering logic and comparison formulas
- All as standalone functions returning plain dicts

**Amit (no dependencies — pure JSON + Python):**
- Create `seed_data/mcs.json` (8 MCs)
- Create `seed_data/workers.json` (20 workers with real GPS)
- Create `seed_data/issues.json` (30 issues with realistic data)
- Create `seed_data/reports.json` (5 reports)
- Start drafting LOOP/ORACLE/FIELD_COPILOT logic as plain dicts

**After Stavan pushes models.py:** Piyush & Amit `git pull` → add model imports

**Commits:**
- Stavan: `feat: backend scaffold + models + data store`
- Yash: `feat: frontend scaffold — Vite + React + TS + TailwindCSS + mapcn`
- Amit: `feat: seed data — issues, workers, MCs, reports`
- Piyush: `feat: agent drafts — VIRA, GUARDIAN, PRESCIENT, FLEET logic`

---

### Phase 2: Core Completion + Agent Start (ALL 4 parallel)

**Stavan:**
- Complete `ws_manager.py` (WebSocket connection manager)
- Create `middleware/sentinel_middleware.py` (RBAC middleware)
- Complete `main.py` (CORS, SENTINEL, WebSocket endpoint, startup)
- Create `routers/issues_router.py` (issue CRUD)

**Yash:**
- Create `src/index.css` (full design system)
- Create `src/App.tsx` (React Router, all 20 routes)
- Create `src/context/AuthContext.tsx` (role-based auth)
- Create `src/pages/LoginPage.tsx` (5-role selection)
- Create all hooks (useWebSocket, useApi, useRealtime)
- Create `src/lib/utils.ts`

**Piyush (now has models.py):**
- Convert VIRA draft to full agent with model imports
- Convert GUARDIAN draft to full agent with data_store imports
- Start PRESCIENT and FLEET agents

**Amit (now has models.py):**
- Convert LOOP draft to full agent with model imports
- Convert ORACLE draft to full agent with data_store imports
- Start FIELD_COPILOT agent

**Commits:**
- Stavan: `feat(backend): core — WebSocket, SENTINEL middleware, main.py, issues router`
- Yash: `feat(frontend): design system, auth, routing, login page, hooks`
- Piyush: `feat(backend): VIRA + GUARDIAN agents with real models`
- Amit: `feat(backend): LOOP + ORACLE agents with real models`

---

### Phase 3: Agents Complete (ALL 4 parallel)

**Stavan:**
- Create `agents/nexus.py` (LangGraph StateGraph orchestrator)
- Create `agents/cognos.py` (dual-brain classification)
- Create `agents/sentinel.py` (RBAC agent logic)
- Create `agents/commander.py` (multi-factor assignment)
- Create all 5 routers (nexus, cognos, sentinel, commander, issues)
- Wire Group A routers into `main.py`

**Yash:**
- Build all 13 shared components (`src/components/shared/`)
- Start Citizen dashboard components

**Piyush:**
- Complete PRESCIENT agent
- Complete FLEET agent
- Create all 4 routers (vira, guardian, prescient, fleet)

**Amit:**
- Complete FIELD_COPILOT agent
- Create all 4 routers (loop, oracle, field_copilot, notifications)

**Commits:**
- Stavan: `feat(backend): agents NEXUS, COGNOS, SENTINEL, COMMANDER + routers`
- Yash: `feat(frontend): 13 shared components`
- Piyush: `feat(backend): agents VIRA, GUARDIAN, PRESCIENT, FLEET + routers`
- Amit: `feat(backend): agents LOOP, ORACLE, FIELD_COPILOT + routers`

---

### Phase 4: Frontend Dashboards + Backend Testing (ALL 4 parallel)

**Stavan:**
- Merge Piyush's and Amit's PRs
- Wire ALL routers into `main.py`
- Test full NEXUS pipeline end-to-end
- Fix integration bugs

**Yash:**
- Build Citizen Dashboard (4 pages + 6 components)
- Build Worker Dashboard (4 pages + 7 components)

**Piyush:**
- Test VIRA, GUARDIAN, PRESCIENT, FLEET individually with seed data
- Fix any bugs

**Amit:**
- Test LOOP, ORACLE, FIELD_COPILOT individually with seed data
- Fix any bugs, update seed data if needed

**Commits:**
- Stavan: `feat(backend): all 11 agent routers wired, pipeline tested`
- Yash: `feat(frontend): citizen + worker dashboards (8 pages)`
- Piyush: `fix(backend): VIRA, GUARDIAN, PRESCIENT, FLEET tested + fixed`
- Amit: `fix(backend): LOOP, ORACLE, FIELD_COPILOT tested + fixed`

---

### Phase 5: More Dashboards + Integration (ALL 4 parallel)

**Stavan:**
- Full end-to-end pipeline: sensor → NEXUS → COGNOS → COMMANDER → assignment
- WebSocket broadcast verification

**Yash:**
- Build BMC Dashboard (4 pages + 9 components)
- Build State Dashboard (4 pages + 9 components)

**Piyush:**
- VIRA end-to-end through NEXUS pipeline
- GUARDIAN escalation cascade
- PRESCIENT report generation

**Amit:**
- LOOP completion flow through pipeline
- ORACLE fund recommendations
- FIELD_COPILOT with task context

**Commits:**
- Stavan: `feat(backend): end-to-end pipeline verified, WebSocket live`
- Yash: `feat(frontend): BMC + state dashboards (8 pages)`
- Piyush: `fix(backend): agents B integration verified`
- Amit: `fix(backend): agents C integration verified`

---

### Phase 6: NEXUS Dashboard + Frontend Integration (ALL 4 parallel)

**Stavan:**
- Final full-system demo test
- Demo preparation, happy-path script

**Yash:**
- Build NEXUS Agent Dashboard (3 pages + 11 components) — THE WOW PAGE
- Connect frontend to backend APIs (replace mock data)
- WebSocket integration (activity feeds, alerts, constellation animations)
- Voice integration (Web Speech API STT)

**Piyush:**
- Help test VIRA from frontend citizen chat
- Help test GUARDIAN alerts on State dashboard

**Amit:**
- Help test LOOP verification from worker dashboard
- Help test FIELD_COPILOT chat from worker assistant

**Commits:**
- Yash: `feat(frontend): NEXUS dashboard (3 pages) + API integration + voice`
- ALL: `feat: full integration — 11 agents + 19 pages + WebSocket + voice`

---

### Phase 7: Final Polish (ALL members)

**Stavan:** Final backend stability, demo happy-path verification
**Yash:** Animations, responsive tweaks, cross-browser testing
**Piyush:** Fix any remaining agent bugs
**Amit:** Fix any remaining agent bugs, verify seed data

**Final commit:** `release: InfraLens v1.0 — demo ready`

---

## Conflict Prevention Rules

1. **Stavan** owns ALL files in `backend/` root + `backend/middleware/` + agents `nexus.py`, `cognos.py`, `sentinel.py`, `commander.py` + their routers
2. **Piyush** owns ONLY agents `vira.py`, `guardian.py`, `prescient.py`, `fleet.py` + their routers
3. **Amit** owns ONLY agents `loop.py`, `oracle.py`, `field_copilot.py` + their routers + `seed_data/` + `notifications_router.py`
4. **Yash** owns the ENTIRE `frontend/` directory — no one else touches it
5. **Only Stavan** modifies `main.py` — Piyush and Amit provide router files, Stavan imports them
6. **Only Stavan** modifies `models.py` and `data_store.py` — others request additions via message
7. In Phase 4+, Stavan is the integration gatekeeper for backend merges

---

*InfraLens — Because infrastructure shouldn't wait for a headline.*
