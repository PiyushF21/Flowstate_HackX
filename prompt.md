# InfraLens — Prompts for Each Team Member

> Copy-paste these prompts into your AI coding assistant (Cursor, Gemini, Copilot) to get started on each phase.
> Each prompt contains full context so there is **no confusion** about what to build.

---

## 🟦 STAVAN — Backend Lead

### Prompt: Phase 1 — Project Scaffolding (Backend)

```
I am building an AI-powered civic infrastructure platform called InfraLens.

Your job: Set up the backend project scaffolding.

Create the following structure:
- backend/main.py — Minimal FastAPI app with a single GET /api/health endpoint returning {"status": "ok", "agent": "InfraLens", "version": "0.1.0"}
- backend/config.py — Uses python-dotenv to load XAI_API_KEY and SARVAM_API_KEY from .env
- backend/requirements.txt — fastapi==0.115.0, uvicorn[standard]==0.30.0, websockets==12.0, langchain>=0.2.0, langgraph>=0.2.0, langchain-xai>=0.1.0, httpx>=0.27.0, python-multipart>=0.0.9, pydantic>=2.7.0, python-dotenv>=1.0.0
- backend/.env.example — Template with XAI_API_KEY=your-key and SARVAM_API_KEY=your-key
- backend/agents/__init__.py — Empty
- backend/routers/__init__.py — Empty
- backend/middleware/ — Empty directory
- backend/seed_data/ — Empty directory
- .gitignore — Python (__pycache__, .env, *.pyc, venv/) + Node (node_modules/, dist/) + .DS_Store

Add CORS middleware to main.py allowing origin http://localhost:5173.
```

### Prompt: Phase 2 — Backend Core Infrastructure

```
I am building InfraLens — an AI-powered civic infrastructure platform with 11 agents.

Your job: Create the backend core infrastructure. This is the foundation that all 11 agents will use.

Tech: Python 3.11+, FastAPI, Pydantic v2, asyncio

FILE 1: backend/models.py
Create Pydantic BaseModel classes for:
- Location: lat (float), lng (float), address (str), city (str), ward (str), pincode (str, optional)
- SensorData: vehicle_id, timestamp, gps (Location), speed_kmh, accelerometer (dict with x,y,z), suspension_event (bool), road_segment, city, ward
- ImageCapture: reporter_id, reporter_name, timestamp, gps (Location), images (list[str]), auto_detected_category, ai_confidence, road_segment, city, ward
- ManualComplaint: reporter_id, reporter_name, timestamp, gps (Location), category, subcategory, description, severity_self_assessed, images, address_text, city, ward
- AIClassification: agent, category_confidence, severity_confidence, cross_validation_count
- Reporter: reporter_id, reporter_name, contact (optional)
- Assignment: worker_id, worker_name, team (list[dict]), assigned_at, assigned_by
- Completion: completed_at, proof_images (list[str]), verified_by, verified_at
- Performance: tasks_completed_this_week, avg_resolution_time_hours, rating, on_time_completion_pct
- Issue: issue_id, source (car_sensor|360_capture|manual_complaint), category, subcategory, severity (CRITICAL|HIGH|MEDIUM|LOW), confidence (float), status (reported|assigned|in_progress|resolved|escalated|cancelled), location (Location), description, ai_classification (optional), reporter (optional), images, assigned_to (optional Assignment), procedure (list[str]), deadline (optional), materials_required (list[str]), completion (optional), resolution_time_hours (optional), sla_met (optional), citizen_notified (bool, default False), created_at, updated_at
- Worker: worker_id, name, phone, role (field_worker|fleet_leader|supervisor), specializations (list[str]), certifications (list[str]), zone, mc, status (available|on_task|off_duty), current_task_id (optional), shift (dict), current_location (Location), performance (Performance)
- DailyReport: report_id, mc_name, date, generated_by, generated_at, summary (dict), by_category (dict), by_severity (dict), worst_wards (list), escalated_tasks (int), fund_utilization_pct (float)
- MC: mc_id, name, city, state, total_workers, issues_this_week, resolution_rate, avg_resolution_hours
- AuditEntry: id, agent, action, role, user_id, outcome, details (dict), timestamp
- AgentEvent: agent, action, issue_id (optional), data (dict), portal, timestamp

FILE 2: backend/data_store.py
Create a DataStore class:
- Uses asyncio.Lock for thread safety
- Stores issues, workers, reports, mcs, audit_logs, agent_events as in-memory dicts/lists
- Auto-loads JSON files from backend/seed_data/ on initialization (if exists)
- Issue CRUD: create_issue, get_issue, update_issue, list_issues (with optional filters by status, severity, category, mc), list_issues_by_mc, list_issues_near (GPS proximity with haversine)
- Worker CRUD: get_worker, list_workers (with filters), update_worker
- Report: create_report, list_reports
- MC: get_mc, list_mcs
- Audit: add_audit_log, get_audit_logs
- Agent events: add_agent_event, get_agent_events (with limit, default 200)
- generate_issue_id(city) → "ISS-{CITY_CODE}-{YYYY-MM-DD}-{SEQ:04d}"
- Create a global singleton: data_store = DataStore()

FILE 3: backend/ws_manager.py
Create a ConnectionManager class:
- channels dict mapping channel name to set of WebSocket connections
- async connect(websocket, channel)
- async disconnect(websocket, channel)
- async broadcast(channel, data) — sends JSON to all connections in channel
- async send_to_role(role, data) — sends to connections tagged with a role
- Channels: "agent_events", "issues", "tasks", "notifications", "escalations"
- Create global singleton: ws_manager = ConnectionManager()

FILE 4: backend/middleware/sentinel_middleware.py
Create SENTINEL RBAC middleware for FastAPI:
- Reads X-User-Role and X-User-Id headers from request
- Role permissions (from the agents.md spec):
  - citizen: can access /api/vira/*, /api/issues/mine, /api/notifications; cannot access /api/fleet/*, /api/commander/*, /api/oracle/*
  - bmc_supervisor: can access /api/issues/*, /api/commander/*, /api/workers/*; cannot access /api/oracle/funds, /api/fleet/compare
  - field_worker: can access /api/tasks/mine, /api/field-copilot/*, /api/tasks/complete; cannot access /api/commander/*, /api/fleet/*, /api/oracle/*
  - state_official: can access /api/fleet/*, /api/oracle/*, /api/prescient/*, /api/guardian/*; cannot access /api/commander/assign
  - nexus_admin: can access everything
- If no X-User-Role header: allow (for development/demo convenience)
- If unauthorized: return 403 JSON response
- Log every request as AuditEntry via data_store.add_audit_log

FILE 5: Update backend/main.py
- Import and add CORS middleware (allow origin http://localhost:5173, allow all methods/headers)
- Add SENTINEL middleware
- Add WebSocket endpoint: @app.websocket("/ws/{channel}")
- Add startup event to load seed data
- Add GET /api/health
- Import and include issues_router

FILE 6: backend/routers/issues_router.py
- GET /api/issues — list all issues (query params: status, severity, category, mc, limit)
- GET /api/issues/{issue_id} — get single issue
- GET /api/issues/mine — citizen's own issues (uses X-User-Id header)
- POST /api/issues — create new issue
- PATCH /api/issues/{issue_id} — update issue fields
```

### Prompt: Phase 4 — Agents NEXUS, COGNOS, SENTINEL, COMMANDER

```
I am building InfraLens. The backend core (models.py, data_store.py, ws_manager.py, config.py) is already built.

Your job: Create 4 AI agents + their FastAPI routers.

Context: InfraLens has 11 agents. You're building 4 core ones:
1. NEXUS — LangGraph pipeline orchestrator
2. COGNOS — Dual-brain issue classification (rule engine + LLM)
3. SENTINEL — RBAC access control logic
4. COMMANDER — Multi-factor worker assignment

AGENT 1: backend/agents/nexus.py
- Uses LangGraph StateGraph
- AgentState TypedDict: issue_id, source, raw_data, classification, severity, location, mc, assignment, worker_id, procedure, deadline, status, escalation, completion, execution_steps
- Nodes: classify_source, cognos_classify (calls cognos agent), sentinel_verify, commander_assign, guardian_monitor
- Conditional edges: after sentinel_verify, route based on severity (CRITICAL goes to guardian_monitor after commander)
- process_issue(raw_data: dict) → runs full pipeline, broadcasts AgentEvent via ws_manager at each step
- get_pipeline_status(issue_id) → returns current state
- If langgraph is not available, implement as sequential async function calls (fallback)

AGENT 2: backend/agents/cognos.py
- FAULT_CODES dict: RD-001 through ST-003 (21 codes from spec)
- Rule Engine: score_sensor_data(data) — uses y-axis jolt threshold at speed >20kmh, cross-validation bonus for nearby reports
- Rule Engine: classify_image_result(vision_output) — maps categories to severity
- Rule Engine: classify_complaint(category, subcategory, description) — heuristic severity
- LLM: llm_analyze_sensor(data) — calls Grok (or returns mock if no API key)
- LLM: llm_analyze_image(image_data) — Grok Vision (or mock)
- LLM: llm_validate_complaint(complaint) — validates/overrides severity
- Fusion: fuse_classifications(rule_result, llm_result) — takes higher severity
- count_reports_in_radius(gps, radius_m=10, hours=4) — queries data_store

AGENT 3: backend/agents/sentinel.py
- ROLES dict with scope and permissions for all 5 roles
- verify_access(role, route) → bool
- log_action(action, role, user_id, outcome, details) → creates AuditEntry

AGENT 4: backend/agents/commander.py
- SPECIALIZATIONS mapping: roads→[Roads & Asphalt, Structural], water_pipeline→[Hydraulic & Plumbing], etc.
- SLA_HOURS: CRITICAL=4, HIGH=12, MEDIUM=48, LOW=168
- WEIGHTS: expertise=0.35, proximity=0.25, workload=0.20, shift=0.10, performance=0.10
- score_worker(worker, issue) → float (multi-factor scoring)
- find_best_worker(issue) → scores all available workers, returns best match
- assign_issue(issue_id) → assigns worker, calculates deadline, generates procedure via LLM (or mock), generates materials list
- preempt_for_critical(issue) → can reassign worker from LOW/MEDIUM to CRITICAL
- reassign(issue_id, new_worker_id, reason)
- get_workload() → returns workload distribution

ROUTERS (one per agent):
- backend/routers/nexus_router.py: POST /api/nexus/process, GET /api/nexus/status/{issue_id}
- backend/routers/cognos_router.py: POST /api/cognos/analyze-sensor, POST /api/cognos/analyze-image, POST /api/cognos/classify-complaint
- backend/routers/sentinel_router.py: GET /api/sentinel/audit
- backend/routers/commander_router.py: POST /api/commander/assign, GET /api/commander/workers, POST /api/commander/reassign, GET /api/commander/workload

Update backend/main.py to include all 4 new routers.

Use from data_store import data_store, from ws_manager import ws_manager, from config import settings for shared resources.
For LLM calls: if config.XAI_API_KEY exists, use langchain-xai. Otherwise, return realistic mock responses.
```

---

## 🟧 YASH — Frontend Lead

### Prompt: Phase 1 — Project Scaffolding (Frontend)

```
I am building an AI-powered civic infrastructure platform called InfraLens.

Your job: Scaffold the frontend project.

Steps:
1. Use Vite + React + TypeScript: the project should already be initialized in the frontend/ directory
2. Install these dependencies:
   - react-router-dom (routing)
   - framer-motion (animations)
   - recharts (charts)
   - lucide-react (icons)
   - clsx (conditional classnames)
   - date-fns (date formatting)
   - tailwindcss postcss autoprefixer (TailwindCSS v3)
3. Install mapcn.dev components — this is a MapLibre GL based map library following shadcn/ui patterns. Visit mapcn.dev for installation instructions. It provides <Map />, markers, popups with zero API key needed.
4. Configure tailwind.config.js with TailwindCSS v3 paths
5. Clean up default Vite boilerplate (remove App.css, remove default content from App.tsx)
6. Create a minimal App.tsx that just renders "InfraLens" text

Make sure npm run dev works on localhost:5173.
```

### Prompt: Phase 3 — Frontend Core Setup

```
I am building InfraLens — a civic infrastructure platform with 5 dashboards and 19 pages.

Your job: Set up the frontend core — design system, routing, auth, shared components.

Tech: React 19, TypeScript, Vite 6, TailwindCSS v3, Framer Motion, mapcn.dev (MapLibre GL maps), recharts, lucide-react

DESIGN SYSTEM (src/index.css):
- Import Google Fonts: Inter (300-800), Space Grotesk (400-700)
- CSS variables: --primary: #2563EB, --bg: #0A0A0F, --surface: #13131A, --surface-elevated: #1C1C27
- Severity: --critical: #EF4444, --high: #F97316, --medium: #EAB308, --low: #22C55E
- Text: --text-primary: #F1F5F9, --text-secondary: #94A3B8
- NEXUS: --nexus-glow: #A855F7
- Agent colors: cognos #06B6D4, vira #EC4899, commander #10B981, fleet #3B82F6, sentinel #EF4444, loop #059669, guardian #F59E0B, prescient #8B5CF6, oracle #D97706, field-copilot #14B8A6
- Glassmorphism: backdrop-filter blur(12px), semi-transparent backgrounds
- Animations: pulse, glow, slide-in, fade-in, orbit, data-packet-flow
- Dark mode default, dark scrollbar

ROUTING (src/App.tsx):
19 routes + login:
- /login → LoginPage
- /citizen/area-map, /citizen/my-cars, /citizen/report, /citizen/profile
- /bmc/dashboard, /bmc/workers, /bmc/completed, /bmc/reports
- /state/overview, /state/reports, /state/allocation, /state/accountability
- /worker/dashboard, /worker/tasks, /worker/assistant, /worker/profile
- /nexus/constellation, /nexus/events, /nexus/pipeline
Default redirect to /login. Wrap in AuthProvider. Use AnimatePresence for page transitions.

AUTH (src/context/AuthContext.tsx):
- Roles: citizen, bmc_supervisor, field_worker, state_official, nexus_admin
- login(role, userName) → sets state, redirects to role's home
- logout() → clears, back to /login
- useAuth() hook
- ProtectedRoute component (redirects if not authed)
- For hackathon: no real auth, just role selection

LOGIN PAGE (src/pages/LoginPage.tsx):
- 5 glassmorphic cards in centered grid (3+2 or responsive)
- Cards: Citizen (🏠), BMC Supervisor (🏢), Field Worker (👷), State Official (🏛️), NEXUS Admin (🧠)
- Each card: icon, role name, description, sample user name
- Dark background (#0A0A0F), gradient accent
- Hover: scale(1.05) + glow border
- Click → login → redirect
- InfraLens logo + "AI-Powered Civic Infrastructure Intelligence" tagline

HOOKS (src/hooks/):
- useWebSocket.ts: connect to ws://localhost:8000/ws/{channel}, auto-reconnect, onMessage callback, return { lastMessage, sendMessage, isConnected }
- useApi.ts: fetchApi(endpoint, options?) → fetch with base URL http://localhost:8000 + X-User-Role header from auth context
- useRealtime.ts: subscribes to WebSocket channel, pushes messages to state array, returns { events, clearEvents }

SHARED COMPONENTS (src/components/shared/):
Build 13 components. Each should accept appropriate props. Use TailwindCSS + CSS variables. Dark theme.
1. SeverityBadge — severity prop → colored badge (CRITICAL=red, HIGH=orange, MEDIUM=yellow, LOW=green)
2. StatusPill — status prop → pill (reported=gray, assigned=blue, in_progress=yellow, resolved=green, escalated=red)
3. KPICard — icon, value, label, trend (up/down/stable), todayBadge props → glassmorphic card with animated counter
4. MapView — center, zoom, markers, onMarkerClick props → mapcn.dev map wrapper
5. IssueDetailModal — issue prop → full modal with description, location minimap, severity, timeline, proof photos, feedback stars
6. CategoryIcon — category prop → maps to emoji (roads→🛣️, water→🚰, electrical→⚡, sanitation→🗑️, environment→🌳, structural→🏗️, traffic→🚦)
7. SourceIcon — source prop → maps to icon (car_sensor→🚗, 360_capture→📸, manual_complaint→✍️)
8. Chart — type (bar|line|donut|area), data, colors props → recharts wrapper
9. GlassCard — children, className props → glassmorphic container (blur, border, semi-transparent bg)
10. AnimatedCounter — value prop → counts up from 0 using Framer Motion
11. LoadingSpinner — InfraLens branded spinner
12. NotificationBell — count prop → bell icon with red badge
13. Timeline — steps prop (array of {label, timestamp, status}) → vertical timeline with active step highlighted

The design should be STUNNING — dark mode, glassmorphism, smooth animations, premium feel. Use Inter for body text, Space Grotesk for headings.
```

### Prompt: Phase 7 — Citizen + Worker Dashboards

```
I am building InfraLens frontend. The core (design system, auth, routing, shared components) is done.

Your job: Build 2 mobile-first dashboards — Citizen (4 pages) and Worker (4 pages).

Both dashboards use a mobile phone frame layout with bottom tab navigation.

Use the shared components from src/components/shared/ for badges, pills, maps, charts, etc.
Use mock data (hardcoded arrays of issues/tasks/workers) for now — we'll connect to backend APIs later.
Use mapcn.dev for all maps. Use Framer Motion for animations. Dark theme throughout.

CITIZEN DASHBOARD:
Layout: CitizenLayout.tsx with BottomTabNav (4 tabs: Map 🗺️, Cars 🚗, Report ✍️, Profile 👤)

Page 1.1 — AreaMapPage (/citizen/area-map):
- Header: InfraLens logo, NotificationBell, avatar
- Search bar + filter pills (All, Roads, Water, Electrical, Sanitation, Structural)
- mapcn Map (60% screen) with color-coded issue pins (red=reported, orange=assigned, yellow=in_progress, green=resolved)
- Pin click → mini card overlay: title, SeverityBadge, StatusPill, SourceIcon, "View Details"
- "Issues Near You" list below map (sorted by distance)
- FAB button → "Capture Hazard" / "File Complaint"
- IssueDetailModal on "View Details"

Page 1.2 — MyCarsPage (/citizen/my-cars):
- Horizontal scroll car cards (registration, model, issue count)
- Sub-tabs: Sensor Detections / 360° Captures
- Sensor list with severity badges, confidence, status
- 360° grid with thumbnails, AI classification
- Stats bar at bottom

Page 1.3 — ReportPage (/citizen/report):
- Camera placeholder (button to simulate)
- AI detection banner (mock result)
- 7 category tiles grid with icons
- Location with mini map
- Description textarea with mic icon
- Severity selector (3 options)
- Submit → success screen with complaint ID

Page 1.4 — ProfilePage (/citizen/profile):
- Profile card, quick stats (3 cards), complaints list with filter tabs, settings, logout

WORKER DASHBOARD:
Layout: WorkerLayout.tsx with WorkerTabNav (4 tabs: Home 🏠, Tasks 📋, AI 🤖, Profile 👤)

Page 4.1 — DashboardPage (/worker/dashboard):
- "Good morning, Ganesh 👷" greeting
- 3 stat cards: Assigned, Completed, Pending
- Task map (50%) with numbered priority pins + route line
- Next task card with Navigate + Start buttons

Page 4.2 — TasksPage (/worker/tasks):
- View A: task card list with severity borders, escalation banners, filters
- View B (on click): full task detail — severity banner, location+map, assignment info, team, procedure accordion (checkable steps!), materials checklist, Start/Upload Proof/Complete buttons

Page 4.3 — AssistantPage (/worker/assistant):
- Language toggle EN/HI, task context badge
- Chat bubbles (WhatsApp-style)
- Text input + large voice button (pulsing hold animation) + camera button
- Quick action buttons: "What's next?", "I'm stuck", "Safety protocol?"

Page 4.4 — ProfilePage (/worker/profile):
- Profile header, 4 performance stat cards, completed tasks list, certifications, settings

Design must be mobile-responsive, premium dark UI. Phone frame aspect ratio.
```

### Prompt: Phase 8 — BMC + State Dashboards

```
I am building InfraLens frontend. Citizen and Worker dashboards are done.

Your job: Build 2 desktop dashboards — BMC (4 pages) and State Government (4 pages).

Both use desktop sidebar navigation (left sidebar + main content area).
Use shared components, mock data, mapcn.dev maps, recharts charts. Dark theme.

BMC DASHBOARD (bmc_supervisor role):
Layout: BMCLayout.tsx with Sidebar (4 items: Dashboard 📊, Workers 👷, Completed ✅, Reports 📈)

Page 2.1 — IssuesDashboard (/bmc/dashboard):
- 4 KPI cards: Active Issues, Resolved Today, Workers On-Task, Avg Resolution
- Issue priority queue table sorted by Confidence Score (descending). Color-code: 80+=red, 60-80=orange, <60=yellow
- Columns: Priority, Confidence, Issue, Location, Reports (🚗×4 📸×1), Severity, Status, Assigned To, Deadline
- Row click → IssueDetailPanel slide-in from right
- Filter bar: severity, category, status, ward, date range
- Real-time activity feed (right 35%): mock agent events with agent icons + colors

Page 2.2 — WorkersPage (/bmc/workers):
- Worker summary strip (Total, Available, On Task, Off Duty)
- Worker map (top 50%): GPS pins color-coded by status
- Worker table: Name, Specialization, Status badge, Current Task, Zone, Tasks Today, Avg Resolution, Rating
- Row click → detail sidebar

Page 2.3 — CompletedPage (/bmc/completed):
- Summary strip: Resolved/Avg Time/SLA/Satisfaction
- Completed table with proof thumbnails, SLA red/green indicator
- Export buttons

Page 2.4 — ReportsPage (/bmc/reports):
- Generate Weekly Report button
- Report preview: narrative + metrics table
- 5 recharts: Issues Trend (line), Category Distribution (donut), Ward Heatmap, Worker Leaderboard, SLA Compliance (line)

STATE GOVERNMENT DASHBOARD (state_official role):
Layout: StateLayout.tsx with StateSidebar (4 items: Overview 🏛️, Reports 📑, Allocation 💰, Accountability 🏆)

Page 3.1 — OverviewPage (/state/overview):
- 5 KPI cards: Total MCs, Issues This Week, Resolution Rate, Avg Time, Overdue
- State map with MC regions color-coded (green≥80%, yellow 60-79%, red<60%)
- MC Performance table: all columns from spec, sortable
- Escalation alerts panel: GUARDIAN alerts with "Escalate" button

Page 3.2 — WeeklyReports (/state/reports):
- Left panel (35%): report inbox list with MC name, date, New/Reviewed badge
- Right panel (65%): selected report viewer — narrative, metrics, charts

Page 3.3 — AllocationPage (/state/allocation):
- ORACLE header with status badge + total budget card
- MC allocation table: recommended, current, adjusted (EDITABLE INPUT), rationale, performance flag
- Resource recommendations with Approve/Reject/Modify buttons
- Sticky approval bar at bottom

Page 3.4 — AccountabilityPage (/state/accountability):
- MC scorecard grid: A-F grades with metric indicators
- League table: ranked 1-N with gold/silver/bronze top 3
- Trend charts: resolution rate overlay + issue volume stacked area
```

### Prompt: Phase 9 — NEXUS Agent Dashboard (THE WOW PAGE)

```
I am building InfraLens frontend. This is THE most important visual page — the NEXUS Agent Dashboard.

Your job: Build 3 pages for an immersive, cinema-grade agent visualization dashboard.

Design: Deep space dark theme (#08080D background). Glassmorphic elements. Neon glow effects. This should WOW anyone who sees it.

Layout: NexusLayout.tsx — full-screen dark canvas, NO sidebar. Minimal semi-transparent top bar with 3 tab links + system health indicator + live clock.

Agent theme colors:
- COGNOS: #06B6D4 (cyan), VIRA: #EC4899 (pink), COMMANDER: #10B981 (green)
- FLEET: #3B82F6 (blue), SENTINEL: #EF4444 (red), LOOP: #059669 (emerald)
- GUARDIAN: #F59E0B (amber), PRESCIENT: #8B5CF6 (purple), ORACLE: #D97706 (gold)
- FIELD_COPILOT: #14B8A6 (teal), NEXUS center: #A855F7 (purple glow)

PAGE 5.1 — ConstellationPage (/nexus/constellation):
Central NEXUS node:
- Exact center of screen
- Large circular node with animated rotating brain icon (CSS 3D rotation)
- Glowing purple ring (#A855F7) with breathing pulse animation
- Particle effects radiating outward when NEXUS processes something

10 satellite agent nodes in orbital arrangement around NEXUS:
- Each is a glassmorphic card (~80x80px): icon, agent name, subtitle, colored border, status dot (green/yellow/red), "2s ago" timestamp
- Arranged in a circle/ellipse orbit

Connection lines (SVG/Canvas):
- Glowing lines from NEXUS center to each agent
- Default: dim, 40% opacity, thin
- When active: bright with agent's theme color, thick
- Animated data packet dots traveling along active lines
- Labels appear on active lines: "ISS-0042 classified → HIGH"
- Use CSS animations or Framer Motion for the packet travel animation

Animation triggers (use mock timer or WebSocket):
- Every few seconds, randomly activate a connection line to simulate live agent communication
- Show different patterns: VIRA→NEXUS→COGNOS→COMMANDER, GUARDIAN flashing, LOOP glowing green

Click agent → AgentDetailPanel slides in from right:
- Agent info, status, "powered by" text, portal served
- Live stats: actions today, avg response time, last action
- Recent 20 actions log
- Sample JSON output (code block)
- Close button

Live ticker at bottom: horizontally scrolling agent actions, color-coded by agent

PAGE 5.2 — EventStreamPage (/nexus/events):
- Filter bar: agent multi-select (each with color dot), severity, portal, time range, search, pause/resume
- Auto-scrolling event feed: cards with agent badge (colored), action text, issue ID link, portal tag, timestamp, expandable JSON payload
- Stats sidebar (right 25%): agent activity heatmap, events/min sparkline

PAGE 5.3 — PipelinePage (/nexus/pipeline):
- Issue selector dropdown (recent issues)
- Horizontal L→R pipeline diagram: glassmorphic cards connected by arrows
- Each node: agent icon, name, action, collapsed I/O, duration, status (✅/🔄/⏳)
- Completed = green glow, current = pulse, pending = dim
- Timeline strip below with timestamps
- Issue context panel (right 30%)

Use Framer Motion for all animations. Canvas or SVG for connection lines. Make it look like a sci-fi mission control.
```

---

## 🟩 PIYUSH — Backend Agent Dev

### Prompt: Phase 5 — Agents VIRA, GUARDIAN, PRESCIENT, FLEET

```
I am building InfraLens. The backend core is already built (models.py, data_store.py, ws_manager.py, config.py).

Your job: Create 4 AI agents + their FastAPI routers.

Import these from existing files:
- from data_store import data_store
- from ws_manager import ws_manager
- from config import settings
- from models import Issue, Worker, DailyReport, AuditEntry, AgentEvent, etc.

DO NOT modify: models.py, data_store.py, main.py, ws_manager.py

AGENT 1: backend/agents/vira.py — Citizen Chat Interface
- detect_mode(message) → "report" | "query" | "general"
- Report mode: extract_complaint_data(message) using Grok LLM with prompt template → extracts category, subcategory, severity, location_text
- Report mode: create_issue_from_chat(extracted_data, user_id) → creates Issue via data_store, returns confirmation
- Query mode: handle_status_query(message, user_id) → fetches issue, generates conversational status
- General mode: handle_general(message) → answers about InfraLens
- Main entry: chat(user_id, message, session_history) → detects mode, routes, returns {response, action_taken, extracted_data}
- In-memory chat sessions dict[str, list]
- If no API key, use rule-based extraction (keyword matching for categories)

AGENT 2: backend/agents/guardian.py — Deadline Monitor
- OVERDUE_THRESHOLDS: CRITICAL=30min, HIGH=240min, MEDIUM=480min, LOW=1440min
- check_overdue_tasks() → scans active issues, compares current time vs deadline
- check_mc_performance() → calculates MC resolution rates, flags <60%
- check_repeated_failures(gps, radius_m=10) → finds 3+ re-reports at same location
- auto_escalate_critical() → auto-flags CRITICAL past SLA, broadcasts via WebSocket
- escalate(issue_id, escalated_by) → manual escalation, updates status, broadcasts
- generate_alert(issue, alert_type) → structured alert object
- run_monitoring_cycle() → runs all checks, broadcasts alerts

AGENT 3: backend/agents/prescient.py — Reporting
- generate_daily_report(mc_id, date=None) → aggregates from data_store: received/resolved/pending/overdue, by_category, by_severity, worst_wards, worker_utilization, avg_time. Generates AI narrative via Grok (or mock). Returns DailyReport.
- generate_weekly_digest() → state-level cross-MC summary with trends
- generate_forecast(mc_id) → predictive warnings

AGENT 4: backend/agents/fleet.py — Pattern Analytics
- detect_geographic_clusters(radius_m=500, min_count=5, days=7) → GPS grouping
- detect_seasonal_trends() → current vs historical comparison
- detect_category_anomalies(threshold_pct=50) → flag unusual spikes
- compare_mc_performance() → rank all MCs
- detect_recurrence(days=60) → find repeat GPS reports
- generate_insights() → run all, generate LLM summary

ROUTERS:
- vira_router.py: POST /api/vira/chat {user_id, message}, POST /api/vira/voice {user_id, transcribed_text}
- guardian_router.py: GET /api/guardian/alerts, POST /api/guardian/escalate {issue_id, escalated_by}, GET /api/guardian/overdue
- prescient_router.py: GET /api/prescient/daily/{mc_id}, GET /api/prescient/weekly, GET /api/prescient/forecast/{mc_id}, POST /api/prescient/generate
- fleet_router.py: GET /api/fleet/patterns, GET /api/fleet/insights, GET /api/fleet/compare, GET /api/fleet/trends
```

---

## 🟪 AMIT — Backend Agent Dev + Data

### Prompt: Phase 6 — Agents LOOP, ORACLE, FIELD_COPILOT + Seed Data

```
I am building InfraLens. The backend core is already built (models.py, data_store.py, ws_manager.py, config.py).

Your job: Create 3 AI agents + seed data + their FastAPI routers + notifications router.

Import these from existing files:
- from data_store import data_store
- from ws_manager import ws_manager
- from config import settings
- from models import Issue, Worker, DailyReport, MC, etc.

DO NOT modify: models.py, data_store.py, main.py, ws_manager.py

SEED DATA (create these FIRST):

backend/seed_data/mcs.json — 8 Municipal Corporations:
BMC Mumbai (mc_id: bmc-mumbai, resolution_rate: 85.9, avg_hours: 4.2, workers: 42)
PMC Pune (pmc-pune, 82.1, 4.8, 35)
NMC Nagpur (nmc-nagpur, 55.0, 8.2, 22)
NMC Nashik (nmc-nashik, 68.3, 6.5, 18)
TMC Thane (tmc-thane, 78.4, 5.1, 28)
RMC Ratnagiri (rmc-ratnagiri, 72.0, 5.8, 12)
KMC Kolhapur (kmc-kolhapur, 75.2, 5.5, 15)
AMC Aurangabad (amc-aurangabad, 62.1, 7.2, 20)

backend/seed_data/workers.json — 20 workers with real Mumbai GPS coordinates, varied specializations (Roads, Hydraulic, Electrical, Sanitation, Structural, Traffic), statuses (8 available, 8 on_task, 4 off_duty), performance (ratings 3.2-4.8).

backend/seed_data/issues.json — 30 issues: 10 car_sensor source (potholes with accelerometer data), 8 360_capture (road hazards with image refs), 12 manual_complaint (water/electrical/sanitation). Mix all severities and statuses. Use real Mumbai/Pune/Nagpur GPS. Include procedures and materials for assigned issues. Link to workers via assigned_to.

backend/seed_data/reports.json — 5 daily reports (3 Mumbai, 1 Pune, 1 Nagpur).

AGENT 1: backend/agents/loop.py — Completion Verification
- submit_proof(issue_id, images, notes) → status to pending_verification
- verify_completion(issue_id, verifier_id, approved, rejection_reason) → if approved: resolve + calculate time + check SLA + notify citizen; if rejected: back to in_progress
- notify_citizen(issue_id) → check reporter_id != "SENSOR-AUTO", broadcast notification
- submit_feedback(issue_id, reporter_id, rating, comment) → store, update worker rating
- check_rereport(gps, radius_m=10, days=30) → find resolved issues nearby, flag failed repair
- get_feedback_metrics(mc=None) → aggregate ratings

AGENT 2: backend/agents/oracle.py — Fund Allocation
- recommend_fund_allocation() → analyze MC data, calculate allocations (15% emergency reserve), generate rationale
- recommend_resource_allocation() → equipment + crew recommendations based on utilization gaps
- approve_fund_allocation(allocation_id, approved_by, modifications) → validate total, record
- approve_resource_allocation(recommendation_id, approved_by, action)
- get_budget_tracker() → per MC allocated/spent/remaining

AGENT 3: backend/agents/field_copilot.py — Worker AI Assistant
- REPAIR_KNOWLEDGE dict for each category
- SAFETY_PROTOCOLS dict
- COPILOT_PROMPT template (context-aware, temperature=0.1)
- chat(worker_id, message, task_context) → build context from task + knowledge, call Grok (or mock)
- voice_chat(worker_id, transcribed_text, task_context, language) → same + TTS via Sarvam (or mock)
- predict_diagnosis(task_context) → predict root cause + approach

ROUTERS:
- loop_router.py: POST /api/loop/verify, POST /api/loop/feedback, GET /api/loop/metrics
- oracle_router.py: GET /api/oracle/recommend-funds, POST /api/oracle/approve-funds, GET /api/oracle/recommend-resources, POST /api/oracle/approve-resources, GET /api/oracle/budget-tracker
- field_copilot_router.py: POST /api/field-copilot/chat, POST /api/field-copilot/voice, POST /api/field-copilot/predict
- notifications_router.py: GET /api/notifications?user_id=X, POST /api/notifications/read
```

---

*InfraLens Prompts — Copy, paste, build. No confusion.*
