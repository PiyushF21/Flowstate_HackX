# InfraLens — Piyush's Implementation Plan

> **Role:** Backend Agent Developer
> **Owns:** VIRA agent, GUARDIAN agent, PRESCIENT agent, FLEET agent + all their routers
> **Start:** Day 1 Morning — **simultaneous with all team members**

---

## Phase 1: Day 1 Morning — Start Immediately (NO dependencies)

> ⚡ You start coding from minute one. No waiting for anyone.

**What to do while Stavan builds models.py (~first 1-2 hours):**

1. **Draft VIRA agent logic (pure Python, no imports):**
   - Write `detect_mode(message)` — keyword matching for report/query/general
   - Write prompt template strings (REPORT_EXTRACTION_PROMPT, STATUS_RESPONSE_PROMPT)
   - Write response formatting functions
   - All functions take `str`/`dict` params and return `dict` — no Pydantic models yet

2. **Draft GUARDIAN agent logic (pure Python, no imports):**
   - Write `OVERDUE_THRESHOLDS` dict
   - Write `check_overdue_tasks()` — the calculation logic (datetime math)
   - Write `generate_alert()` — structured alert dict builder
   - Write escalation logic skeleton

3. **Once Stavan pushes `models.py` to main (~1-2 hours in):**
   ```bash
   git pull origin main
   ```
   → Add `from models import Issue, Worker, DailyReport, AuditEntry, AgentEvent` etc.
   → Add `from data_store import data_store`
   → Wrap your dict returns in Pydantic models
   → Continue building with full type safety

---

## Phase 2+3: Complete All 4 Agents + Routers

> By this point you have `models.py` and `data_store.py` available.

### What to Build

#### 1. `agents/vira.py` — Citizen Voice/Chat Interface

**Purpose:** Natural-language AI assistant for citizens. Handles complaint intake and status queries.

```python
# Mode detection:
async def detect_mode(message: str) -> str
    # Returns: "report" | "query" | "general"
    # "report" if: contains problem descriptions, location mentions, urgency words
    # "query" if: contains "status", "what happened", "my complaint", issue IDs
    # "general" otherwise

# Report mode:
async def extract_complaint_data(message: str) -> dict
    # Uses Grok LLM with prompt template:
    # Extract: category, subcategory, severity, location_text, description
    # Returns structured dict

async def create_issue_from_chat(extracted_data: dict, user_id: str) -> dict
    # Creates Issue via data_store
    # Routes through NEXUS pipeline
    # Returns confirmation with issue_id

# Query mode:
async def handle_status_query(message: str, user_id: str) -> str
    # Extracts issue_id or searches by user_id
    # Fetches issue from data_store
    # Generates conversational status response via LLM

# General mode:
async def handle_general(message: str) -> str
    # Answers general questions about InfraLens
    # Redirects to appropriate action

# Main entry:
async def chat(user_id: str, message: str, session_history: list = []) -> dict
    # Detects mode → routes to handler → returns response + action_taken

# Chat history (in-memory):
chat_sessions: dict[str, list]  # user_id → message history
```

**LangChain Prompt Templates:**
```python
REPORT_EXTRACTION_PROMPT = """
You are VIRA, an AI assistant for InfraLens.
Extract the following from the citizen's message:
- category: one of [roads, water_pipeline, electrical, sanitation, environment, structural, traffic]
- subcategory: specific issue type
- severity: CRITICAL, HIGH, MEDIUM, or LOW
- location_text: any location mentioned
- description: structured summary

Citizen message: {message}
"""

STATUS_RESPONSE_PROMPT = """
You are VIRA. The citizen is asking about their complaint.
Issue data: {issue_data}
Generate a friendly, conversational response about the status.
"""
```

#### 2. `agents/guardian.py` — Deadline Monitor & Escalation Engine

**Purpose:** Continuously monitors task deadlines, triggers escalation alerts.

```python
# SLA thresholds (overdue tolerance):
OVERDUE_THRESHOLDS = {
    "CRITICAL": 30,   # minutes past SLA
    "HIGH": 240,      # 4 hours
    "MEDIUM": 480,    # 8 hours
    "LOW": 1440,      # 24 hours
}

# Core monitoring:
async def check_overdue_tasks() -> list[dict]
    # Scans all issues with status in ["assigned", "in_progress"]
    # Compares current time vs deadline
    # Returns list of overdue tasks with overdue_minutes

async def check_mc_performance() -> list[dict]
    # Calculates each MC's daily resolution rate
    # Flags MCs below 60% threshold

async def check_repeated_failures(gps: dict, radius_m: float = 10) -> list[dict]
    # Finds locations with 3+ resolved-then-re-reported issues

async def check_worker_idle(worker_id: str) -> bool
    # Checks if worker marked "on_task" hasn't moved for >2 hours

# Escalation:
async def auto_escalate_critical() -> list[dict]
    # For CRITICAL issues past SLA: auto-flag on BMC portal
    # Broadcast via WebSocket to both State + BMC channels

async def escalate(issue_id: str, escalated_by: str) -> dict
    # State official manually escalates
    # Updates issue status
    # Sends urgent alert to BMC portal via WebSocket
    # Marks task as "URGENT — State Escalated" for worker

async def generate_alert(issue: dict, alert_type: str) -> dict
    # Creates structured alert object
    # Types: task_deadline_breach, mc_performance_drop, repeated_failure, worker_idle

# Background task (called periodically):
async def run_monitoring_cycle() -> dict
    # Runs all checks
    # Broadcasts alerts via WebSocket
    # Returns summary of findings
```

#### 3. `agents/prescient.py` — Reporting & Forecasting

**Purpose:** Generates daily/weekly reports with AI narratives and predictions.

```python
# Daily report generation:
async def generate_daily_report(mc_id: str, date: str = None) -> dict
    # Aggregates from data_store:
    #   - issues_received, issues_resolved, issues_pending, issues_overdue
    #   - by_category breakdown
    #   - by_severity breakdown
    #   - worst_wards (top 3 by pending count)
    #   - worker_utilization_pct
    #   - avg_resolution_time_hours
    #   - escalated_tasks count
    #   - fund_utilization_pct

    # Generates AI narrative via Grok:
    #   "BMC Mumbai processed 156 issues today with an 85.9% resolution rate..."

    # Returns DailyReport model

# Weekly digest:
async def generate_weekly_digest() -> dict
    # State-level cross-MC summary
    # Week-over-week trends
    # MC performance comparison
    # AI-generated narrative with insights
    # Predictive warnings

# Forecasting:
async def generate_forecast(mc_id: str) -> dict
    # Seasonal patterns (if historical data available)
    # Trend detection (issue volume growing?)
    # Resource need prediction
    # Uses Grok to generate natural-language predictions

# Narrative generation (LLM):
async def generate_narrative(report_data: dict, report_type: str) -> str
    # Prompt template for daily/weekly narrative
    # Includes highlights, concerns, recommendations
```

**Prompt Template:**
```python
DAILY_NARRATIVE_PROMPT = """
You are PRESCIENT, InfraLens's reporting agent. Generate a concise daily report narrative.

MC: {mc_name}
Date: {date}
Issues received: {received} | Resolved: {resolved} | Pending: {pending} | Overdue: {overdue}
Resolution rate: {rate}%
Avg resolution time: {avg_time} hours
Worker utilization: {utilization}%

Category breakdown: {categories}
Worst wards: {worst_wards}

Generate a 2-3 paragraph executive summary covering performance highlights, concerns, and recommendations.
"""
```

#### 4. `agents/fleet.py` — Cross-MC Pattern Analytics

**Purpose:** Detects macro-level infrastructure failure patterns across all MCs.

```python
# Geographic clustering:
async def detect_geographic_clusters(radius_m: int = 500, min_count: int = 5, days: int = 7) -> list[dict]
    # Groups issues by GPS proximity
    # Finds clusters with min_count+ issues within radius in last N days
    # Returns cluster insights with location, count, pattern type

# Seasonal trends:
async def detect_seasonal_trends() -> list[dict]
    # Compares current month's category volumes vs historical averages
    # Flags categories with >50% deviation
    # Returns trend insights

# Category anomalies:
async def detect_category_anomalies(threshold_pct: int = 50) -> list[dict]
    # Per MC: checks if any category's current count exceeds historical avg by threshold
    # Returns anomaly list

# MC comparison:
async def compare_mc_performance() -> list[dict]
    # Ranks all MCs by: resolution rate, avg time, worker utilization
    # Identifies top/bottom performers
    # Returns comparison data

# Recurrence detection:
async def detect_recurrence(days: int = 60) -> list[dict]
    # Finds GPS locations with 3+ resolved-then-re-reported issues
    # Flags as structural/deep problem
    # Returns recurrence insights

# AI insights:
async def generate_insights() -> list[dict]
    # Runs all detection methods
    # Uses Grok to generate natural-language strategic insights
    # Each insight: type, insight text, priority, mc, recommended action
```

#### 5. Routers

```python
# routers/vira_router.py
#   POST /api/vira/chat         — body: { user_id, message }
#   POST /api/vira/voice        — body: { user_id, transcribed_text }

# routers/guardian_router.py
#   GET  /api/guardian/alerts    — returns active alerts
#   POST /api/guardian/escalate  — body: { issue_id, escalated_by }
#   GET  /api/guardian/overdue   — returns all overdue tasks

# routers/prescient_router.py
#   GET  /api/prescient/daily/{mc_id}  — today's daily report
#   GET  /api/prescient/weekly         — weekly state digest
#   GET  /api/prescient/forecast/{mc_id} — predictive forecast
#   POST /api/prescient/generate       — force-generate report

# routers/fleet_router.py
#   GET  /api/fleet/patterns   — geographic clusters + trends
#   GET  /api/fleet/insights   — AI-generated strategic insights
#   GET  /api/fleet/compare    — MC performance comparison
#   GET  /api/fleet/trends     — time-series trend data
```

### Verification
- `POST /api/vira/chat` with "There's a pothole near Andheri" → returns extracted data + issue created
- `POST /api/vira/chat` with "What's the status of my complaint?" → returns status response
- `GET /api/guardian/alerts` → returns overdue task alerts (if any exist in seed data)
- `POST /api/guardian/escalate` with issue_id → returns escalation confirmation
- `GET /api/prescient/daily/bmc-mumbai` → returns daily report with narrative
- `GET /api/fleet/insights` → returns AI-generated pattern insights
- `GET /api/fleet/compare` → returns MC comparison data

---

## Phase 4: Individual Agent Testing (Day 2 — PARALLEL with Yash's dashboards)

### What to Do
- Test VIRA with multiple complaint types (pothole, water leak, garbage)
- Test VIRA mode detection accuracy with various Indian English phrasings
- Test GUARDIAN with overdue seed data → alerts generated correctly
- Test PRESCIENT daily report → correct aggregated metrics from seed data
- Test FLEET MC comparison → ranked list matches seed data
- Fix any bugs found in all 4 agents

---

## Phase 5: Integration Testing (Day 2–3 — PARALLEL with Yash)

### What to Do

1. **Test VIRA end-to-end:**
   - Citizen sends chat message → VIRA extracts → issue created via NEXUS → appears on BMC
   - Citizen asks status → VIRA fetches from data_store → returns friendly response

2. **Test GUARDIAN escalation cascade:**
   - Ensure overdue tasks generate alerts
   - State escalate → issue gets urgent flag → worker sees it
   - WebSocket broadcasts work for alerts

3. **Test PRESCIENT reports:**
   - Daily report generates with correct metrics from seed data
   - Narrative is coherent and relevant
   - Weekly digest includes cross-MC comparison

4. **Test FLEET patterns:**
   - Geographic clustering detects issue clusters in seed data
   - MC comparison ranks correctly
   - Insights are actionable

---

## Phase 6: End-to-end with Frontend (Day 3 — PARALLEL with Yash)

### What to Do
- Verify VIRA chat works from frontend citizen chat widget
- Verify GUARDIAN alerts show on State dashboard escalation panel
- Verify PRESCIENT reports render in BMC reports page
- Verify FLEET comparison data shows on State overview
- Fix any bugs from frontend integration

---

## Phase 7: Final Polish (Day 3)

- Final bug fixes
- Verify all 4 agents work in demo happy-path

### Verification
- All 4 agents work individually (unit)
- All 4 agents work through NEXUS pipeline (integration)
- WebSocket broadcasts from GUARDIAN reach frontend

---

## Files Piyush Owns (ONLY YOU modify these)

```
backend/agents/vira.py
backend/agents/guardian.py
backend/agents/prescient.py
backend/agents/fleet.py
backend/routers/vira_router.py
backend/routers/guardian_router.py
backend/routers/prescient_router.py
backend/routers/fleet_router.py
```

> **DO NOT modify:** `models.py`, `data_store.py`, `main.py`, `ws_manager.py` — if you need changes, ask Stavan.

---

*Piyush — Backend Agent Dev, InfraLens*
