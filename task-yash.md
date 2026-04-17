# InfraLens — Yash's Task Tracker

> **Role:** Frontend Lead
> **Updated:** Phase-wise checklist — check off items as you complete them
> ⚡ **Start Day 1 Morning — fully independent, no backend dependencies**

---

## Phase 1: Scaffolding (Day 1 Morning — PARALLEL with all)

- [ ] Scaffold Vite + React + TS: `npx -y create-vite@latest ./ --template react-ts`
- [ ] Install dependencies: `react-router-dom`, `framer-motion`, `recharts`, `lucide-react`, `clsx`, `date-fns`
- [ ] Install TailwindCSS v3: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
- [ ] Configure `tailwind.config.js` with content paths and directives into index.css
- [ ] Install mapcn.dev components (follow mapcn.dev docs)
- [ ] Clean default Vite boilerplate (remove App.css, assets)
- [ ] Verify: `npm run dev` runs on localhost:5173
- [ ] Verify: TailwindCSS classes render
- [ ] Verify: mapcn Map component renders
- [ ] Commit: `feat: frontend scaffold — Vite + React + TS + TailwindCSS + mapcn`

---

## Phase 2: Frontend Core Setup (Day 1 — PARALLEL with all)

### Design System
- [ ] Create `src/index.css` — import Google Fonts (Inter, Space Grotesk)
- [ ] Add all CSS variables (primary, bg, surface, severity colors, agent colors)
- [ ] Add glassmorphism utility classes
- [ ] Add animation keyframes (pulse, glow, slide-in, fade-in, orbit, data-packet)
- [ ] Add dark scrollbar styles
- [ ] Add base body styles (dark theme default)
- [ ] Verify: CSS variables accessible, fonts load, animations work

### Routing & Auth
- [ ] Create `src/App.tsx` — React Router with all 20 routes
- [ ] Create `src/context/AuthContext.tsx` — AuthProvider, login/logout, useAuth hook
- [ ] Create ProtectedRoute component (redirects to /login if not authed)
- [ ] Verify: routes resolve without errors, protected routes redirect

### Login Page
- [ ] Create `src/pages/LoginPage.tsx` — 5 role cards in grid
- [ ] Style: glassmorphic cards, dark background, hover scale+glow
- [ ] InfraLens logo + tagline at top
- [ ] Click card → login → redirect to role's home
- [ ] Verify: each role redirects correctly

### Hooks
- [ ] Create `src/hooks/useWebSocket.ts` — WebSocket connect, auto-reconnect, message handler
- [ ] Create `src/hooks/useApi.ts` — fetchApi with base URL + auth header
- [ ] Create `src/hooks/useRealtime.ts` — subscribe to WS channel, return live data

### Utility
- [ ] Create `src/lib/utils.ts` — clsx helper, date formatters

- [ ] Commit: `feat(frontend): design system, auth, routing, login page, hooks`

---

## Phase 3: Shared Components (Day 1–2 — PARALLEL with all)

### Shared Components (13)
- [ ] Create `SeverityBadge.tsx` — colored badge (CRITICAL/HIGH/MEDIUM/LOW)
- [ ] Create `StatusPill.tsx` — status indicator pill with color
- [ ] Create `KPICard.tsx` — metric card with icon, animated value, label, trend
- [ ] Create `MapView.tsx` — mapcn.dev wrapper (markers, onClick, center, zoom)
- [ ] Create `IssueDetailModal.tsx` — full issue detail modal
- [ ] Create `CategoryIcon.tsx` — category → emoji mapping
- [ ] Create `SourceIcon.tsx` — source type → icon mapping
- [ ] Create `Chart.tsx` — Recharts wrapper (bar, line, donut, area)
- [ ] Create `GlassCard.tsx` — glassmorphic card container
- [ ] Create `AnimatedCounter.tsx` — count-up animation (Framer Motion)
- [ ] Create `LoadingSpinner.tsx` — branded spinner
- [ ] Create `NotificationBell.tsx` — bell with badge count
- [ ] Create `Timeline.tsx` — vertical status timeline
- [ ] Verify: all 13 components render correctly in isolation
- [ ] Commit: `feat(frontend): 13 shared components`

---

## Phase 4: Citizen + Worker Dashboards — Mobile-First (Day 2 — PARALLEL with backend testing)

### Citizen Components
- [ ] Create `CitizenLayout.tsx` — mobile phone frame + bottom tabs
- [ ] Create `BottomTabNav.tsx` — 4 tabs (Map, Cars, Report, Profile)
- [ ] Create `IssuePin.tsx` — map pin with status color
- [ ] Create `CarCard.tsx` — horizontal scroll car card
- [ ] Create `CategoryTile.tsx` — selectable category tile with icon
- [ ] Create `ViraChat.tsx` — VIRA chat widget (text + voice)

### Citizen Pages
- [ ] Create `AreaMapPage.tsx` — header, search/filter, map (60%), pins, mini-card overlay, issues list, FAB
- [ ] Verify: map renders with mock issue pins, filter pills work
- [ ] Create `MyCarsPage.tsx` — car scroller, sub-tabs, sensor detections, 360 captures, "needs help" flow
- [ ] Verify: car selector works, sub-tabs switch content
- [ ] Create `ReportPage.tsx` — camera section, AI banner, category grid, location, description+voice, severity, submit
- [ ] Verify: category selection works, form submits with success screen
- [ ] Create `ProfilePage.tsx` — profile card, stats, complaints list, settings, logout
- [ ] Verify: complaints list renders with filter tabs

### Worker Components
- [ ] Create `WorkerLayout.tsx` — mobile frame + bottom tabs
- [ ] Create `WorkerTabNav.tsx` — 4 tabs (Home, Tasks, AI, Profile)
- [ ] Create `TaskCard.tsx` — task card with severity border + escalation banner
- [ ] Create `TaskDetail.tsx` — full task detail view
- [ ] Create `ProcedureAccordion.tsx` — checkable procedure steps
- [ ] Create `ProofUpload.tsx` — camera + photo grid + notes
- [ ] Create `CopilotChat.tsx` — FIELD_COPILOT chat interface

### Worker Pages
- [ ] Create `DashboardPage.tsx` — greeting, stats, task map, next task card, recent completions
- [ ] Verify: map shows task pins with route line, next task card renders
- [ ] Create `TasksPage.tsx` — View A (task list), View B (task detail with procedure)
- [ ] Verify: task list renders, clicking opens detail, procedure checkboxes work
- [ ] Create `AssistantPage.tsx` — language toggle, chat bubbles, text+voice input, quick actions
- [ ] Verify: chat input works, quick actions send messages, voice button has hold animation
- [ ] Create `ProfilePage.tsx` — profile header, performance stats, completed tasks, certs
- [ ] Verify: all data renders correctly

### Final Checks
- [ ] All 8 pages render without errors
- [ ] Bottom tab navigation works for both dashboards
- [ ] Mobile-responsive layout looks correct in phone viewport
- [ ] Maps render with correct markers
- [ ] Commit: `feat(frontend): citizen dashboard (4 pages) + worker dashboard (4 pages)`

---

## Phase 5: BMC + State Dashboards — Desktop (Day 2–3 — PARALLEL with backend integration)

### BMC Components
- [ ] Create `BMCLayout.tsx` — desktop sidebar + content area
- [ ] Create `Sidebar.tsx` — 4 nav items with icons + active state
- [ ] Create `IssueTable.tsx` — sortable, filterable table with confidence score
- [ ] Create `IssueDetailPanel.tsx` — slide-in right panel
- [ ] Create `ActivityFeed.tsx` — real-time agent action stream
- [ ] Create `WorkerMap.tsx` — mapcn map with worker GPS pins
- [ ] Create `WorkerTable.tsx` — worker data table
- [ ] Create `ConfidenceScore.tsx` — color-coded score (red 80+, orange 60-80, yellow <60)
- [ ] Create `ReportGenerator.tsx` — PRESCIENT report trigger + preview

### BMC Pages
- [ ] Create `IssuesDashboard.tsx` — 4 KPI cards, issue table, filters, detail panel, activity feed
- [ ] Verify: table sorts, filters work, row click opens panel, activity feed scrolls
- [ ] Create `WorkersPage.tsx` — summary strip, worker map, worker table, detail sidebar
- [ ] Verify: map shows workers, table rows click to sidebar
- [ ] Create `CompletedPage.tsx` — summary strip, completed table, proof thumbnails, export
- [ ] Verify: table renders, SLA indicators show correctly
- [ ] Create `ReportsPage.tsx` — generate button, report preview, charts, analytics, archive
- [ ] Verify: charts render (bar, line, donut), report preview displays

### State Components
- [ ] Create `StateLayout.tsx` — desktop sidebar (formal design)
- [ ] Create `StateSidebar.tsx` — 4 nav items
- [ ] Create `StateMap.tsx` — Maharashtra map with MC regions (color-coded)
- [ ] Create `MCPerformanceTable.tsx` — MC comparison table
- [ ] Create `EscalationPanel.tsx` — GUARDIAN alert cards with Escalate button
- [ ] Create `ReportViewer.tsx` — rich report display (narrative + charts)
- [ ] Create `AllocationTable.tsx` — editable fund table with validation
- [ ] Create `ScorecardGrid.tsx` — MC grade cards (A-F)
- [ ] Create `LeagueTable.tsx` — ranked leaderboard

### State Pages
- [ ] Create `OverviewPage.tsx` — 5 KPI cards, state map, MC table, escalation panel
- [ ] Verify: map shows MC regions, table sorts, escalation panel has buttons
- [ ] Create `WeeklyReports.tsx` — report inbox (left), viewer (right) with charts
- [ ] Verify: report list selectable, viewer shows narrative + charts
- [ ] Create `AllocationPage.tsx` — ORACLE panel, editable table, resource recs, approval bar
- [ ] Verify: table cells editable, total validates, approve buttons work
- [ ] Create `AccountabilityPage.tsx` — scorecard grid, league table, trend charts
- [ ] Verify: grade cards show correct colors, league table ranks correctly

### Final Checks
- [ ] All 8 pages render without errors
- [ ] Sidebar navigation works for both dashboards
- [ ] Desktop layout responsive (no overflow/scroll issues)
- [ ] Charts render with mock data
- [ ] Commit: `feat(frontend): BMC dashboard (4 pages) + state dashboard (4 pages)`

---

## Phase 6: NEXUS Agent Dashboard — THE WOW PAGE (Day 3 — PARALLEL with backend integration)

### NEXUS Components
- [ ] Create `NexusLayout.tsx` — full-screen dark canvas (#08080D)
- [ ] Create `NexusTopBar.tsx` — semi-transparent top bar, 3 tabs, health indicator, clock
- [ ] Create `NexusCentralNode.tsx` — purple ring, rotating brain, pulse, particles
- [ ] Create `AgentNode.tsx` — glassmorphic card with color border, icon, name, status dot
- [ ] Create `ConnectionLine.tsx` — SVG line: dim default, bright+colored when active
- [ ] Create `DataPacket.tsx` — animated dot traveling along line
- [ ] Create `AgentDetailPanel.tsx` — slide-in: agent info, stats, recent 20 actions, JSON
- [ ] Create `LiveTicker.tsx` — bottom horizontal scrolling ticker
- [ ] Create `EventCard.tsx` — event entry with agent badge, action, issue link, timestamp
- [ ] Create `PipelineNode.tsx` — pipeline step card (agent, action, I/O, duration, status)
- [ ] Create `PipelineArrow.tsx` — connecting arrow between pipeline nodes

### NEXUS Pages
- [ ] Create `ConstellationPage.tsx` — NEXUS center + 10 orbital agents + connections
- [ ] Position agents in orbital arrangement
- [ ] Implement connection line animation triggers (WebSocket or mock timer)
- [ ] Implement data packet animation along active lines
- [ ] Implement click agent → detail panel slide-in
- [ ] Implement live ticker strip at bottom
- [ ] Verify: constellation renders, animations are smooth (60fps)
- [ ] Create `EventStreamPage.tsx` — multi-filter bar, pause/resume, auto-scroll feed, stats sidebar
- [ ] Verify: events color-coded by agent, filters work, pause stops scroll
- [ ] Create `PipelinePage.tsx` — issue selector, horizontal pipeline diagram, timeline, context panel
- [ ] Verify: pipeline shows L→R flow, nodes have correct status indicators

### Final Checks
- [ ] All 3 pages render without errors
- [ ] Constellation is visually stunning (dark theme, glowing connections)
- [ ] Animations don't lag
- [ ] Agent detail panel shows correct data
- [ ] Top bar tabs switch between 3 views
- [ ] Commit: `feat(frontend): NEXUS agent dashboard (3 pages) — constellation, events, pipeline`

---

## Phase 6 (continued): Frontend ↔ Backend Integration (Day 3)

### API Connection
- [ ] Replace mock data with real API calls (useApi hook)
- [ ] Citizen pages: connect to `/api/issues`, `/api/vira/chat`
- [ ] BMC pages: connect to `/api/issues`, `/api/commander/workers`, `/api/prescient/daily`
- [ ] State pages: connect to `/api/fleet/compare`, `/api/oracle/recommend-funds`, `/api/prescient/weekly`
- [ ] Worker pages: connect to `/api/tasks/mine`, `/api/field-copilot/chat`
- [ ] NEXUS pages: connect to `/api/nexus/status`, WebSocket

### WebSocket Wiring
- [ ] Wire WebSocket: BMC Activity Feed ← `agent_events`
- [ ] Wire WebSocket: State Escalation Panel ← `escalations`
- [ ] Wire WebSocket: Worker Tasks ← `tasks`
- [ ] Wire WebSocket: Citizen Notifications ← `notifications`
- [ ] Wire WebSocket: NEXUS Constellation ← `agent_events` (drive animations)

### Voice Integration
- [ ] Add Web Speech API STT to VIRA chat (citizen)
- [ ] Add Web Speech API STT to FIELD_COPILOT (worker)
- [ ] Add TTS playback (Sarvam or speechSynthesis fallback)

- [ ] Commit: `feat(frontend): API integration + WebSocket + voice`

---

## Phase 7: Final Polish (Day 3)

- [ ] Add Framer Motion page transitions (AnimatePresence)
- [ ] Add loading states to all data-fetching pages
- [ ] Add error handling (toast notifications)
- [ ] Responsive tweaks for mobile/desktop
- [ ] Cross-browser test (Chrome, Safari minimum)
- [ ] Final visual polish pass
- [ ] Commit: `release: InfraLens v1.0 — demo ready`

---

*Yash — Frontend Lead, InfraLens*
