# InfraLens — Amit's Task Tracker

> **Role:** Backend Agent Developer + Data
> **Updated:** Phase-wise checklist — check off items as you complete them
> ⚡ **Start Day 1 Morning — simultaneous with all teammates. Seed data has ZERO dependencies.**

---

## Phase 1: Day 1 Morning — Seed Data + Agent Drafts (ZERO dependencies — PARALLEL with all)

> Seed data is pure JSON. Agent drafts are pure Python. No waiting for anyone.

### Seed Data (DO FIRST — push ASAP, others need it)
- [x] Create `seed_data/mcs.json` — 8 Municipal Corporations (pure JSON)
- [x] — BMC Mumbai (85% resolution, 4.2h avg, 42 workers)
- [x] — PMC Pune (82% resolution, 4.8h avg, 35 workers)
- [x] — NMC Nagpur (55% resolution, 8.2h avg, 22 workers)
- [x] — NMC Nashik (68% resolution, 6.5h avg, 18 workers)
- [x] — TMC Thane (78% resolution, 5.1h avg, 28 workers)
- [x] — RMC Ratnagiri (72% resolution, 5.8h avg, 12 workers)
- [x] — KMC Kolhapur (75% resolution, 5.5h avg, 15 workers)
- [x] — AMC Aurangabad (62% resolution, 7.2h avg, 20 workers)
- [x] Create `seed_data/workers.json` — 20 workers
- [x] — 5 Roads & Asphalt specialists (Mumbai)
- [x] — 3 Hydraulic & Plumbing specialists (Mumbai + Pune)
- [x] — 3 Electrical & Power specialists (Mumbai + Nagpur)
- [x] — 3 Sanitation & Waste specialists (Mumbai)
- [x] — 2 Structural specialists (various)
- [x] — 2 Traffic & Signaling specialists (various)
- [x] — Mix of statuses: 8 available, 8 on_task, 4 off_duty
- [x] — Include realistic GPS coords for Mumbai locations
- [x] — Varied performance: ratings 3.2–4.8, on-time 70%–98%
- [x] Create `seed_data/issues.json` — 30 issues
- [x] — 10 car_sensor source (potholes, jolt data, GPS)
- [x] — 8 360_capture source (dividers, debris, signals)
- [x] — 12 manual_complaint source (water, electrical, sanitation)
- [x] — Severity mix: 3 CRITICAL, 7 HIGH, 12 MEDIUM, 8 LOW
- [x] — Status mix: 5 reported, 6 assigned, 8 in_progress, 10 resolved, 1 escalated
- [x] — Real Mumbai/Pune/Nagpur GPS coordinates
- [x] — Realistic descriptions and timestamps
- [x] — Link assigned_to with workers.json worker_ids
- [x] — Include procedure + materials for assigned/in-progress issues
- [x] Create `seed_data/reports.json` — 5 daily reports
- [x] — 3 for BMC Mumbai (April 15, 16, 17)
- [x] — 1 for PMC Pune (April 17)
- [x] — 1 for NMC Nagpur (April 17)
- [x] — Full structure: summary, by_category, by_severity, worst_wards
- [x] Verify: all JSON files parse without errors
- [x] Verify: data relationships consistent (worker → issue → MC)
- [x] Push seed data to main immediately
- [x] Commit: `feat: seed data — issues, workers, MCs, reports`

### Agent Logic Drafts (pure Python, no imports)
- [x] Draft LOOP SLA calculation logic
- [x] Draft LOOP re-report GPS proximity check (haversine math)
- [x] Draft ORACLE `calculate_allocation_score()` formula
- [x] Draft FIELD_COPILOT `REPAIR_KNOWLEDGE` dict (all categories)
- [x] Draft FIELD_COPILOT `SAFETY_PROTOCOLS` dict
- [x] Draft COPILOT_PROMPT template string
- [x] Commit: `feat: agent drafts — LOOP, ORACLE, FIELD_COPILOT logic`

---

## Phase 2: Pull models.py → Add Real Types (Day 1 — PARALLEL with all)

- [ ] `git pull origin main` (Stavan's models.py should be there)
- [ ] Verify: `from models import Issue, Worker, DailyReport` works
- [ ] Verify: `from data_store import data_store` works
- [ ] Add imports to LOOP draft, wrap returns in models
- [ ] Add imports to ORACLE draft, connect to data_store
- [ ] Create your feature branch: `git checkout -b feat/agents-group-c`
- [ ] Commit: `feat(backend): LOOP + ORACLE agents with real model imports`

---

## Phase 3: Complete All 3 Agents + Routers (Day 1–2 — PARALLEL with all)

- [ ] Verify: `pip install -r requirements.txt` succeeds
- [ ] Verify: `uvicorn main:app --reload` runs

### LOOP Agent (`agents/loop.py`)
- [ ] Complete `agents/loop.py` file with all imports
- [ ] Implement `submit_proof(issue_id, images, notes)` — worker proof upload
- [ ] Implement `verify_completion(issue_id, verifier_id, approved, rejection_reason)`
- [ ] — If approved: status→resolved, calculate resolution_time, check SLA, trigger notify
- [ ] — If rejected: status→in_progress, send rejection reason
- [ ] Implement `notify_citizen(issue_id)` — notification if reporter exists
- [ ] — Check reporter_id != "SENSOR-AUTO"
- [ ] — Generate notification message
- [ ] — Broadcast via WebSocket notifications channel
- [ ] — Update issue: citizen_notified = true
- [ ] Implement `submit_feedback(issue_id, reporter_id, rating, comment)`
- [ ] — Store feedback on issue
- [ ] — Update worker performance.rating (rolling average)
- [ ] Implement `check_rereport(gps, radius_m, days)` — detect failed repairs
- [ ] — Search resolved issues within radius in last N days
- [ ] — If found: create new issue with elevated priority
- [ ] Implement `get_feedback_metrics(mc)` — aggregate metrics per MC
- [ ] Test: verify approved → issue resolved + citizen notified
- [ ] Test: verify rejected → issue back to in_progress
- [ ] Test: feedback → worker rating updated

### LOOP Router (`routers/loop_router.py`)
- [ ] Create `routers/loop_router.py`
- [ ] Implement `POST /api/loop/verify` — body: { issue_id, verifier_id, approved, rejection_reason }
- [ ] Implement `POST /api/loop/feedback` — body: { issue_id, reporter_id, rating, comment }
- [ ] Implement `GET /api/loop/metrics` — query: ?mc=bmc-mumbai
- [ ] Verify: all endpoints work correctly

### ORACLE Agent (`agents/oracle.py`)
- [ ] Complete `agents/oracle.py` file with all imports
- [ ] Implement `recommend_fund_allocation()` — AI-recommended budget per MC
- [ ] — Factor: issue volume (weighted by severity)
- [ ] — Factor: population density (base allocation)
- [ ] — Factor: performance (flag low performers)
- [ ] — Emergency reserve: 15% of total
- [ ] — Generate rationale per MC via Grok (or mock)
- [ ] Implement `recommend_resource_allocation()` — equipment + crew recommendations
- [ ] — Compare MC worker utilization rates
- [ ] — Identify equipment needs by repair backlog
- [ ] Implement `approve_fund_allocation(allocation_id, approved_by, modifications)`
- [ ] — Validate total == budget if modifications provided
- [ ] — Record approval decision
- [ ] Implement `approve_resource_allocation(recommendation_id, approved_by, action)`
- [ ] Implement `get_budget_tracker()` — per MC budget utilization
- [ ] Test: fund recommendation sums to total budget
- [ ] Test: approval with modifications validates correctly
- [ ] Test: budget tracker shows allocated vs spent

### ORACLE Router (`routers/oracle_router.py`)
- [ ] Create `routers/oracle_router.py`
- [ ] Implement `GET /api/oracle/recommend-funds`
- [ ] Implement `POST /api/oracle/approve-funds`
- [ ] Implement `GET /api/oracle/recommend-resources`
- [ ] Implement `POST /api/oracle/approve-resources`
- [ ] Implement `GET /api/oracle/budget-tracker`
- [ ] Verify: all endpoints return correct data

### FIELD_COPILOT Agent (`agents/field_copilot.py`)
- [ ] Complete `agents/field_copilot.py` file with all imports
- [ ] Define REPAIR_KNOWLEDGE dict (roads, water, electrical, sanitation, structural)
- [ ] Define SAFETY_PROTOCOLS dict (road_repair, electrical, confined_space, heights)
- [ ] Create COPILOT_PROMPT template (context-aware, low temperature)
- [ ] Implement `chat(worker_id, message, task_context)` — text Q&A
- [ ] — Build context from current task + specialization + knowledge
- [ ] — Call Grok with temperature=0.1 (or mock)
- [ ] — Return text response
- [ ] Implement `voice_chat(worker_id, transcribed_text, task_context, language)`
- [ ] — Same as chat but shorter sentences for speech
- [ ] — If Sarvam key: generate TTS audio
- [ ] — Support "en" and "hi" languages
- [ ] Implement `predict_diagnosis(task_context)` — proactive diagnostic
- [ ] Test: "The pothole is 8 inches deep" → returns depth-appropriate procedure
- [ ] Test: "The valve is seized" → returns de-seizing procedure
- [ ] Test: safety question → returns safety protocol

### FIELD_COPILOT Router (`routers/field_copilot_router.py`)
- [ ] Create `routers/field_copilot_router.py`
- [ ] Implement `POST /api/field-copilot/chat`
- [ ] Implement `POST /api/field-copilot/voice`
- [ ] Implement `POST /api/field-copilot/predict`
- [ ] Verify: all endpoints return technical guidance

### Notifications Router (`routers/notifications_router.py`)
- [ ] Create `routers/notifications_router.py`
- [ ] Implement `GET /api/notifications` — query: ?user_id=CIT-USR-0042
- [ ] Implement `POST /api/notifications/read` — body: { notification_id }
- [ ] Verify: returns notifications for a citizen

### Final Phase 3 Checks
- [ ] All seed data loads without errors via data_store
- [ ] All 3 agents import and initialize without errors
- [ ] All 4 routers have correct endpoints
- [ ] Each agent tested individually with seed data
- [ ] No imports from files you don't own
- [ ] Commit: `feat(backend): agents LOOP, ORACLE, FIELD_COPILOT + routers`
- [ ] Push branch and create PR for Stavan to merge

---

## Phase 4: Individual Agent Testing (Day 2 — PARALLEL with Yash's dashboards)

- [ ] Test LOOP verify flow: approved → resolved + citizen notified
- [ ] Test LOOP verify flow: rejected → back to in_progress
- [ ] Test LOOP feedback → worker rating rolling average updated
- [ ] Test LOOP re-report detection with close GPS coordinates
- [ ] Test ORACLE fund allocation → sensible amounts per MC
- [ ] Test ORACLE approval with modifications → validates total
- [ ] Test FIELD_COPILOT chat → precise technical responses
- [ ] Verify seed data consistency one final time
- [ ] Fix any bugs found
- [ ] Commit: `fix(backend): LOOP, ORACLE, FIELD_COPILOT tested + fixed`

---

## Phase 5: Integration Testing (Day 2–3 — PARALLEL with Yash)

- [ ] Test LOOP completion flow through NEXUS pipeline
- [ ] Test ORACLE fund recommendations with real seed data
- [ ] Test FIELD_COPILOT with real task context from seed data
- [ ] Test notifications reach WebSocket channel
- [ ] Update seed data if needed for better demo
- [ ] Commit: `fix(backend): agents C integration verified`

---

## Phase 6: End-to-end with Frontend (Day 3 — PARALLEL with Yash)

- [ ] Verify: LOOP verification works from worker dashboard proof upload
- [ ] Verify: FIELD_COPILOT chat responds from worker assistant page
- [ ] Verify: ORACLE data renders on State allocation page
- [ ] Verify: Notifications reach citizen app
- [ ] Fix any bugs from frontend integration
- [ ] Commit: `fix: agents C frontend integration fixes`

---

## Phase 7: Final Polish (Day 3)

- [ ] Final bug fixes
- [ ] Verify all 3 agents + seed data work in demo happy-path
- [ ] Commit: `release: agents C + seed data demo ready`

---

*Amit — Backend Agent Dev + Data, InfraLens*
