# InfraLens — Piyush's Task Tracker

> **Role:** Backend Agent Developer
> **Updated:** Phase-wise checklist — check off items as you complete them
> ⚡ **Start Day 1 Morning — simultaneous with all teammates**

---

## Phase 1: Day 1 Morning — Draft Agent Logic (ZERO dependencies — PARALLEL with all)

> Write pure Python logic — no imports needed. Return plain dicts.

- [x] Draft `detect_mode(message)` — keyword matching logic for report/query/general
- [x] Draft REPORT_EXTRACTION_PROMPT template string
- [x] Draft STATUS_RESPONSE_PROMPT template string
- [x] Draft `OVERDUE_THRESHOLDS` dict (CRITICAL: 30, HIGH: 240, MEDIUM: 480, LOW: 1440)
- [x] Draft `check_overdue_tasks()` skeleton — datetime math for deadline comparison
- [x] Draft `generate_alert()` — builds structured alert dict
- [x] Draft `escalate()` skeleton — status update + alert creation
- [ ] Commit: `feat: agent drafts — VIRA, GUARDIAN logic (pure Python)`

---

## Phase 2: Pull models.py → Add Real Types (Day 1 — PARALLEL with all)

- [ ] `git pull origin main` (Stavan's models.py should be there)
- [ ] Verify: `from models import Issue, Worker, DailyReport, AuditEntry, AgentEvent` works
- [ ] Verify: `from data_store import data_store` works
- [ ] Add imports to VIRA draft, wrap returns in models
- [ ] Add imports to GUARDIAN draft, connect to data_store
- [ ] Create your feature branch: `git checkout -b feat/agents-group-b`
- [ ] Commit: `feat(backend): VIRA + GUARDIAN agents with real model imports`

---

## Phase 3: Complete All 4 Agents + Routers (Day 1–2 — PARALLEL with all)

- [ ] Verify: `pip install -r requirements.txt` succeeds
- [ ] Verify: `uvicorn main:app --reload` runs

### VIRA Agent (`agents/vira.py`)
- [ ] Complete `agents/vira.py` file with all imports
- [ ] Implement `detect_mode(message)` — classify as report/query/general
- [ ] Implement report mode: `extract_complaint_data(message)` with LLM prompt template
- [ ] Implement report mode: `create_issue_from_chat(extracted_data, user_id)`
- [ ] Implement query mode: `handle_status_query(message, user_id)`
- [ ] Implement general mode: `handle_general(message)`
- [ ] Implement main `chat(user_id, message, session_history)` entry point
- [ ] Implement chat session history management (in-memory dict)
- [ ] Create LangChain prompt templates (REPORT_EXTRACTION, STATUS_RESPONSE)
- [ ] Test: "There's a pothole near Andheri" → extracts category=roads, subcategory=pothole
- [ ] Test: "What's the status of my complaint?" → returns issue status
- [ ] Test: "What is InfraLens?" → general response

### VIRA Router (`routers/vira_router.py`)
- [ ] Create `routers/vira_router.py`
- [ ] Implement `POST /api/vira/chat` — body: { user_id, message }
- [ ] Implement `POST /api/vira/voice` — body: { user_id, transcribed_text }
- [ ] Verify: both endpoints return correct responses

### GUARDIAN Agent (`agents/guardian.py`)
- [ ] Complete `agents/guardian.py` file with all imports
- [ ] Define OVERDUE_THRESHOLDS (CRITICAL: 30min, HIGH: 4h, MEDIUM: 8h, LOW: 24h)
- [ ] Implement `check_overdue_tasks()` — scan active issues vs deadlines
- [ ] Implement `check_mc_performance()` — calculate MC resolution rates
- [ ] Implement `check_repeated_failures(gps, radius_m, days)` — find 3+ re-reports
- [ ] Implement `check_worker_idle(worker_id)` — GPS movement check
- [ ] Implement `auto_escalate_critical()` — auto-flag CRITICAL issues past SLA
- [ ] Implement `escalate(issue_id, escalated_by)` — manual state escalation + WebSocket broadcast
- [ ] Implement `generate_alert(issue, alert_type)` — structured alert object
- [ ] Implement `run_monitoring_cycle()` — run all checks, broadcast alerts
- [ ] Test: create overdue issue → check_overdue_tasks returns it
- [ ] Test: escalate() updates issue + broadcasts

### GUARDIAN Router (`routers/guardian_router.py`)
- [ ] Create `routers/guardian_router.py`
- [ ] Implement `GET /api/guardian/alerts` — returns active alerts
- [ ] Implement `POST /api/guardian/escalate` — body: { issue_id, escalated_by }
- [ ] Implement `GET /api/guardian/overdue` — returns overdue tasks
- [ ] Verify: all endpoints return correct data

### PRESCIENT Agent (`agents/prescient.py`)
- [ ] Create `agents/prescient.py` file
- [ ] Implement `generate_daily_report(mc_id, date)`
- [ ] — Aggregate issues_received, resolved, pending, overdue from data_store
- [ ] — Calculate by_category breakdown
- [ ] — Calculate by_severity breakdown
- [ ] — Find worst_wards (top 3 by pending)
- [ ] — Calculate worker_utilization_pct
- [ ] — Calculate avg_resolution_time_hours
- [ ] — Generate AI narrative via Grok (or mock)
- [ ] — Return DailyReport model
- [ ] Implement `generate_weekly_digest()` — state-level cross-MC summary
- [ ] Implement `generate_forecast(mc_id)` — predictive warnings
- [ ] Create DAILY_NARRATIVE_PROMPT template
- [ ] Test: daily report for BMC Mumbai has correct metrics
- [ ] Test: narrative is coherent

### PRESCIENT Router (`routers/prescient_router.py`)
- [ ] Create `routers/prescient_router.py`
- [ ] Implement `GET /api/prescient/daily/{mc_id}`
- [ ] Implement `GET /api/prescient/weekly`
- [ ] Implement `GET /api/prescient/forecast/{mc_id}`
- [ ] Implement `POST /api/prescient/generate` — manual trigger
- [ ] Verify: daily report endpoint returns full report structure

### FLEET Agent (`agents/fleet.py`)
- [ ] Create `agents/fleet.py` file
- [ ] Implement `detect_geographic_clusters(radius_m, min_count, days)`
- [ ] Implement `detect_seasonal_trends()`
- [ ] Implement `detect_category_anomalies(threshold_pct)`
- [ ] Implement `compare_mc_performance()` — rank MCs by metrics
- [ ] Implement `detect_recurrence(days)` — find repeat GPS reports
- [ ] Implement `generate_insights()` — aggregate all detections + Grok summary
- [ ] Test: cluster detection finds dense areas in seed data
- [ ] Test: MC comparison returns ranked list

### FLEET Router (`routers/fleet_router.py`)
- [ ] Create `routers/fleet_router.py`
- [ ] Implement `GET /api/fleet/patterns`
- [ ] Implement `GET /api/fleet/insights`
- [ ] Implement `GET /api/fleet/compare`
- [ ] Implement `GET /api/fleet/trends`
- [ ] Verify: all endpoints return correct data

### Final Phase 3 Checks
- [ ] All 4 agents import and initialize without errors
- [ ] All 4 routers have correct endpoints
- [ ] Each agent tested individually with mock/seed data
- [ ] No imports from files you don't own (use data_store, models, config only)
- [ ] Commit: `feat(backend): agents VIRA, GUARDIAN, PRESCIENT, FLEET with routers`
- [ ] Push branch and create PR for Stavan to merge

---

## Phase 4: Individual Agent Testing (Day 2 — PARALLEL with Yash's dashboards)

- [ ] Test VIRA with multiple complaint types (pothole, water leak, garbage)
- [ ] Test VIRA mode detection accuracy
- [ ] Test GUARDIAN with overdue seed data → alerts generated
- [ ] Test PRESCIENT daily report → correct aggregated metrics
- [ ] Test FLEET MC comparison → ranked list matches seed data
- [ ] Fix any bugs found
- [ ] Commit: `fix(backend): VIRA, GUARDIAN, PRESCIENT, FLEET tested + fixed`

---

## Phase 5: Integration Testing (Day 2–3 — PARALLEL with Yash)

- [ ] Test VIRA → NEXUS pipeline: chat complaint → issue created → assigned
- [ ] Test VIRA status query with real issue from data_store
- [ ] Test GUARDIAN escalate → WebSocket broadcast received
- [ ] Test PRESCIENT weekly digest → cross-MC data
- [ ] Test FLEET insights → natural-language insights generated
- [ ] Commit: `fix(backend): agents B integration verified`

---

## Phase 6: End-to-end with Frontend (Day 3 — PARALLEL with Yash)

- [ ] Verify: VIRA chat works from frontend citizen chat
- [ ] Verify: GUARDIAN alerts show on State dashboard
- [ ] Verify: PRESCIENT reports render in BMC reports page
- [ ] Verify: FLEET comparison data shows on State overview
- [ ] Fix any bugs from frontend integration
- [ ] Commit: `fix: agents B frontend integration fixes`

---

## Phase 7: Final Polish (Day 3)

- [ ] Final bug fixes
- [ ] Verify all 4 agents work in demo happy-path
- [ ] Commit: `release: agents B demo ready`

---

*Piyush — Backend Agent Dev, InfraLens*
