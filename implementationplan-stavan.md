# InfraLens — Stavan's Implementation Plan

> **Role:** Backend Lead
> **Owns:** Project scaffolding, FastAPI core, data layer, WebSocket, SENTINEL middleware, NEXUS, COGNOS, SENTINEL agent, COMMANDER agent, Phase 10 integration

---

## Phase 1: Project Scaffolding (Parallel with Yash)

### What to Build

1. **Create project root structure:**
   ```
   hackx2.0_flowstate/
   ├── backend/
   │   ├── main.py
   │   ├── config.py
   │   ├── requirements.txt
   │   ├── .env
   │   ├── .env.example
   │   ├── agents/__init__.py
   │   ├── routers/__init__.py
   │   ├── middleware/
   │   └── seed_data/
   └── .gitignore
   ```

2. **`requirements.txt`:**
   ```
   fastapi==0.115.0
   uvicorn[standard]==0.30.0
   websockets==12.0
   langchain>=0.2.0
   langgraph>=0.2.0
   langchain-xai>=0.1.0
   httpx>=0.27.0
   python-multipart>=0.0.9
   pydantic>=2.7.0
   python-dotenv>=1.0.0
   ```

3. **`main.py`** — Minimal FastAPI app with CORS and health check

4. **`.env.example`:**
   ```
   XAI_API_KEY=your-grok-api-key
   SARVAM_API_KEY=your-sarvam-api-key
   ```

5. **`config.py`** — Load env vars with dotenv

6. **`.gitignore`** — Python + Node + .env

7. **Initialize git repo** — `git init`, initial commit

### Verification
- `cd backend && pip install -r requirements.txt`
- `uvicorn main:app --reload` → `http://localhost:8000/api/health` returns `{"status": "ok"}`

---

## Phase 2: Backend Core Infrastructure

### What to Build

#### 1. `models.py` — All Pydantic Models

```python
# Models to create:
- Location(BaseModel): lat, lng, address, city, ward, pincode
- SensorData(BaseModel): vehicle_id, timestamp, gps, speed_kmh, accelerometer, suspension_event, road_segment, city, ward
- ImageCapture(BaseModel): reporter_id, reporter_name, timestamp, gps, images, auto_detected_category, ai_confidence, road_segment, city, ward
- ManualComplaint(BaseModel): reporter_id, reporter_name, timestamp, gps, category, subcategory, description, severity_self_assessed, images, address_text, city, ward
- AIClassification(BaseModel): agent, category_confidence, severity_confidence, cross_validation_count
- Reporter(BaseModel): reporter_id, reporter_name, contact
- Assignment(BaseModel): worker_id, worker_name, team, assigned_at, assigned_by
- Completion(BaseModel): completed_at, proof_images, verified_by, verified_at
- Performance(BaseModel): tasks_completed_this_week, avg_resolution_time_hours, rating, on_time_completion_pct
- Shift(BaseModel): start, end
- Issue(BaseModel): issue_id, source, category, subcategory, severity, confidence, status, location, description, ai_classification, reporter, images, assigned_to, procedure, deadline, materials_required, completion, resolution_time_hours, sla_met, citizen_notified, created_at, updated_at
- Worker(BaseModel): worker_id, name, phone, role, specializations, certifications, zone, mc, status, current_task_id, shift, current_location, performance
- DailyReport(BaseModel): report_id, mc_name, date, generated_by, generated_at, summary, by_category, by_severity, worst_wards, escalated_tasks, fund_utilization_pct
- MC(BaseModel): mc_id, name, city, state, total_workers, issues_this_week, resolution_rate, avg_resolution_hours
- AuditEntry(BaseModel): id, agent, action, role, user_id, outcome, details, timestamp
- AgentEvent(BaseModel): agent, action, issue_id, data, portal, timestamp
```

#### 2. `data_store.py` — In-Memory Data Store

```python
class DataStore:
    # Thread-safe with asyncio.Lock
    # Auto-loads seed_data/ on startup
    
    # Issue methods
    async def create_issue(issue: Issue) -> Issue
    async def get_issue(issue_id: str) -> Issue | None
    async def update_issue(issue_id: str, updates: dict) -> Issue
    async def list_issues(filters: dict = None) -> list[Issue]
    async def list_issues_by_mc(mc: str) -> list[Issue]
    async def list_issues_near(lat: float, lng: float, radius_m: float) -> list[Issue]
    
    # Worker methods
    async def get_worker(worker_id: str) -> Worker | None
    async def list_workers(filters: dict = None) -> list[Worker]
    async def update_worker(worker_id: str, updates: dict) -> Worker
    
    # Report methods
    async def create_report(report: DailyReport) -> DailyReport
    async def list_reports(mc: str = None) -> list[DailyReport]
    
    # MC methods
    async def get_mc(mc_id: str) -> MC | None
    async def list_mcs() -> list[MC]
    
    # Audit methods
    async def add_audit_log(entry: AuditEntry) -> None
    async def get_audit_logs(filters: dict = None) -> list[AuditEntry]
    
    # Agent events (for NEXUS dashboard)
    async def add_agent_event(event: AgentEvent) -> None
    async def get_agent_events(limit: int = 200) -> list[AgentEvent]
    
    # Issue ID generator
    def generate_issue_id(city: str) -> str  # ISS-MUM-2026-04-17-0042
```

#### 3. `ws_manager.py` — WebSocket Manager

```python
class ConnectionManager:
    async def connect(websocket, channel: str)
    async def disconnect(websocket, channel: str)
    async def broadcast(channel: str, data: dict)
    async def send_to_role(role: str, data: dict)
    
    # Channels: agent_events, issues, tasks, notifications, escalations
```

#### 4. `middleware/sentinel_middleware.py` — RBAC Middleware

```python
# Reads X-User-Role header (simplified auth for hackathon)
# Checks route against ROLES permission map
# Logs every request to audit log
# Returns 403 if unauthorized
```

#### 5. `main.py` — Full FastAPI App

```python
# CORS middleware (allow frontend localhost:5173)
# SENTINEL middleware
# WebSocket endpoint: /ws/{channel}
# Health check: GET /api/health
# Import and include all routers
# Startup: load seed data
```

#### 6. `routers/issues_router.py` — Issue CRUD

```python
# GET /api/issues — list all issues (with filters)
# GET /api/issues/{issue_id} — get single issue
# GET /api/issues/mine — citizen's own issues (filtered by reporter_id)
# POST /api/issues — create issue (manual)
# PATCH /api/issues/{issue_id} — update issue status
```

### Verification
- All models import without errors
- DataStore initializes and loads seed data
- `GET /api/health` → 200
- `GET /api/issues` → returns seed issues
- WebSocket connects on `/ws/agent_events`
- Unauthorized request returns 403

---

## Phase 4: Backend Agents Group A

### What to Build

#### 1. `agents/nexus.py` — NEXUS Master Orchestrator

```python
# LangGraph StateGraph implementation
class AgentState(TypedDict):
    issue_id: str
    source: str
    raw_data: dict
    classification: dict
    severity: str
    location: dict
    mc: str
    assignment: dict
    worker_id: str
    procedure: list[str]
    deadline: str
    status: str
    escalation: dict
    completion: dict
    execution_steps: list[str]

# Nodes:
def classify_source(state) -> state    # Determine source type
def cognos_classify(state) -> state    # Call COGNOS agent
def sentinel_verify(state) -> state    # Call SENTINEL for permission check
def commander_assign(state) -> state   # Call COMMANDER for assignment
def guardian_monitor(state) -> state   # Register with GUARDIAN for monitoring

# Router:
def severity_router(state) -> str      # Routes based on severity

# Graph:
graph = StateGraph(AgentState)
graph.add_node("classify_source", classify_source)
graph.add_node("cognos", cognos_classify)
graph.add_node("sentinel", sentinel_verify)
graph.add_node("commander", commander_assign)
graph.add_node("guardian", guardian_monitor)
graph.add_conditional_edges("sentinel", severity_router, {...})

# Main entry:
async def process_issue(raw_data: dict) -> dict
async def get_pipeline_status(issue_id: str) -> dict
```

- WebSocket broadcast at each step → feeds NEXUS dashboard

#### 2. `agents/cognos.py` — Dual-Brain Classification

```python
# All 21 FAULT_CODES from agents.md
FAULT_CODES = { "RD-001": "Pothole detected — road surface cavity", ... }

# Brain 1 — Rule Engine:
def score_sensor_data(data) -> tuple[str, int]     # Returns (severity, score)
def classify_image_result(vision_output) -> dict
def classify_complaint(category, subcategory, description) -> dict

# Brain 2 — LLM (Grok):
async def llm_analyze_sensor(data) -> dict
async def llm_analyze_image(image_path) -> dict
async def llm_validate_complaint(complaint) -> dict

# Fusion:
async def fuse_classifications(rule_result, llm_result) -> dict

# Cross-validation:
async def count_reports_in_radius(gps, radius_m=10, hours=4) -> int

# Main entries:
async def analyze_sensor(sensor_data: SensorData) -> dict
async def analyze_image(image_capture: ImageCapture) -> dict
async def classify_manual_complaint(complaint: ManualComplaint) -> dict
```

#### 3. `agents/sentinel.py` — RBAC Agent Logic

```python
ROLES = { ... }  # From agents.md

def verify_access(role: str, route: str) -> bool
async def log_action(action, role, user_id, outcome, details) -> AuditEntry
```

#### 4. `agents/commander.py` — Task Auto-Assignment

```python
SPECIALIZATIONS = { ... }  # From agents.md
SLA_HOURS = { "CRITICAL": 4, "HIGH": 12, "MEDIUM": 48, "LOW": 168 }
WEIGHTS = { "expertise": 0.35, "proximity": 0.25, "workload": 0.20, "shift": 0.10, "performance": 0.10 }

def score_worker(worker, issue) -> float
async def find_best_worker(issue) -> Worker
async def assign_issue(issue_id: str) -> dict
async def generate_procedure(issue) -> list[str]     # LLM-generated
async def generate_materials_list(issue) -> list[str] # LLM-generated
async def preempt_for_critical(issue) -> dict | None
async def reassign(issue_id, new_worker_id, reason) -> dict
async def get_workload() -> dict
```

#### 5. Routers for all 4 agents

```python
# nexus_router.py
#   POST /api/nexus/process
#   GET /api/nexus/status/{issue_id}

# cognos_router.py
#   POST /api/cognos/analyze-sensor
#   POST /api/cognos/analyze-image
#   POST /api/cognos/classify-complaint

# sentinel_router.py
#   GET /api/sentinel/audit

# commander_router.py
#   POST /api/commander/assign
#   GET /api/commander/workers
#   POST /api/commander/reassign
#   GET /api/commander/workload
```

### Verification
- `POST /api/nexus/process` with sensor data → full pipeline executes → issue created + assigned
- `POST /api/cognos/analyze-sensor` → returns severity + fault code
- `GET /api/sentinel/audit` → returns audit entries
- `POST /api/commander/assign` → returns worker assignment with procedure

---

## Phase 10: Integration (Stavan's Part)

### What to Do

1. **Import all routers into `main.py`:**
   - Pull latest from Piyush's and Amit's branches
   - Add their routers to `main.py` app includes
   - Resolve any model additions they need

2. **End-to-end test:**
   - POST sensor data → NEXUS → COGNOS → COMMANDER → assignment → WebSocket broadcast
   - Verify all agents work together through NEXUS pipeline

3. **WebSocket verification:**
   - Connect to `/ws/agent_events` → trigger issue → see events flow
   - Connect to `/ws/issues` → see issue status update
   - Connect to `/ws/tasks` → see worker receive task

4. **Fix integration bugs** in backend

### Verification
- Full pipeline works end-to-end
- All 11 agents accessible via API
- WebSocket broadcasts work on all channels
- Frontend can connect and receive real-time data

---

## Files Stavan Owns (DO NOT let others edit)

```
backend/main.py
backend/config.py
backend/requirements.txt
backend/.env
backend/.env.example
backend/models.py
backend/data_store.py
backend/ws_manager.py
backend/middleware/sentinel_middleware.py
backend/agents/__init__.py
backend/agents/nexus.py
backend/agents/cognos.py
backend/agents/sentinel.py
backend/agents/commander.py
backend/routers/__init__.py
backend/routers/nexus_router.py
backend/routers/cognos_router.py
backend/routers/sentinel_router.py
backend/routers/commander_router.py
backend/routers/issues_router.py
.gitignore
```

---

*Stavan — Backend Lead, InfraLens*
