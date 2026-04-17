# InfraLens — Stavan's Task Tracker

> **Role:** Backend Lead
> **Updated:** Phase-wise checklist — check off items as you complete them

---

## Phase 1: Project Scaffolding

- [ ] Create `backend/` directory structure
- [ ] Create `backend/requirements.txt` with all Python dependencies
- [ ] Create `backend/main.py` (minimal FastAPI health check)
- [ ] Create `backend/config.py` (env var loader)
- [ ] Create `backend/.env.example`
- [ ] Create `backend/.env` (local, gitignored)
- [ ] Create `backend/agents/__init__.py`
- [ ] Create `backend/routers/__init__.py`
- [ ] Create `backend/middleware/` directory
- [ ] Create `backend/seed_data/` directory
- [ ] Create `.gitignore` (Python + Node + .env)
- [ ] Initialize git repo (`git init`)
- [ ] Verify: `pip install -r requirements.txt` succeeds
- [ ] Verify: `uvicorn main:app --reload` runs, health check returns 200
- [ ] Commit: `feat: project scaffolding — backend initialized`

---

## Phase 2: Backend Core Infrastructure

- [ ] Create `backend/models.py` — Location model
- [ ] Create `backend/models.py` — SensorData model
- [ ] Create `backend/models.py` — ImageCapture model
- [ ] Create `backend/models.py` — ManualComplaint model
- [ ] Create `backend/models.py` — Issue model (full schema)
- [ ] Create `backend/models.py` — Worker model (full schema)
- [ ] Create `backend/models.py` — DailyReport model
- [ ] Create `backend/models.py` — MC model
- [ ] Create `backend/models.py` — AuditEntry model
- [ ] Create `backend/models.py` — AgentEvent model
- [ ] Create `backend/models.py` — All supporting models (AIClassification, Reporter, Assignment, Completion, Performance, Shift)
- [ ] Verify: all models import without errors
- [ ] Create `backend/data_store.py` — DataStore class with asyncio.Lock
- [ ] Implement Issue CRUD methods (create, get, update, list, list_by_mc, list_near)
- [ ] Implement Worker CRUD methods (get, list, update)
- [ ] Implement Report methods (create, list)
- [ ] Implement MC methods (get_mc, list_mcs)
- [ ] Implement Audit log methods (add, get)
- [ ] Implement Agent event methods (add, get)
- [ ] Implement issue_id generator (ISS-{city}-{date}-{seq})
- [ ] Implement seed data auto-loading on startup
- [ ] Verify: DataStore initializes correctly
- [ ] Create `backend/ws_manager.py` — ConnectionManager class
- [ ] Implement connect, disconnect, broadcast, send_to_role methods
- [ ] Define channels: agent_events, issues, tasks, notifications, escalations
- [ ] Verify: WebSocket connects on `/ws/agent_events`
- [ ] Create `backend/middleware/sentinel_middleware.py`
- [ ] Implement role-permission mapping (5 roles from agents.md)
- [ ] Implement X-User-Role header reading
- [ ] Implement route access checking
- [ ] Implement audit log generation per request
- [ ] Implement 403 response for unauthorized
- [ ] Verify: unauthorized request blocked with 403
- [ ] Update `backend/main.py` — CORS, SENTINEL middleware, WebSocket endpoint, startup event
- [ ] Create `backend/routers/issues_router.py` — GET/POST/PATCH /api/issues
- [ ] Verify: `GET /api/issues` returns data (empty or seed)
- [ ] Commit: `feat(backend): core infrastructure — models, data store, WebSocket, SENTINEL middleware`
- [ ] **NOTIFY Piyush and Amit: Phase 2 complete, they can pull and start**

---

## Phase 4: Backend Agents Group A

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
- [ ] Commit: `feat(backend): agents NEXUS, COGNOS, SENTINEL, COMMANDER with routers`

---

## Phase 10: Integration

- [ ] Pull Piyush's branch, merge VIRA/GUARDIAN/PRESCIENT/FLEET routers
- [ ] Pull Amit's branch, merge LOOP/ORACLE/FIELD_COPILOT routers + seed data
- [ ] Import all routers into `main.py`
- [ ] Resolve any model additions needed
- [ ] End-to-end test: sensor data → NEXUS → COGNOS → COMMANDER → assignment
- [ ] End-to-end test: citizen complaint → VIRA → NEXUS → COGNOS → COMMANDER
- [ ] End-to-end test: task completion → LOOP → verification → notification
- [ ] Verify WebSocket: agent_events channel broadcasts all pipeline steps
- [ ] Verify WebSocket: issues channel broadcasts status updates
- [ ] Verify WebSocket: tasks channel broadcasts new assignments
- [ ] Verify WebSocket: notifications channel broadcasts citizen updates
- [ ] Test GUARDIAN monitoring cycle with overdue seed data
- [ ] Test all 11 agents accessible via their API endpoints
- [ ] Fix any integration bugs
- [ ] Commit: `feat: full backend integration — all 11 agents operational`
- [ ] Final commit: `feat: full integration — frontend ↔ backend connected`

---

*Stavan — Backend Lead, InfraLens*
