# InfraLens — Stavan's Task Tracker

> **Role:** Backend Lead
> **Updated:** Phase-wise checklist — check off items as you complete them
> ⚡ **Start Day 1 Morning — you set the foundation everyone depends on**

---

## Phase 1: Scaffolding + Core Bootstrap (Day 1 Morning — PARALLEL with all) ✅

> 🔴 PRIORITY: Push `models.py` to main within 1 hour so Piyush & Amit can start using real types.

### Backend Scaffold
- [x] Create `backend/` directory structure
- [x] Create `backend/requirements.txt` with all Python dependencies
- [x] Create `backend/config.py` (env var loader)
- [x] Create `backend/.env.example`
- [x] Create `backend/.env` (local, gitignored)
- [x] Create `backend/agents/__init__.py`
- [x] Create `backend/routers/__init__.py`
- [x] Create `backend/middleware/` directory
- [x] Create `backend/seed_data/` directory
- [x] Create `.gitignore` (Python + Node + .env)

### Models (RUSH — others are waiting)
- [x] Create `backend/models.py` — Location model
- [x] Create `backend/models.py` — SensorData model
- [x] Create `backend/models.py` — ImageCapture model
- [x] Create `backend/models.py` — ManualComplaint model
- [x] Create `backend/models.py` — Issue model (full schema)
- [x] Create `backend/models.py` — Worker model (full schema)
- [x] Create `backend/models.py` — DailyReport model
- [x] Create `backend/models.py` — MC model
- [x] Create `backend/models.py` — AuditEntry model
- [x] Create `backend/models.py` — AgentEvent model
- [x] Create `backend/models.py` — All supporting models (AIClassification, Reporter, Assignment, Completion, Performance, Shift)
- [x] Verify: all models import without errors

### Data Store
- [x] Create `backend/data_store.py` — DataStore class with asyncio.Lock
- [x] Implement Issue CRUD methods (create, get, update, list, list_by_mc, list_near)
- [x] Implement Worker CRUD methods (get, list, update)
- [x] Implement Report methods (create, list)
- [x] Implement MC methods (get_mc, list_mcs)
- [x] Implement Audit log methods (add, get)
- [x] Implement Agent event methods (add, get)
- [x] Implement issue_id generator (ISS-{city}-{date}-{seq})
- [x] Implement seed data auto-loading on startup
- [x] Verify: DataStore initializes correctly

### Minimal main.py
- [x] Create `backend/main.py` (minimal FastAPI health check + CORS)
- [x] Verify: `pip install -r requirements.txt` succeeds
- [x] Verify: `uvicorn main:app --reload` runs, health check returns 200

### PUSH TO MAIN
- [ ] Commit: `feat: backend scaffold + models.py + data_store.py + config.py`
- [ ] Push to main immediately
- [ ] **NOTIFY Piyush and Amit: models.py is on main, pull now**

---

## Phase 2: Core Completion (Day 1 — PARALLEL with Yash/Piyush/Amit)

- [x] Create `backend/ws_manager.py` — ConnectionManager class
- [x] Implement connect, disconnect, broadcast, send_to_role methods
- [x] Define channels: agent_events, issues, tasks, notifications, escalations
- [x] Verify: WebSocket connects on `/ws/agent_events`
- [x] Create `backend/middleware/sentinel_middleware.py`
- [x] Implement role-permission mapping (5 roles from agents.md)
- [x] Implement X-User-Role header reading
- [x] Implement route access checking
- [x] Implement audit log generation per request
- [x] Implement 403 response for unauthorized
- [x] Verify: unauthorized request blocked with 403
- [x] Update `backend/main.py` — CORS, SENTINEL middleware, WebSocket endpoint, startup event
- [x] Create `backend/routers/issues_router.py` — GET/POST/PATCH /api/issues
- [x] Verify: `GET /api/issues` returns data (empty or seed)
- [x] Commit: `feat(backend): core — WebSocket, SENTINEL middleware, main.py, issues router`

---

## Phase 3: Agents Group A — NEXUS, COGNOS, SENTINEL, COMMANDER (Day 1–2 — PARALLEL with all)

- [ ] Create `backend/agents/nexus.py` — AgentState TypedDict
- [ ] Implement classify_source node
- [ ] Implement cognos_classify node (calls COGNOS)
- [ ] Implement sentinel_verify node (calls SENTINEL)
- [ ] Implement commander_assign node (calls COMMANDER)
- [ ] Implement guardian_monitor node (for CRITICAL)
- [ ] Implement severity_router (conditional edges)
- [ ] Build LangGraph StateGraph with all nodes and edges
- [ ] Implement `process_issue()` main entry
- [ ] Implement `get_pipeline_status()`
- [ ] Add WebSocket broadcasts at each pipeline step
- [ ] Verify: NEXUS pipeline runs end-to-end with test data
- [ ] Create `backend/agents/cognos.py` — FAULT_CODES dictionary (21 codes)
- [ ] Implement `score_sensor_data()` rule engine
- [ ] Implement `classify_image_result()` rule engine
- [ ] Implement `classify_complaint()` rule engine
- [ ] Implement `llm_analyze_sensor()` (Grok call or mock)
- [ ] Implement `llm_analyze_image()` (Grok Vision call or mock)
- [ ] Implement `llm_validate_complaint()` (Grok call or mock)
- [ ] Implement `fuse_classifications()` (take higher severity)
- [ ] Implement `count_reports_in_radius()` (GPS proximity check)
- [ ] Verify: sensor data analysis returns correct severity
- [ ] Create `backend/agents/sentinel.py` — ROLES dictionary
- [ ] Implement `verify_access()`
- [ ] Implement `log_action()`
- [ ] Verify: access check works for all 5 roles
- [ ] Create `backend/agents/commander.py` — SPECIALIZATIONS, SLA_HOURS, WEIGHTS
- [ ] Implement `score_worker()` multi-factor scoring
- [ ] Implement `find_best_worker()` (scores all, returns best)
- [ ] Implement `assign_issue()` (assigns, sets deadline, generates procedure)
- [ ] Implement `generate_procedure()` (Grok or mock)
- [ ] Implement `generate_materials_list()` (Grok or mock)
- [ ] Implement `preempt_for_critical()`
- [ ] Implement `reassign()` and `get_workload()`
- [ ] Verify: assignment returns correct worker with procedure
- [ ] Create `backend/routers/nexus_router.py`
- [ ] Create `backend/routers/cognos_router.py`
- [ ] Create `backend/routers/sentinel_router.py`
- [ ] Create `backend/routers/commander_router.py`
- [ ] Wire all 4 routers into `main.py`
- [ ] Verify: POST /api/nexus/process with sensor data → full pipeline → issue + assignment
- [ ] Verify: POST /api/cognos/analyze-sensor → severity + fault code
- [ ] Verify: GET /api/sentinel/audit → audit entries
- [ ] Verify: POST /api/commander/assign → worker + procedure
- [ ] Commit: `feat(backend): agents NEXUS, COGNOS, SENTINEL, COMMANDER + routers`

---

## Phase 4: Merge PRs + Backend Testing (Day 2 — PARALLEL with Yash)

- [x] Pull Piyush's branch, merge VIRA/GUARDIAN/PRESCIENT/FLEET routers
- [x] Pull Amit's branch, merge LOOP/ORACLE/FIELD_COPILOT routers + seed data
- [x] Import all 11 agent routers into `main.py`
- [x] Resolve any model additions needed
- [x] Test full NEXUS pipeline end-to-end with seed data
- [x] Fix any integration bugs between agents
- [x] Commit: `feat(backend): all 11 agent routers wired, pipeline tested`

---

## Phase 5: Full Pipeline Integration (Day 2–3 — PARALLEL with Yash)

- [x] End-to-end test: sensor data → NEXUS → COGNOS → COMMANDER → assignment
- [x] End-to-end test: citizen complaint → VIRA → NEXUS → COGNOS → COMMANDER
- [x] End-to-end test: task completion → LOOP → verification → notification
- [x] Verify WebSocket: agent_events channel broadcasts all pipeline steps
- [x] Verify WebSocket: issues channel broadcasts status updates
- [x] Verify WebSocket: tasks channel broadcasts new assignments
- [x] Verify WebSocket: notifications channel broadcasts citizen updates
- [x] Test GUARDIAN monitoring cycle with overdue seed data
- [x] Test all 11 agents accessible via their API endpoints
- [x] Commit: `feat(backend): end-to-end pipeline verified, WebSocket live`

---

## Phase 6: Integration with Frontend (Day 3 — PARALLEL with Yash)

- [ ] Ensure all APIs return correct data for Yash's frontend integration
- [ ] Fix any backend bugs found during frontend connection
- [ ] WebSocket broadcast verification with frontend connected
- [ ] Commit: `feat: backend integration stable for frontend`

---

## Phase 7: Final Polish + Demo Prep (Day 3)

- [ ] Full-system demo test (happy path)
- [ ] Fix any remaining backend bugs
- [ ] Demo preparation, happy-path script
- [ ] Final commit: `release: InfraLens v1.0 — demo ready`

---

*Stavan — Backend Lead, InfraLens*
