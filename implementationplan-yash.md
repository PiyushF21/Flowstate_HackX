# InfraLens — Yash's Implementation Plan

> **Role:** Frontend Lead
> **Owns:** Entire `frontend/` directory — React 19 + Vite 6 + TailwindCSS v4, all 5 dashboards (19 pages), design system, mapcn.dev maps, Framer Motion animations

---

## Phase 1: Project Scaffolding (Parallel with Stavan)

### What to Build

1. **Scaffold Vite + React + TypeScript:**
   ```bash
   cd frontend
   npx -y create-vite@latest ./ --template react-ts
   ```

2. **Install dependencies:**
   ```bash
   npm install react-router-dom framer-motion recharts lucide-react clsx date-fns
   npm install -D @tailwindcss/vite
   ```

3. **Install mapcn.dev (MapLibre GL):**
   - Follow mapcn.dev installation docs
   - Add map components to `src/components/shared/MapView.tsx`
   - No API key needed (uses free CARTO/OpenStreetMap tiles)

4. **Configure TailwindCSS v4:**
   - Add `@tailwindcss/vite` plugin to `vite.config.ts`
   - Set up `src/index.css` with `@import "tailwindcss"` 

5. **Verify:** `npm run dev` → blank React app loads on `http://localhost:5173`

### Verification
- Vite dev server runs without errors
- TailwindCSS classes render correctly
- mapcn map component renders a map

---

## Phase 3: Frontend Core Setup

### What to Build

#### 1. `src/index.css` — Complete Design System

```css
/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');

/* Design tokens as CSS variables */
:root {
  --primary: #2563EB;
  --bg: #0A0A0F;
  --surface: #13131A;
  --surface-elevated: #1C1C27;
  --critical: #EF4444;
  --high: #F97316;
  --medium: #EAB308;
  --low: #22C55E;
  --text-primary: #F1F5F9;
  --text-secondary: #94A3B8;
  --nexus-glow: #A855F7;
  
  /* Agent theme colors */
  --agent-cognos: #06B6D4;
  --agent-vira: #EC4899;
  --agent-commander: #10B981;
  --agent-fleet: #3B82F6;
  --agent-sentinel: #EF4444;
  --agent-loop: #059669;
  --agent-guardian: #F59E0B;
  --agent-prescient: #8B5CF6;
  --agent-oracle: #D97706;
  --agent-field-copilot: #14B8A6;
}

/* Glassmorphism */
/* Animations keyframes: pulse, glow, slide-in, fade-in, orbit, data-packet */
/* Dark scrollbar */
/* Base styles */
```

#### 2. `src/App.tsx` — Router Configuration

```tsx
// Routes:
// /login → LoginPage
// /citizen/area-map → AreaMapPage
// /citizen/my-cars → MyCarsPage
// /citizen/report → ReportPage
// /citizen/profile → ProfilePage (citizen)
// /bmc/dashboard → IssuesDashboard
// /bmc/workers → WorkersPage
// /bmc/completed → CompletedPage
// /bmc/reports → ReportsPage
// /state/overview → OverviewPage
// /state/reports → WeeklyReports
// /state/allocation → AllocationPage
// /state/accountability → AccountabilityPage
// /worker/dashboard → DashboardPage (worker)
// /worker/tasks → TasksPage
// /worker/assistant → AssistantPage
// /worker/profile → ProfilePage (worker)
// /nexus/constellation → ConstellationPage
// /nexus/events → EventStreamPage
// /nexus/pipeline → PipelinePage
```

#### 3. `src/context/AuthContext.tsx`

```tsx
// Roles: citizen | bmc_supervisor | field_worker | state_official | nexus_admin
// login(role, userName) → sets state → redirects to role's home page
// logout() → clears → back to /login
// useAuth() hook
// ProtectedRoute component
```

#### 4. `src/pages/LoginPage.tsx` — Role Selection

- 5 glassmorphic role cards in a centered grid
- Each card: role icon, role title, description, demo user name
- Hover effects (scale + glow)
- Click → login as that role → redirect
- InfraLens logo + tagline at top
- Deep dark background with subtle gradient

#### 5. `src/hooks/`

- `useWebSocket.ts` — Connect to `ws://localhost:8000/ws/{channel}`, auto-reconnect, message handler
- `useApi.ts` — `fetchApi(endpoint, options)` → adds base URL + X-User-Role header
- `useRealtime.ts` — Subscribes to WebSocket channel, returns live data array

#### 6. `src/components/shared/` — 13 Shared Components

| Component | Description |
|---|---|
| `SeverityBadge.tsx` | CRITICAL/HIGH/MEDIUM/LOW colored badge (red/orange/yellow/green) |
| `StatusPill.tsx` | Reported/Assigned/In Progress/Resolved pill with color |
| `KPICard.tsx` | Metric card: icon, value (animated counter), label, trend arrow, "+today" badge |
| `MapView.tsx` | mapcn.dev map wrapper — accepts markers, onClick, center, zoom |
| `IssueDetailModal.tsx` | Full issue detail: description, location, timeline, proof photos, feedback |
| `CategoryIcon.tsx` | Maps category string to emoji icon |
| `SourceIcon.tsx` | Sensor 🚗 / 360° 📸 / Manual ✍️ icon |
| `Chart.tsx` | Recharts wrapper — bar, line, donut, area chart variants |
| `GlassCard.tsx` | Glassmorphic card container with blur + border |
| `AnimatedCounter.tsx` | Counts up from 0 to value on mount (Framer Motion) |
| `LoadingSpinner.tsx` | Branded loading spinner (InfraLens themed) |
| `NotificationBell.tsx` | Bell icon with red badge count |
| `Timeline.tsx` | Vertical timeline: Reported → Assigned → In Progress → Resolved |

### Verification
- Login page renders with 5 role cards
- Clicking a role redirects to correct dashboard path
- All shared components render without errors
- Map renders with default tiles via mapcn
- Design system colors, fonts, glassmorphism visible

---

## Phase 7: Citizen + Worker Dashboards (Mobile-First)

### What to Build

#### Citizen Dashboard (4 pages)

**Components to create first (`src/components/citizen/`):**
- `CitizenLayout.tsx` — Mobile phone frame wrapper with bottom tab navigation
- `BottomTabNav.tsx` — 4 tabs: Area Map 🗺️ | My Cars 🚗 | Report ✍️ | Profile 👤
- `IssuePin.tsx` — Map marker component with status color
- `CarCard.tsx` — Horizontal scroll car card (registration, model, issue count)
- `CategoryTile.tsx` — Selectable 7-category grid tile with icon
- `ViraChat.tsx` — VIRA chat floating widget (text + voice input)

**Pages:**

| Page | Route | Key Features |
|---|---|---|
| `AreaMapPage.tsx` | `/citizen/area-map` | Header, search+filter strip, mapcn map (60% screen) with color-coded pins, pin click mini-card, "Issues Near You" list, FAB (capture/report), IssueDetailModal |
| `MyCarsPage.tsx` | `/citizen/my-cars` | Horizontal car scroller, sub-tabs (Sensor/360°), detection list, "Needs Your Help" flow, stats bar |
| `ReportPage.tsx` | `/citizen/report` | Camera section, AI detection banner, category grid, location+minimap, description+voice, severity, submit→success |
| `ProfilePage.tsx` | `/citizen/profile` | Profile card, quick stats, complaints list w/ filters, settings, logout |

#### Worker Dashboard (4 pages)

**Components to create first (`src/components/worker/`):**
- `WorkerLayout.tsx` — Mobile frame with bottom tab nav
- `WorkerTabNav.tsx` — 4 tabs: Dashboard 🏠 | Tasks 📋 | AI 🤖 | Profile 👤
- `TaskCard.tsx` — Task list card with severity border + escalation banner
- `TaskDetail.tsx` — Full task detail view
- `ProcedureAccordion.tsx` — Checkable step-by-step procedure
- `ProofUpload.tsx` — Camera + photo grid + notes
- `CopilotChat.tsx` — FIELD_COPILOT chat with voice + camera

**Pages:**

| Page | Route | Key Features |
|---|---|---|
| `DashboardPage.tsx` | `/worker/dashboard` | Greeting, stats row, task map (50%), next task card, recent completions |
| `TasksPage.tsx` | `/worker/tasks` | View A: task list w/ filters; View B: full task detail with procedure accordion, materials, team, proof upload, action buttons |
| `AssistantPage.tsx` | `/worker/assistant` | Language toggle, task context badge, chat bubbles, text input + voice button (hold-to-talk) + camera, quick actions, waveform playback |
| `ProfilePage.tsx` | `/worker/profile` | Profile header, performance stats, completed tasks, certifications, settings |

### Verification
- Citizen: all 4 pages render with mock data
- Citizen: map shows issue pins with correct colors
- Citizen: category selector works, report form submits
- Worker: all 4 pages render with mock data
- Worker: task list shows cards, detail view with procedure accordion
- Worker: chat interface accepts text input
- Both: bottom tab navigation works
- Both: mobile-responsive layout (phone-frame styling)

---

## Phase 8: BMC + State Dashboards (Desktop)

### What to Build

#### BMC Dashboard (4 pages)

**Components (`src/components/bmc/`):**
- `BMCLayout.tsx` — Desktop layout: sidebar (left) + content (right)
- `Sidebar.tsx` — 4 nav items with icons + active state
- `IssueTable.tsx` — Sortable/filterable issues table with confidence score column
- `IssueDetailPanel.tsx` — Slide-in panel from right with full issue data
- `ActivityFeed.tsx` — Real-time agent action stream (auto-scroll, color-coded)
- `WorkerMap.tsx` — mapcn map with worker GPS pins
- `WorkerTable.tsx` — Worker data table with performance columns
- `ConfidenceScore.tsx` — Color-coded score display (red 80+, orange 60-80, yellow <60)
- `ReportGenerator.tsx` — PRESCIENT report trigger + preview

**Pages:**

| Page | Route | Key Features |
|---|---|---|
| `IssuesDashboard.tsx` | `/bmc/dashboard` | 4 KPI cards, issue priority queue table (sorted by confidence), filter bar, row-click detail panel, real-time activity feed (right 35%) |
| `WorkersPage.tsx` | `/bmc/workers` | Worker summary strip, worker map (top 50%), worker table (bottom), row-click detail sidebar |
| `CompletedPage.tsx` | `/bmc/completed` | Summary strip, completed issues table with proof thumbnails, SLA indicators, export buttons |
| `ReportsPage.tsx` | `/bmc/reports` | Generate report button, date range, report preview (narrative + charts), analytics section (5 charts), past reports archive |

#### State Dashboard (4 pages)

**Components (`src/components/state/`):**
- `StateLayout.tsx` — Desktop sidebar layout (formal design)
- `StateSidebar.tsx` — 4 nav items
- `StateMap.tsx` — Maharashtra map with MC regions color-coded by performance
- `MCPerformanceTable.tsx` — MC comparison table with all columns
- `EscalationPanel.tsx` — GUARDIAN alert cards with "Escalate" button
- `ReportViewer.tsx` — Rich report display (narrative + charts + metrics)
- `AllocationTable.tsx` — Editable fund allocation table with validation
- `ScorecardGrid.tsx` — MC accountability grade cards
- `LeagueTable.tsx` — Ranked MC leaderboard with gold/silver/bronze

**Pages:**

| Page | Route | Key Features |
|---|---|---|
| `OverviewPage.tsx` | `/state/overview` | 5 KPI cards, state map with MC regions, MC performance table, escalation alerts panel |
| `WeeklyReports.tsx` | `/state/reports` | Report inbox (left 35%), report viewer (right 65%) with charts, Mark Reviewed action |
| `AllocationPage.tsx` | `/state/allocation` | ORACLE panel, MC allocation table (editable), resource recommendations with approve/reject, sticky approval bar |
| `AccountabilityPage.tsx` | `/state/accountability` | Scorecard grid (A-F grades), league table, trend charts, anomaly highlights |

### Verification
- BMC: all 4 pages render with mock data
- BMC: issue table sorts by confidence, filter bar works
- BMC: issue detail panel slides in on row click
- BMC: activity feed displays agent events
- State: all 4 pages render
- State: map shows MC regions with color coding
- State: allocation table is editable with total validation
- Both: sidebar navigation works, active state highlights

---

## Phase 9: NEXUS Agent Dashboard (Immersive — THE WOW PAGE)

### What to Build

**Components (`src/components/nexus/`):**
- `NexusLayout.tsx` — Full-screen dark canvas (`#08080D` background), no sidebar
- `NexusTopBar.tsx` — Minimal semi-transparent top bar with 3 tabs + system health
- `AgentNode.tsx` — Glassmorphic card (80×80px) with unique color border, icon, name, status dot, "last action" timestamp
- `NexusCentralNode.tsx` — Central NEXUS brain: glowing purple ring (`#A855F7`), rotating brain icon (CSS animation), pulsing breathing effect, particle effects on action
- `ConnectionLine.tsx` — SVG line from NEXUS to agent: dim normally, lights up bright with agent color when active, label appears on line showing data flow
- `DataPacket.tsx` — Animated dot traveling along connection line (agent color, CSS/Framer Motion)
- `AgentDetailPanel.tsx` — Slide-in from right: agent name+icon, stats, recent 20 actions, sample JSON
- `LiveTicker.tsx` — Bottom horizontal scrolling ticker: agent actions color-coded
- `EventCard.tsx` — Event stream entry card with agent badge, action, issue ID, portal tag, timestamp, expandable JSON
- `PipelineNode.tsx` — Pipeline step card: agent icon, action, input/output (collapsed), duration, status (complete/in-progress/pending)
- `PipelineArrow.tsx` — Arrow connecting pipeline nodes

**Pages:**

| Page | Route | Key Features |
|---|---|---|
| `ConstellationPage.tsx` | `/nexus/constellation` | Central NEXUS node with 10 satellite agents in orbital arrangement, connection lines with real-time animations, click agent → detail panel, live ticker at bottom |
| `EventStreamPage.tsx` | `/nexus/events` | Multi-filter bar (agent/severity/portal/time), pause/resume, auto-scrolling event feed, stats sidebar (heatmap, events/min) |
| `PipelinePage.tsx` | `/nexus/pipeline` | Issue selector dropdown, horizontal pipeline diagram (L→R), timeline strip, issue context panel (right 30%) |

### Design Details

**Agent Orbital Positions (circular arrangement around center):**
```
                    COGNOS (top)
           VIRA                 COMMANDER
     FLEET                           SENTINEL
        
    PRESCIENT                         LOOP
     
       ORACLE                  GUARDIAN
            FIELD_COPILOT (bottom)
```

**Real-time animations (WebSocket-driven):**
- New complaint → VIRA line lights up pink → data packet travels to NEXUS → NEXUS pulses → COGNOS line lights up cyan → packet to COGNOS
- Classification complete → COGNOS → NEXUS → COMMANDER line lights up green
- Assignment complete → COMMANDER line glows → broadcast
- Overdue detected → GUARDIAN line flashes amber urgently
- Task verified → LOOP line glows emerald → NEXUS success pulse

### Verification
- Constellation renders with NEXUS center + 10 agent nodes in orbit
- Connection lines visible between NEXUS and each agent
- Clicking an agent opens detail panel
- Event stream shows mock events with correct styling
- Pipeline visualizer shows step-by-step flow
- Live ticker scrolls at bottom
- All animations are smooth (60fps)
- Dark theme is immersive and cinema-grade

---

## Phase 10: Integration (Yash's Part)

### What to Do

1. **Replace all mock data with real API calls:**
   - Use `useApi` hook to fetch from backend
   - Citizen pages → `/api/issues`, `/api/vira/chat`
   - BMC pages → `/api/issues`, `/api/commander/workers`, `/api/prescient/daily`
   - State pages → `/api/fleet/compare`, `/api/oracle/recommend-funds`, `/api/prescient/weekly`
   - Worker pages → `/api/tasks/mine`, `/api/field-copilot/chat`
   - NEXUS pages → `/api/nexus/status`, WebSocket `agent_events` channel

2. **WebSocket integration:**
   - BMC Activity Feed → subscribe to `agent_events` channel
   - State Escalation Panel → subscribe to `escalations` channel
   - Worker Tasks → subscribe to `tasks` channel
   - Citizen Notifications → subscribe to `notifications` channel
   - NEXUS Constellation → subscribe to `agent_events`, drive animations

3. **Voice integration:**
   - VIRA (Citizen ReportPage): Web Speech API for STT, send transcribed text to `/api/vira/chat`
   - FIELD_COPILOT (Worker AssistantPage): Web Speech API STT, send to `/api/field-copilot/voice`
   - TTS playback: Sarvam AI or browser `speechSynthesis` fallback

4. **Final polish:**
   - Page transitions (Framer Motion `AnimatePresence`)
   - Loading states for all data fetches
   - Error handling (toast notifications)
   - Responsive tweaks
   - Cross-browser check (Chrome, Safari)

### Verification
- Login → each role → data loads from backend
- Issue reported via citizen → appears on BMC dashboard in real-time
- NEXUS constellation animates when backend processes an issue
- Voice input works in Chrome
- No console errors anywhere

---

## Files Yash Owns (NO ONE else modifies)

```
frontend/                    # Entire directory
```

---

*Yash — Frontend Lead, InfraLens*
