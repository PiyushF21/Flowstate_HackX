# InfraLens — Amit's Implementation Plan

> **Role:** Backend Agent Developer + Data
> **Owns:** LOOP agent, ORACLE agent, FIELD_COPILOT agent, all seed data, their routers + notifications router
> **Prerequisite:** Must wait for Stavan to complete Phase 2 (backend core) before starting

---

## Phase 6: Backend Agents Group C + Seed Data

> ⚠️ **BEFORE STARTING:** Pull latest from `main` branch. You need `models.py`, `data_store.py`, `config.py`, and `ws_manager.py` from Stavan's Phase 2.

### What to Build

#### 1. `agents/loop.py` — Completion Verification & Citizen Feedback

**Purpose:** Closes the resolution loop — proof validation, citizen notification, feedback capture, re-report detection.

```python
# Proof submission:
async def submit_proof(issue_id: str, images: list[str], notes: str = "") -> dict
    # Worker uploads before/after photos
    # Updates issue with proof data
    # Status → "pending_verification"
    # Sends proof to fleet leader for review
    # Returns submission confirmation

# Verification:
async def verify_completion(issue_id: str, verifier_id: str, approved: bool, rejection_reason: str = "") -> dict
    # Fleet leader approves/rejects
    # If approved:
    #   - Status → "resolved"
    #   - Records verified_by, verified_at
    #   - Calculates resolution_time_hours
    #   - Checks sla_met (resolution_time vs SLA)
    #   - Triggers notify_citizen()
    #   - Broadcasts via WebSocket
    # If rejected:
    #   - Status back to "in_progress"
    #   - Sends rejection reason to worker

# Citizen notification:
async def notify_citizen(issue_id: str) -> dict
    # Checks if issue has a reporter_id (not SENSOR-AUTO)
    # Generates notification message
    # Broadcasts via WebSocket to notifications channel
    # Updates issue: citizen_notified = true
    # Returns notification details

# Feedback:
async def submit_feedback(issue_id: str, reporter_id: str, rating: int, comment: str = "") -> dict
    # 1-5 star rating
    # Updates issue with feedback data
    # Updates worker's performance.rating (rolling average)
    # Feeds into MC metrics
    # Returns confirmation

# Re-report detection:
async def check_rereport(gps: dict, radius_m: float = 10, days: int = 30) -> dict | None
    # Searches for resolved issues within radius in last N days
    # If found: flags as "failed_repair"
    # Creates new issue with elevated priority
    # Increments MC's failed_repair count
    # Returns failed repair data or None

# Metrics:
async def get_feedback_metrics(mc: str = None) -> dict
    # Aggregates feedback per MC:
    #   avg_rating, total_feedback_count, rating_distribution
    #   resolution_satisfaction_pct (4+ stars / total)
```

#### 2. `agents/oracle.py` — Fund & Resource Allocation Intelligence

**Purpose:** AI-recommended budget and resource allocation with human-in-loop approval.

```python
# Fund allocation:
async def recommend_fund_allocation() -> dict
    # Analyzes per MC:
    #   - Issue volume (weighted)
    #   - Severity distribution (CRITICAL costs more)
    #   - Historical resolution costs
    #   - Population density (base allocation factor)
    #   - Performance (low performers flagged, not rewarded)
    # Emergency reserve: 15% of total budget
    # Returns allocation recommendations with rationale per MC
    # Uses Grok to generate rationale text

# Resource allocation:
async def recommend_resource_allocation() -> dict
    # Equipment deployment recommendations:
    #   - Based on repair backlog by category
    #   - E.g., growing road issues → more JCBs
    # Crew reallocation:
    #   - Compares MC worker utilization
    #   - Under-utilized MCs → transfer to over-utilized
    # Emergency stockpile positioning
    # Returns list of recommendations with priority

# Human-in-loop approval:
async def approve_fund_allocation(allocation_id: str, approved_by: str, modifications: dict = None) -> dict
    # If modifications: applies adjusted amounts
    # Validates total == budget
    # Records approval with timestamp
    # Returns confirmed allocation

async def approve_resource_allocation(recommendation_id: str, approved_by: str, action: str) -> dict
    # action: "approve" | "reject" | "modify"
    # Records decision
    # Returns confirmation

# Budget tracking:
async def get_budget_tracker() -> dict
    # Per MC: allocated vs spent vs remaining
    # Overall burn rate
    # Cost-per-issue by category
    # Returns tracker data

# Allocation scoring formula:
def calculate_allocation_score(mc_data: dict) -> float
    # base = population_weight * 0.3
    # volume = issue_volume_normalized * 0.3
    # severity = severity_weighted_score * 0.2
    # performance = performance_factor * 0.2 (good performers get maintained, bad get flagged)
```

#### 3. `agents/field_copilot.py` — Worker AI Assistant

**Purpose:** Context-aware AI assistant for field workers. Voice + text, Hindi + English.

```python
# Knowledge base (embedded in prompts):
REPAIR_KNOWLEDGE = {
    "roads": "Pothole repair procedures, asphalt specifications, compaction techniques...",
    "water_pipeline": "Pipe repair, valve operations, pressure testing, material specs...",
    "electrical": "Lockout/tagout, wire gauges, transformer procedures, safety protocols...",
    "sanitation": "Drain clearing, waste management, protective equipment...",
    "structural": "Crack assessment, load-bearing evaluation, IS code references...",
}

SAFETY_PROTOCOLS = {
    "road_repair": "Traffic management, cone placement, high-vis requirements...",
    "electrical": "Lockout/tagout procedure, insulation testing, grounding...",
    "confined_space": "Gas testing, ventilation, buddy system...",
    "heights": "Harness requirements, fall arrest systems...",
}

# Chat:
async def chat(worker_id: str, message: str, task_context: dict = None) -> dict
    # Builds context from:
    #   - Current task (issue type, severity, procedure steps)
    #   - Worker's specialization
    #   - Relevant repair knowledge
    #   - Safety protocols
    # Sends to Grok with low temperature (0.1) for precision
    # Returns text response

# Voice chat:
async def voice_chat(worker_id: str, transcribed_text: str, task_context: dict = None, language: str = "en") -> dict
    # Same as chat but also:
    #   - Formats response for speech (shorter sentences)
    #   - If Sarvam AI key available: generates audio via Sarvam TTS
    #   - Returns text + audio_url/audio_base64
    # Supports "en" (English) and "hi" (Hindi)

# Diagnostic prediction:
async def predict_diagnosis(task_context: dict) -> dict
    # Given current task info, predicts:
    #   - Likely root cause
    #   - Recommended approach
    #   - Potential complications
    #   - Estimated time
    # Uses Grok with task context

# Prompt template:
COPILOT_PROMPT = """
You are FIELD_COPILOT, an AI technical assistant for infrastructure repair workers.
You speak the technical language workers understand — repair procedures, material specs, safety protocols, IS codes.

Current task context:
- Issue: {issue_type} ({severity})
- Location: {location}
- Procedure step they're on: {current_step}
- Specialization: {specialization}

Worker's question: {message}

Provide precise, actionable guidance. Include specific measurements, material grades, and safety warnings where relevant.
Keep responses concise — workers need quick answers on-site.
Temperature: 0.1 (high precision, minimal creativity)
"""
```

#### 4. Seed Data

**`seed_data/issues.json`** — 25-30 sample issues:
- Mix of sources: ~10 car_sensor, ~8 360_capture, ~10 manual_complaint
- All severity levels: 3 CRITICAL, 7 HIGH, 12 MEDIUM, 8 LOW
- All statuses: 5 reported, 6 assigned, 8 in_progress, 10 resolved, 1 escalated
- Categories: 8 roads, 5 water, 4 electrical, 5 sanitation, 3 structural, 3 traffic, 2 environment
- Locations: Mumbai (multiple wards), Pune, Nagpur
- Include realistic descriptions, GPS coordinates, timestamps

**`seed_data/workers.json`** — 15-20 workers:
- Specializations: 5 Roads, 3 Hydraulic, 3 Electrical, 3 Sanitation, 2 Structural, 2 Traffic
- Zones: K-West, K-East, H-West, S-Ward, L-Ward (Mumbai), Pune, Nagpur
- Statuses: 8 available, 8 on_task, 4 off_duty
- Varied performance stats (rating 3.2-4.8, on_time 70%-98%)
- Include shift times, GPS locations, current_task_ids for on_task workers

**`seed_data/mcs.json`** — 8 Municipal Corporations:
- BMC Mumbai, PMC Pune, NMC Nagpur, NMC Nashik, TMC Thane, RMC Ratnagiri, KMC Kolhapur, AMC Aurangabad
- Each with: total_workers, issues_this_week, resolution_rate, avg_resolution_hours
- Varied performance: 2 excellent (85%+), 3 good (70-84%), 2 mediocre (55-69%), 1 poor (<55%)

**`seed_data/reports.json`** — 5 sample daily reports:
- 3 for BMC Mumbai (different dates)
- 1 for PMC Pune
- 1 for NMC Nagpur
- Include full report structure with by_category, by_severity, worst_wards

#### 5. Routers

```python
# routers/loop_router.py
#   POST /api/loop/verify        — body: { issue_id, verifier_id, approved, rejection_reason }
#   POST /api/loop/feedback      — body: { issue_id, reporter_id, rating, comment }
#   GET  /api/loop/metrics       — query: ?mc=bmc-mumbai

# routers/oracle_router.py
#   GET  /api/oracle/recommend-funds       — AI fund allocation recommendation
#   POST /api/oracle/approve-funds         — body: { allocation_id, approved_by, modifications }
#   GET  /api/oracle/recommend-resources   — equipment/crew recommendations
#   POST /api/oracle/approve-resources     — body: { recommendation_id, approved_by, action }
#   GET  /api/oracle/budget-tracker        — MC-wise budget utilization

# routers/field_copilot_router.py
#   POST /api/field-copilot/chat     — body: { worker_id, message, task_context }
#   POST /api/field-copilot/voice    — body: { worker_id, transcribed_text, task_context, language }
#   POST /api/field-copilot/predict  — body: { task_context }

# routers/notifications_router.py
#   GET  /api/notifications          — query: ?user_id=CIT-USR-0042
#   POST /api/notifications/read     — body: { notification_id }
```

### Verification
- `POST /api/loop/verify` with approved=true → issue status becomes "resolved", citizen notified
- `POST /api/loop/feedback` with rating=4 → feedback stored, worker rating updated
- `GET /api/oracle/recommend-funds` → returns MC-wise allocation with rationale
- `POST /api/oracle/approve-funds` → records approval
- `POST /api/field-copilot/chat` with "The pothole is 8 inches deep, what do I do?" → returns technical guidance
- `GET /api/notifications` for a citizen → returns their notifications
- Seed data loads correctly: `GET /api/issues` returns 25-30 issues, `GET /api/commander/workers` returns 15-20 workers

---

## Phase 10: Integration (Amit's Part)

### What to Do

1. **Test LOOP end-to-end:**
   - Worker submits proof → fleet leader verifies → citizen gets notification
   - Test re-report detection (create issue near a resolved issue's GPS)
   - Verify feedback updates worker performance score

2. **Test ORACLE:**
   - Fund recommendation generates sensible allocations based on seed data
   - Approve flow works with modifications
   - Budget tracker reflects allocations

3. **Test FIELD_COPILOT:**
   - Chat responds to technical questions with precise answers
   - Task context is used in responses
   - Hindi responses work (if LLM supports)
   - Voice response includes audio (if Sarvam key available)

4. **Verify seed data:**
   - All JSON files load without errors
   - Data relationships are consistent (worker assigned to issue → worker.current_task_id matches)
   - GPS coordinates are real Mumbai/Pune/Nagpur locations
   - Dates/timestamps are realistic

5. **Fix any bugs** in your 3 agents + seed data

### Verification
- All 3 agents work individually
- LOOP integrates with NEXUS pipeline (end of task lifecycle)
- Seed data is consistent and realistic
- Notifications reach frontend via WebSocket

---

## Files Amit Owns (ONLY YOU modify these)

```
backend/agents/loop.py
backend/agents/oracle.py
backend/agents/field_copilot.py
backend/routers/loop_router.py
backend/routers/oracle_router.py
backend/routers/field_copilot_router.py
backend/routers/notifications_router.py
backend/seed_data/issues.json
backend/seed_data/workers.json
backend/seed_data/mcs.json
backend/seed_data/reports.json
```

> **DO NOT modify:** `models.py`, `data_store.py`, `main.py`, `ws_manager.py` — if you need changes, ask Stavan.

---

*Amit — Backend Agent Dev + Data, InfraLens*
