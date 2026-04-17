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
- [x] Commit: `feat: agent drafts — VIRA, GUARDIAN logic (pure Python)`

---

## Phase 2: Pull models.py → Add Real Types (Day 1 — PARALLEL with all)

- [x] `git pull origin main` (Stavan's models.py should be there)
- [x] Verify: `from models import Issue, Worker, DailyReport, AuditEntry, AgentEvent` works
- [x] Verify: `from data_store import data_store` works
- [x] Add imports to VIRA draft, wrap returns in models
- [x] Add imports to GUARDIAN draft, connect to data_store
- [ ] Create your feature branch: `git checkout -b feat/agents-group-b`
- [ ] Commit: `feat(backend): VIRA + GUARDIAN agents with real model imports`

---

## Phase 3: Complete All 4 Agents + Routers (Day 1-2 -- PARALLEL with all)

- [x] Verify: `pip install -r requirements.txt` succeeds
- [x] Verify: `uvicorn main:app --reload` runs

### VIRA Agent (`agents/vira.py`)
- [x] Complete `agents/vira.py` file with all imports
- [x] Implement `detect_mode(message)` -- classify as report/query/general
- [x] Implement report mode: `extract_complaint_data(message)` with LLM prompt template
- [x] Implement report mode: `create_issue_from_chat(extracted_data, user_id)`
- [x] Implement query mode: `handle_status_query(message, user_id)`
- [x] Implement general mode: `handle_general(message)`
- [x] Implement main `chat(user_id, message, session_history)` entry point
- [x] Implement chat session history management (in-memory dict)
- [x] Create LangChain prompt templates (REPORT_EXTRACTION, STATUS_RESPONSE)
- [x] Test: "There's a pothole near Andheri" -> extracts category=roads, subcategory=pothole
- [x] Test: "What's the status of my complaint?" -> returns issue status
- [x] Test: "What is InfraLens?" -> general response

### VIRA Router (`routers/vira_router.py`)
- [x] Create `routers/vira_router.py`
- [x] Implement `POST /api/vira/chat` -- body: { user_id, message }
- [x] Implement `POST /api/vira/voice` -- body: { user_id, transcribed_text }
- [x] Verify: both endpoints return correct responses

### GUARDIAN Agent (`agents/guardian.py`)
- [x] Complete `agents/guardian.py` file with all imports
- [x] Define OVERDUE_THRESHOLDS (CRITICAL: 30min, HIGH: 4h, MEDIUM: 8h, LOW: 24h)
- [x] Implement `check_overdue_tasks()` -- scan active issues vs deadlines
- [x] Implement `check_mc_performance()` -- calculate MC resolution rates
- [x] Implement `check_repeated_failures(gps, radius_m, days)` -- find 3+ re-reports
- [x] Implement `check_worker_idle(worker_id)` -- GPS movement check
- [x] Implement `auto_escalate_critical()` -- auto-flag CRITICAL issues past SLA
- [x] Implement `escalate(issue_id, escalated_by)` -- manual state escalation + WebSocket broadcast
- [x] Implement `generate_alert(issue, alert_type)` -- structured alert object
- [x] Implement `run_monitoring_cycle()` -- run all checks, broadcast alerts
- [x] Test: create overdue issue -> check_overdue_tasks returns it
- [x] Test: escalate() updates issue + broadcasts

### GUARDIAN Router (`routers/guardian_router.py`)
- [x] Create `routers/guardian_router.py`
- [x] Implement `GET /api/guardian/alerts` -- returns active alerts
- [x] Implement `POST /api/guardian/escalate` -- body: { issue_id, escalated_by }
- [x] Implement `GET /api/guardian/overdue` -- returns overdue tasks
- [x] Verify: all endpoints return correct data

### PRESCIENT Agent (`agents/prescient.py`)
- [x] Create `agents/prescient.py` file
- [x] Implement `generate_daily_report(mc_id, date)`
- [x] -- Aggregate issues_received, resolved, pending, overdue from data_store
- [x] -- Calculate by_category breakdown
- [x] -- Calculate by_severity breakdown
- [x] -- Find worst_wards (top 3 by pending)
- [x] -- Calculate worker_utilization_pct
- [x] -- Calculate avg_resolution_time_hours
- [x] -- Generate AI narrative via Grok (or mock)
- [x] -- Return DailyReport model
- [x] Implement `generate_weekly_digest()` -- state-level cross-MC summary
- [x] Implement `generate_forecast(mc_id)` -- predictive warnings
- [x] Create DAILY_NARRATIVE_PROMPT template
- [x] Test: daily report for BMC Mumbai has correct metrics
- [x] Test: narrative is coherent

### PRESCIENT Router (`routers/prescient_router.py`)
- [x] Create `routers/prescient_router.py`
- [x] Implement `GET /api/prescient/daily/{mc_id}`
- [x] Implement `GET /api/prescient/weekly`
- [x] Implement `GET /api/prescient/forecast/{mc_id}`
- [x] Implement `POST /api/prescient/generate` -- manual trigger
- [x] Verify: daily report endpoint returns full report structure

### FLEET Agent (`agents/fleet.py`)
- [x] Create `agents/fleet.py` file
- [x] Implement `detect_geographic_clusters(radius_m, min_count, days)`
- [x] Implement `detect_seasonal_trends()`
- [x] Implement `detect_category_anomalies(threshold_pct)`
- [x] Implement `compare_mc_performance()` -- rank MCs by metrics
- [x] Implement `detect_recurrence(days)` -- find repeat GPS reports
- [x] Implement `generate_insights()` -- aggregate all detections + Grok summary
- [x] Test: cluster detection finds dense areas in seed data
- [x] Test: MC comparison returns ranked list

### FLEET Router (`routers/fleet_router.py`)
- [x] Create `routers/fleet_router.py`
- [x] Implement `GET /api/fleet/patterns`
- [x] Implement `GET /api/fleet/insights`
- [x] Implement `GET /api/fleet/compare`
- [x] Implement `GET /api/fleet/trends`
- [x] Verify: all endpoints return correct data

### Final Phase 3 Checks
- [x] All 4 agents import and initialize without errors
- [x] All 4 routers have correct endpoints
- [x] Each agent tested individually with mock/seed data
- [x] No imports from files you don't own (use data_store, models, config only)
- [ ] Commit: `feat(backend): agents VIRA, GUARDIAN, PRESCIENT, FLEET with routers`
- [ ] Push branch and create PR for Stavan to merge


---

## Phase 4: Individual Agent Testing (Day 2 -- PARALLEL with Yash's dashboards)

- [x] Test VIRA with multiple complaint types (pothole, water leak, garbage)
- [x] Test VIRA mode detection accuracy
- [x] Test GUARDIAN with overdue seed data -> alerts generated
- [x] Test PRESCIENT daily report -> correct aggregated metrics
- [x] Test FLEET MC comparison -> ranked list matches seed data
- [x] Fix any bugs found (3 bugs fixed: divider misclassification, drain misclassification, fallen tree mode detection)
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
