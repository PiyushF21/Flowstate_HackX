# InfraLens — Amit's Task Tracker

> **Role:** Backend Agent Developer + Data
> **Updated:** Phase-wise checklist — check off items as you complete them
> ⚠️ **Wait for Stavan's Phase 2 before starting Phase 6**

---

## Phase 6: Backend Agents Group C + Seed Data

### Pre-requisites
- [ ] Pull latest from `main` branch (Stavan's Phase 2 should be merged)
- [ ] Verify: `models.py`, `data_store.py`, `config.py`, `ws_manager.py` exist
- [ ] Verify: `pip install -r requirements.txt` succeeds
- [ ] Verify: `uvicorn main:app --reload` runs
- [ ] Create your feature branch: `git checkout -b feat/agents-group-c`

### Seed Data (DO THIS FIRST — others need it)
- [ ] Create `seed_data/mcs.json` — 8 Municipal Corporations
- [ ] — BMC Mumbai (85% resolution, 4.2h avg, 42 workers)
- [ ] — PMC Pune (82% resolution, 4.8h avg, 35 workers)
- [ ] — NMC Nagpur (55% resolution, 8.2h avg, 22 workers)
- [ ] — NMC Nashik (68% resolution, 6.5h avg, 18 workers)
- [ ] — TMC Thane (78% resolution, 5.1h avg, 28 workers)
- [ ] — RMC Ratnagiri (72% resolution, 5.8h avg, 12 workers)
- [ ] — KMC Kolhapur (75% resolution, 5.5h avg, 15 workers)
- [ ] — AMC Aurangabad (62% resolution, 7.2h avg, 20 workers)
- [ ] Create `seed_data/workers.json` — 15-20 workers
- [ ] — 5 Roads & Asphalt specialists (Mumbai)
- [ ] — 3 Hydraulic & Plumbing specialists (Mumbai + Pune)
- [ ] — 3 Electrical & Power specialists (Mumbai + Nagpur)
- [ ] — 3 Sanitation & Waste specialists (Mumbai)
- [ ] — 2 Structural specialists (various)
- [ ] — 2 Traffic & Signaling specialists (various)
- [ ] — Mix of statuses: 8 available, 8 on_task, 4 off_duty
- [ ] — Include realistic GPS coords for Mumbai locations
- [ ] — Varied performance: ratings 3.2–4.8, on-time 70%–98%
- [ ] Create `seed_data/issues.json` — 25-30 issues
- [ ] — 10 car_sensor source (potholes, jolt data, GPS)
- [ ] — 8 360_capture source (dividers, debris, signals)
- [ ] — 10 manual_complaint source (water, electrical, sanitation)
- [ ] — Severity mix: 3 CRITICAL, 7 HIGH, 12 MEDIUM, 8 LOW
- [ ] — Status mix: 5 reported, 6 assigned, 8 in_progress, 10 resolved, 1 escalated
- [ ] — Real Mumbai/Pune/Nagpur GPS coordinates
- [ ] — Realistic descriptions and timestamps
- [ ] — Link assigned_to with workers.json worker_ids
- [ ] — Include procedure + materials for assigned/in-progress issues
- [ ] Create `seed_data/reports.json` — 5 daily reports
- [ ] — 3 for BMC Mumbai (April 15, 16, 17)
- [ ] — 1 for PMC Pune (April 17)
- [ ] — 1 for NMC Nagpur (April 17)
- [ ] — Full structure: summary, by_category, by_severity, worst_wards
- [ ] Verify: all JSON files parse without errors
- [ ] Verify: data relationships consistent (worker → issue → MC)
- [ ] Push seed data so Stavan can test core with real data

### LOOP Agent (`agents/loop.py`)
- [ ] Create `agents/loop.py` file
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
- [ ] Create `agents/oracle.py` file
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
- [ ] Create `agents/field_copilot.py` file
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

### Final Phase 6 Checks
- [ ] All seed data loads without errors via data_store
- [ ] All 3 agents import and initialize without errors
- [ ] All 4 routers have correct endpoints
- [ ] Each agent tested individually with seed data
- [ ] No imports from files you don't own
- [ ] Commit: `feat(backend): agents LOOP, ORACLE, FIELD_COPILOT + seed data`
- [ ] Push branch and create PR for Stavan to merge

---

## Phase 10: Integration (Amit's Part)

- [ ] Pull latest `main` (should have all agents merged)
- [ ] Test LOOP end-to-end: worker proof → fleet leader verify → citizen notified
- [ ] Test LOOP re-report detection (new issue near resolved GPS)
- [ ] Test LOOP feedback → worker rating updated
- [ ] Test ORACLE fund allocation → sensible amounts per MC
- [ ] Test ORACLE approval flow → records decision
- [ ] Test ORACLE budget tracker → correct utilization data
- [ ] Test FIELD_COPILOT chat → precise technical responses
- [ ] Test FIELD_COPILOT with task context → context-aware answers
- [ ] Test FIELD_COPILOT Hindi (if supported) → Hindi response
- [ ] Verify seed data consistency one final time
- [ ] Verify notifications reach frontend via WebSocket
- [ ] Fix any bugs in your 3 agents + seed data
- [ ] Commit: `fix: integration fixes for LOOP, ORACLE, FIELD_COPILOT`

---

*Amit — Backend Agent Dev + Data, InfraLens*
