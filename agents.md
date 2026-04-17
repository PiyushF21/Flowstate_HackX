# InfraLens — AI Agent Architecture

> **11 Specialized AI Agents** powering the full lifecycle of civic infrastructure issue detection, assignment, resolution, and accountability.

---

## The 11 Agents — Overview

| # | Agent | Role | Portal |
|---|---|---|---|
| 1 | **NEXUS** | Master Supervisor & Orchestrator — routes issues through the agent pipeline | Backend (all portals) |
| 2 | **COGNOS** | Issue Detection & Classification Engine — dual-brain analysis of sensor data, images, and complaints | Backend → BMC Portal |
| 3 | **VIRA** | Citizen Voice/Chat Interface — natural-language complaint intake and status queries | Citizen App |
| 4 | **COMMANDER** | Task Auto-Assignment Engine — matches issues to workers by expertise, proximity, and workload | BMC Portal → Worker Portal |
| 5 | **FLEET** | Cross-MC Pattern Analytics — detects infrastructure failure trends and performance gaps statewide | State Government Portal |
| 6 | **SENTINEL** | Security & RBAC — enforces role-based access control with immutable audit logging | All portals (middleware) |
| 7 | **LOOP** | Completion Verification & Citizen Feedback — proof validation, citizen notification, re-report detection | All portals |
| 8 | **GUARDIAN** | Deadline Monitor & Escalation Engine — flags overdue tasks, cascades alerts from State → BMC → Worker | State → BMC → Worker |
| 9 | **PRESCIENT** | Daily/Weekly Reporting & Forecasting — auto-generates MC performance reports for state government | BMC → State Portal |
| 10 | **ORACLE** | Fund & Resource Allocation Intelligence — recommends budget and equipment distribution with human-in-loop | State Government Portal |
| 11 | **FIELD_COPILOT** | Worker AI Assistant — voice/chat technical guidance for on-site problem solving | Worker Portal |

---

## Agent Deep Dives

---

### 🧠 1. NEXUS (Master Supervisor & Orchestrator)

**Functionality:**
The central brain of InfraLens. NEXUS receives all incoming data — car sensor anomalies, 360° image uploads, and citizen complaints — and orchestrates the entire issue lifecycle by routing data through the correct sequence of sub-agents. It classifies the issue source, determines the target MC (Municipal Corporation), and dynamically constructs the agent pipeline.

**Powered By:** LangGraph (StateGraph orchestration) + Conditional Python Rules

**Portal:** Backend (invisible to users — powers all portals)

**Pipeline Logic:**
```
Incoming Data
  → classify_source (car_sensor / 360_capture / manual_complaint)
    → COGNOS (classification + severity)
      → SENTINEL (verify permissions)
        → conditional_router:
          → CRITICAL: COGNOS → COMMANDER (immediate dispatch) → GUARDIAN (monitor) → END
          → HIGH: COGNOS → COMMANDER → END
          → MEDIUM: COGNOS → COMMANDER → END
          → LOW: COGNOS → COMMANDER → END (lower priority queue)
```

**State Schema (LangGraph TypedDict):**
```python
class AgentState(TypedDict):
    issue_id: str
    source: str               # car_sensor | 360_capture | manual_complaint
    raw_data: dict             # Raw sensor/image/complaint data
    classification: dict       # COGNOS output
    severity: str              # CRITICAL | HIGH | MEDIUM | LOW
    location: dict             # GPS + ward + city
    mc: str                    # Target Municipal Corporation
    assignment: dict           # COMMANDER output
    worker_id: str             # Assigned worker
    procedure: list[str]       # Generated steps
    deadline: str              # ISO timestamp
    status: str                # reported → assigned → in_progress → resolved → escalated
    escalation: dict           # GUARDIAN escalation data if any
    completion: dict           # LOOP verification data
    execution_steps: list[str] # Audit trail of agents executed
```

**Endpoints:**
- `POST /api/nexus/process` — Process a new incoming issue through the full pipeline
- `GET /api/nexus/status/{issue_id}` — Get current pipeline status for an issue

**Sample Output:**
```json
{
  "agent": "NEXUS",
  "issue_id": "ISS-MUM-2026-04-17-0042",
  "source": "car_sensor",
  "severity": "HIGH",
  "mc": "BMC Mumbai",
  "steps_executed": ["classify_source", "COGNOS", "SENTINEL", "COMMANDER"],
  "assignment": {
    "worker_id": "WRK-MUM-015",
    "worker_name": "Ganesh Patil",
    "deadline": "2026-04-17T18:00:00+05:30"
  },
  "graph_mode": "langgraph",
  "timestamp": "2026-04-17T10:31:00+05:30"
}
```

---

### 🔍 2. COGNOS (Issue Detection & Classification Engine)

**Functionality:**
A dual-brain detection engine that processes all three data sources:

**Brain 1 — Rule Engine (Fast, Deterministic):**
- **Car sensor data:** Analyzes accelerometer readings. Y-axis jolt > 2.0g at speed > 20 km/h → pothole. Jolt magnitude maps to severity (Minor/Moderate/Severe). Cross-validates against recent reports at the same GPS cluster (within 10m radius) — if 3+ vehicles report, confidence is CONFIRMED.
- **360° images:** After COGNOS LLM Vision classifies the image, the rule engine maps categories to severity: complete road blockage → CRITICAL, partial obstruction → HIGH, aesthetic issue → LOW.
- **Manual complaints:** Maps citizen-selected category + subcategory to a normalized issue type. Applies severity heuristics: "burst pipe flooding road" → HIGH, "overflowing bin" → MEDIUM.

**Brain 2 — LLM (Contextual, Intelligent):**
- For **car sensor data:** Generates natural-language description: "Confirmed pothole on Western Express Highway near Andheri, KM 14.2. Severity HIGH based on 3 vehicle sensor reports within 2 hours."
- For **360° images:** Uses Grok Vision by xAI to analyze images. Identifies: what's wrong (fallen divider, garbage pile, broken signal), severity (how much of the road is affected), and recommended issue category.
- For **manual complaints:** Validates citizen's self-assessment. If citizen says "LOW" but describes a burst pipe → LLM overrides to HIGH. Extracts structured data from free-text descriptions.

**Fusion:** Takes the higher severity from both brains. Generates a merged issue report.

**Powered By:** Rule Engine (Python thresholds) + Grok by xAI (grok-3) + Grok Vision by xAI (for image analysis)

**Portal:** Backend processing (results visible on BMC Portal)

**Infrastructure Fault Codes:**
```python
FAULT_CODES = {
    "RD-001": "Pothole detected — road surface cavity",
    "RD-002": "Road cave-in — subsurface collapse",
    "RD-003": "Missing manhole cover",
    "RD-004": "Broken footpath / pavement damage",
    "RD-005": "Faded road markings",
    "OB-001": "Fallen road divider / barrier",
    "OB-002": "Debris / construction waste on road",
    "OB-003": "Fallen tree / branch obstruction",
    "SN-001": "Garbage accumulation",
    "SN-002": "Drain / sewer blockage",
    "SN-003": "Sewage overflow on road",
    "WT-001": "Water pipeline burst",
    "WT-002": "Water contamination report",
    "WT-003": "Low water pressure zone",
    "EL-001": "Street light malfunction",
    "EL-002": "Exposed electrical wiring",
    "EL-003": "Traffic signal failure",
    "EL-004": "Transformer issue",
    "ST-001": "Structural crack — building / wall",
    "ST-002": "Bridge / flyover damage report",
    "ST-003": "Retaining wall damage",
}
```

**Severity Scoring (Rule Engine):**
```python
# Car sensor pothole detection
def score_sensor_data(data):
    jolt_y = abs(data["accelerometer"]["y"])
    speed = data["speed_kmh"]
    
    if speed < 20:
        return "LOW", 10  # Low speed, could be speed bump
    
    if jolt_y > 4.0:
        severity_score = 80  # CRITICAL — deep pothole or cave-in
    elif jolt_y > 2.5:
        severity_score = 55  # HIGH
    elif jolt_y > 2.0:
        severity_score = 30  # MEDIUM
    else:
        severity_score = 10  # LOW — minor road roughness
    
    # Cross-validation bonus
    nearby_reports = count_reports_in_radius(data["gps"], radius_m=10, hours=4)
    if nearby_reports >= 3:
        severity_score = min(severity_score + 20, 100)  # Boosted confidence
    
    # Severity mapping
    if severity_score >= 70: return "CRITICAL", severity_score
    if severity_score >= 40: return "HIGH", severity_score
    if severity_score >= 15: return "MEDIUM", severity_score
    return "LOW", severity_score
```

**Endpoints:**
- `POST /api/cognos/analyze-sensor` — Analyze car sensor data for pothole/anomaly
- `POST /api/cognos/analyze-image` — Analyze 360° image for road hazard classification
- `POST /api/cognos/classify-complaint` — Classify a manual citizen complaint

**Sample Output (sensor):**
```json
{
  "agent": "COGNOS",
  "issue_id": "ISS-MUM-2026-04-17-0042",
  "source": "car_sensor",
  "fused_severity": "HIGH",
  "rule_engine": {
    "brain": "rule_engine",
    "severity": "HIGH",
    "severity_score": 60,
    "jolt_magnitude_g": 3.2,
    "speed_kmh": 45,
    "cross_validation_count": 3,
    "confidence": "CONFIRMED"
  },
  "llm_classification": {
    "brain": "grok_llm",
    "severity": "HIGH",
    "description": "Confirmed pothole on Western Express Highway near Andheri, KM 14.2. Severity HIGH based on 3 vehicle sensor reports within 2 hours.",
    "category": "roads",
    "subcategory": "pothole",
    "fault_code": "RD-001",
    "confidence": 0.92
  },
  "location": {
    "lat": 19.1196,
    "lng": 72.8467,
    "address": "Western Express Highway, KM 14.2",
    "ward": "K-West",
    "city": "Mumbai"
  },
  "timestamp": "2026-04-17T10:31:00+05:30"
}
```

**Sample Output (360° image):**
```json
{
  "agent": "COGNOS",
  "issue_id": "ISS-MUM-2026-04-17-0089",
  "source": "360_capture",
  "fused_severity": "CRITICAL",
  "vision_analysis": {
    "brain": "grok_vision",
    "detected_objects": ["fallen_road_divider", "scattered_debris"],
    "road_blockage_pct": 60,
    "safety_hazard": true,
    "description": "Concrete road divider has collapsed across two lanes of SV Road near Bandra Station. Approximately 60% lane blockage with scattered concrete debris.",
    "category": "traffic",
    "subcategory": "broken_divider",
    "fault_code": "OB-001"
  },
  "timestamp": "2026-04-17T11:16:00+05:30"
}
```

---

### 🎙️ 3. VIRA (Citizen Voice/Chat Interface)

**Functionality:**
A natural-language AI assistant on the Citizen App. VIRA handles two core jobs:

1. **Complaint intake via voice:** Citizens describe issues verbally. VIRA transcribes, extracts category/severity/location, and creates a structured complaint — replacing manual form filling. "There's a huge pothole near Andheri metro, almost broke my tire" → extracts: category=roads, subcategory=pothole, severity=HIGH, location=Near Andheri Metro.

2. **Status queries:** Citizens ask about their complaints. "What happened to my water pipe complaint?" → VIRA fetches the issue status and responds: "Your complaint about the burst pipe near Powai Lake was assigned to a repair crew at 11 AM. They're currently on-site and estimated to finish by 4 PM."

VIRA does NOT handle BMC/State/Worker interactions — it is purely citizen-facing.

**Powered By:** Grok by xAI (grok-3) + LangChain Prompt Templates + Sarvam AI TTS + Web Speech API STT

**Portal:** Citizen App

**Conversation modes:**
- **Report mode:** Citizen is describing a problem → VIRA extracts structured data → creates issue via NEXUS
- **Query mode:** Citizen is asking about existing issue → VIRA fetches status from backend → responds
- **General mode:** Citizen asks general questions → VIRA answers or redirects

**Endpoints:**
- `POST /api/vira/chat` — Text message from citizen
- `POST /api/vira/voice` — Voice input (transcribed + processed)

**Sample Output:**
```json
{
  "agent": "VIRA",
  "response": "Got it! I've registered your complaint about the burst water pipe near Powai Lake Gate 2. It's been classified as HIGH severity and has been sent to BMC Mumbai. You'll get a notification as soon as a repair crew is assigned. Is there anything else you need help with?",
  "action_taken": "issue_created",
  "issue_id": "ISS-MUM-2026-04-17-0078",
  "extracted_data": {
    "category": "water_pipeline",
    "subcategory": "burst_pipe",
    "severity": "HIGH",
    "location_text": "Powai Lake Gate 2"
  },
  "powered_by": "grok",
  "timestamp": "2026-04-17T14:01:00+05:30"
}
```

---

### ⚙️ 4. COMMANDER (Task Auto-Assignment Engine)

**Functionality:**
The logistics brain of InfraLens. When COGNOS classifies an issue, COMMANDER instantly determines the optimal worker or crew to assign and auto-dispatches the task. This is the core agent that eliminates manual supervisory overhead at the BMC.

**Assignment algorithm (multi-factor scoring):**

```
Score(worker, issue) =
    w1 × expertise_match_score        (0 or 1 — binary match)
  + w2 × proximity_score              (inverse distance, normalized)
  + w3 × workload_balance_score       (fewer current tasks = higher)
  + w4 × shift_availability_score     (is worker on shift? 0 or 1)
  + w5 × performance_score            (historical on-time completion %)
```

Weights: `w1=0.35, w2=0.25, w3=0.20, w4=0.10, w5=0.10`

**For CRITICAL severity:** COMMANDER can preempt — reassign a worker from a LOW/MEDIUM task to the CRITICAL task immediately.

**What COMMANDER generates per assignment:**
1. **Worker/crew selection** — who is assigned
2. **Deadline** — based on severity SLA (CRITICAL: 4h, HIGH: 12h, MEDIUM: 48h, LOW: 7d)
3. **Step-by-step procedure** — AI-generated based on issue type (using LLM with issue context)
4. **Materials list** — what tools/materials the worker should bring
5. **Team composition** — for larger tasks, assembles a crew from available workers

**Powered By:** Python Multi-Factor Scoring Algorithm + Grok by xAI (grok-3) for procedure generation

**Portal:** BMC Field Operations Portal (executes here, results visible on Worker Portal)

**Specialization categories:**
```python
SPECIALIZATIONS = {
    "roads": ["Roads & Asphalt", "Structural"],
    "water_pipeline": ["Hydraulic & Plumbing"],
    "electrical": ["Electrical & Power"],
    "sanitation": ["Sanitation & Waste"],
    "structural": ["Structural", "Civil Engineering"],
    "traffic": ["Traffic & Signaling"],
    "environment": ["Environmental & Landscaping"],
}
```

**Endpoints:**
- `POST /api/commander/assign` — Auto-assign a classified issue to a worker
- `GET /api/commander/workers` — Get all workers with current status
- `POST /api/commander/reassign` — Reassign a task (supervisor override or escalation)
- `GET /api/commander/workload` — Get workload distribution across workers

**Sample Output:**
```json
{
  "agent": "COMMANDER",
  "status": "assigned",
  "issue_id": "ISS-MUM-2026-04-17-0042",
  "assignment": {
    "worker_id": "WRK-MUM-015",
    "worker_name": "Ganesh Patil",
    "specialization": "Roads & Asphalt",
    "team": [
      { "id": "WRK-MUM-015", "name": "Ganesh Patil", "role": "fleet_leader" },
      { "id": "WRK-MUM-022", "name": "Ravi Shinde", "role": "field_worker" },
      { "id": "WRK-MUM-031", "name": "Manoj Yadav", "role": "field_worker" }
    ],
    "distance_km": 2.3,
    "current_workload": 1,
    "assignment_score": 0.87
  },
  "deadline": "2026-04-17T18:00:00+05:30",
  "procedure": [
    "1. Assess pothole dimensions (length, width, depth)",
    "2. Clear loose debris and standing water",
    "3. Cut edges to create clean vertical walls (if diameter > 30cm)",
    "4. Apply tack coat to edges and base",
    "5. Fill with cold-mix asphalt in 5cm layers",
    "6. Compact each layer with vibrating plate compactor",
    "7. Final surface should be flush with surrounding road",
    "8. Upload before/after photos as proof",
    "9. Flag for permanent hot-mix overlay within 7 days if depth > 15cm"
  ],
  "materials_required": [
    "Cold-mix asphalt (50kg bags × 2)",
    "Tack coat spray (1 can)",
    "Vibrating plate compactor",
    "Road-cutting saw (if needed)",
    "Broom and shovel",
    "Safety cones (4)",
    "High-visibility vest"
  ],
  "timestamp": "2026-04-17T10:35:00+05:30"
}
```

---

### 🌐 5. FLEET (Cross-MC Pattern Analytics)

**Functionality:**
Monitors all Municipal Corporations statewide to detect macro-level infrastructure failure patterns. Identifies clusters, trends, and anomalies that no single MC would notice on its own.

**Analysis capabilities:**
1. **Geographic clustering:** "12 pothole reports in a 500m stretch of NH-48 near Pune in 3 days" → Indicates subgrade failure, not just surface potholes
2. **Seasonal trending:** "Water pipe burst complaints up 300% across coastal MCs during monsoon" → Trigger pre-monsoon inspection campaign
3. **Category anomalies:** "Electrical complaints in Nashik MC doubled this month vs historical average" → Possible transformer aging issue
4. **Cross-MC comparison:** "Pune MC resolves road issues in avg 4.2 hours, while Nagpur MC takes 18.6 hours" → Performance gap flag
5. **Recurrence detection:** "This GPS location has been reported 4 times in 60 days despite being marked resolved each time" → Failed repair / deeper structural issue

**Powered By:** Python Clustering Logic + Grok by xAI (grok-3) for insight generation

**Portal:** State Government Portal

**Endpoints:**
- `GET /api/fleet/patterns` — Detect failure patterns across all MCs
- `GET /api/fleet/insights` — Generate AI-powered strategic insights
- `GET /api/fleet/compare` — Compare MC performance metrics
- `GET /api/fleet/trends` — Time-series trend analysis by category/region

**Sample Output:**
```json
{
  "agent": "FLEET",
  "insights": [
    {
      "type": "geographic_cluster",
      "insight": "14 pothole reports in a 500m stretch of NH-48 (KM 42-42.5) near Pune in the last 5 days. This suggests subgrade failure rather than surface wear. Recommend full road assessment.",
      "priority": "HIGH",
      "mc": "PMC Pune",
      "action": "Issue comprehensive road assessment order for NH-48 KM 42-45 segment."
    },
    {
      "type": "seasonal_trend",
      "insight": "Water pipeline burst complaints across coastal MCs (Mumbai, Ratnagiri, Sindhudurg) are 280% above the 12-month average. Monsoon-related soil erosion is likely compromising underground pipelines.",
      "priority": "HIGH",
      "action": "Trigger pre-monsoon pipeline inspection campaign for all coastal MCs."
    },
    {
      "type": "performance_gap",
      "insight": "Nagpur MC's average resolution time for CRITICAL issues is 8.2 hours vs the state average of 3.1 hours. Worker utilization is only 54%.",
      "priority": "MEDIUM",
      "action": "Schedule performance review with Nagpur MC. Consider crew reallocation."
    }
  ],
  "powered_by": "grok",
  "timestamp": "2026-04-17T18:00:00+05:30"
}
```

---

### 🛡️ 6. SENTINEL (Security & RBAC)

**Functionality:**
Security middleware for the entire platform. Enforces role-based access control across all four portals. Ensures citizens can only see their own complaints, BMC supervisors can only see their MC's data, workers can only see their assigned tasks, and state officials see aggregated data. Maintains an immutable audit log of every agent action and user interaction.

**Powered By:** Python Security Middleware + File-based Audit Logging

**Portal:** All portals (middleware layer)

**Role definitions:**
```python
ROLES = {
    "citizen": {
        "scope": "own_complaints_only",
        "can_access": ["/api/vira/*", "/api/issues/mine", "/api/notifications"],
        "cannot_access": ["/api/fleet/*", "/api/commander/*", "/api/oracle/*"]
    },
    "bmc_supervisor": {
        "scope": "own_mc_only",
        "can_access": ["/api/issues/*", "/api/commander/*", "/api/workers/*"],
        "cannot_access": ["/api/oracle/funds", "/api/fleet/compare"]
    },
    "field_worker": {
        "scope": "assigned_tasks_only",
        "can_access": ["/api/tasks/mine", "/api/field-copilot/*", "/api/tasks/complete"],
        "cannot_access": ["/api/commander/*", "/api/fleet/*", "/api/oracle/*"]
    },
    "state_official": {
        "scope": "all_mcs_aggregated",
        "can_access": ["/api/fleet/*", "/api/oracle/*", "/api/prescient/*", "/api/guardian/*"],
        "cannot_access": ["/api/commander/assign"]  # State can't directly assign workers
    },
    "nexus_admin": {
        "scope": "full",
        "can_access": ["*"]
    }
}
```

**Endpoints:**
- `GET /api/sentinel/audit` — Retrieve audit log (filtered by role permissions)
- Middleware intercepts every API request — no dedicated endpoint needed

**Sample Audit Entry:**
```json
{
  "id": "AUD-0042",
  "agent": "SENTINEL",
  "action": "commander_assign",
  "role": "bmc_supervisor",
  "user_id": "BMC-SUP-003",
  "outcome": "allowed",
  "details": {
    "issue_id": "ISS-MUM-2026-04-17-0042",
    "mc": "BMC Mumbai",
    "permission_level": "own_mc_only"
  },
  "timestamp": "2026-04-17T10:35:00+05:30"
}
```

---

### ♻️ 7. LOOP (Completion Verification & Citizen Feedback)

**Functionality:**
Closes the resolution loop. Handles three critical functions:

1. **Proof validation pipeline:** When a worker uploads before/after photos and marks a task complete, LOOP processes the submission. The proof is sent to the fleet leader for manual verification. Once approved, the task status transitions to RESOLVED.

2. **Citizen notification:** If the issue originated from a manual complaint or 360° capture (i.e., has a reporter_id), LOOP triggers a notification to the citizen: "Your reported issue has been resolved" with proof photos attached.

3. **Feedback capture:** Citizens can rate the resolution (1-5 stars) and leave comments. This feedback:
   - Feeds into the MC's daily report (PRESCIENT)
   - Affects the worker's performance score (used by COMMANDER for future assignments)
   - Contributes to MC accountability scores (visible to State Government)

4. **Re-report detection:** If a new issue is reported at the same GPS location (within 10m radius) within 30 days of a "RESOLVED" issue, LOOP flags it as a **failed repair**. This creates a special "re-opened" issue with higher priority and is tracked separately in MC performance metrics.

**Powered By:** Statistical Weighting + GPS Proximity Matching

**Portal:** Citizen App (feedback), BMC Portal (verification), State Portal (metrics)

**Endpoints:**
- `POST /api/loop/verify` — Fleet leader verifies completion proof
- `POST /api/loop/feedback` — Citizen submits satisfaction rating
- `GET /api/loop/metrics` — Aggregated feedback metrics per MC

**Sample Output (verification):**
```json
{
  "agent": "LOOP",
  "action": "task_verified",
  "issue_id": "ISS-MUM-2026-04-17-0042",
  "verified_by": "Fleet Leader — Suresh Naik",
  "proof_images_count": 2,
  "citizen_notified": true,
  "citizen_notification": {
    "reporter_id": "SENSOR-AUTO",
    "message": "The pothole on Western Express Highway near Andheri has been repaired.",
    "sent_at": "2026-04-17T15:46:00+05:30"
  },
  "timestamp": "2026-04-17T15:45:00+05:30"
}
```

**Sample Output (re-report detection):**
```json
{
  "agent": "LOOP",
  "action": "failed_repair_detected",
  "original_issue_id": "ISS-MUM-2026-03-20-0018",
  "new_issue_id": "ISS-MUM-2026-04-17-0099",
  "location": { "lat": 19.1196, "lng": 72.8467 },
  "days_since_resolution": 28,
  "priority_boost": "elevated — flagged as recurring failure",
  "mc_performance_impact": "failed_repair count incremented for BMC Mumbai"
}
```

---

### 🚨 8. GUARDIAN (Deadline Monitor & Escalation Engine)

**Functionality:**
The watchdog agent. GUARDIAN continuously monitors all active tasks across all MCs and triggers escalation alerts when deadlines are exceeded or when MC performance drops below acceptable thresholds.

**Monitoring rules:**
1. **Task deadline breach:** If any CRITICAL task is unresolved 30 minutes past its SLA → GUARDIAN generates an alert
2. **HIGH task overdue:** If a HIGH task exceeds SLA by >4 hours → alert
3. **MC performance drop:** If any MC's daily resolution rate drops below 60% → alert
4. **Repeated failure:** If the same location has 3+ resolved-then-re-reported issues → structural problem alert
5. **Worker idle anomaly:** If a worker marked "on_task" shows no GPS movement for >2 hours → flag

**Escalation cascade:**
```
GUARDIAN detects overdue task
  → Alert appears on State Government Portal
    → State official reviews and clicks "Escalate"
      → Urgent alert sent to BMC Portal (red banner on the task)
        → COMMANDER re-evaluates assignment (may add crew, reassign, increase priority)
          → Worker sees "URGENT — State Escalated" flag on their portal
```

**Autonomous alerts (no state official action needed):**
- For CRITICAL issues past SLA: GUARDIAN auto-flags on BMC portal without waiting for state intervention
- State portal receives the alert simultaneously for visibility

**Powered By:** Background Task Runner + SLA Monitoring Rules + WebSocket Broadcasting

**Portal:** State Government Portal (primary), BMC Portal (receives escalations), Worker Portal (sees urgent flags)

**Endpoints:**
- `GET /api/guardian/alerts` — Get all active escalation alerts
- `POST /api/guardian/escalate` — State official manually escalates a flagged issue
- `GET /api/guardian/overdue` — List all overdue tasks across all MCs

**Sample Output:**
```json
{
  "agent": "GUARDIAN",
  "alert_type": "task_deadline_breach",
  "severity": "CRITICAL",
  "issue_id": "ISS-PUN-2026-04-17-0014",
  "issue_description": "Water main burst on FC Road — flooding two lanes",
  "mc": "PMC Pune",
  "sla_deadline": "2026-04-17T14:30:00+05:30",
  "current_time": "2026-04-17T15:45:00+05:30",
  "overdue_by_minutes": 75,
  "assigned_worker": "WRK-PUN-008 — Mohan Jadhav",
  "worker_status": "on_task",
  "recommended_action": "Assign additional crew. Consider deploying pump truck from Depot-C.",
  "escalation_level": "auto_flagged",
  "timestamp": "2026-04-17T15:45:00+05:30"
}
```

---

### 📊 9. PRESCIENT (Daily/Weekly Reporting & Forecasting Agent)

**Functionality:**
The reporting engine. PRESCIENT generates structured daily and weekly reports that flow from each MC to the State Government. It also generates predictive forecasts.

**Daily report (auto-generated at 6 PM IST):**
- Issues received today (total + by category + by severity)
- Issues resolved today
- Issues pending + overdue
- Worker utilization %
- Average resolution time by category
- Worst-performing wards
- Escalated tasks count
- Fund utilization %

**Weekly digest (auto-generated every Monday 9 AM IST):**
- Week-over-week trends (issue volume, resolution rate)
- Category-wise analysis (are pothole complaints increasing?)
- MC performance comparison (if state-level)
- **Predictive warnings:** "Monsoon season approaching — historically, drainage complaints increase 4x in Mumbai during June-July. Pre-position sanitation crews."
- Resource reallocation recommendations

**Predictive capabilities:**
- Seasonal forecasting based on historical data
- Trend detection (is a category growing week over week?)
- Resource need prediction (if issue volume is rising, more workers needed)

**Powered By:** Statistical Analysis + Grok by xAI (grok-3) for narrative generation

**Portal:** State Government Portal (receives reports), BMC Portal (generates reports)

**Endpoints:**
- `GET /api/prescient/daily/{mc_id}` — Get today's daily report for an MC
- `GET /api/prescient/weekly` — Get the weekly state-level digest
- `GET /api/prescient/forecast/{mc_id}` — Get predictive forecast for an MC
- `POST /api/prescient/generate` — Force-generate a report (manual trigger)

**Sample Output (daily):**
```json
{
  "agent": "PRESCIENT",
  "report_type": "daily",
  "mc": "BMC Mumbai",
  "date": "2026-04-17",
  "summary": {
    "issues_received": 156,
    "issues_resolved": 134,
    "resolution_rate_pct": 85.9,
    "issues_overdue": 4,
    "avg_resolution_hours": 5.2,
    "worker_utilization_pct": 78
  },
  "narrative": "BMC Mumbai processed 156 issues today with an 85.9% resolution rate, above the 75% target. 4 tasks remain overdue, including 1 CRITICAL water main issue in K-West ward (75 minutes past SLA, currently being escalated by GUARDIAN). Road repair was the highest-volume category with 45 issues, of which 40 were resolved. Recommendation: Deploy additional sanitation crew to L-Ward where garbage complaints are 30% above weekly average.",
  "generated_by": "PRESCIENT",
  "generated_at": "2026-04-17T18:00:00+05:30"
}
```

---

### 💰 10. ORACLE (Fund & Resource Allocation Intelligence)

**Functionality:**
The state-level resource brain. ORACLE analyzes issue volume, severity distribution, resolution costs, and MC performance to recommend how the state should allocate maintenance funds and physical resources across MCs. This is the **human-in-loop** agent — all ORACLE recommendations require state official approval before taking effect.

**What ORACLE recommends:**

1. **Fund allocation:**
   - Base allocation: Proportional to MC population and infrastructure inventory
   - Dynamic adjustment: MCs with higher issue volume get proportionally more
   - Performance factor: MCs with consistently low resolution rates get flagged (possible audit, not more money)
   - Emergency reserve: 15% of state budget held for CRITICAL incidents

2. **Resource allocation:**
   - Equipment deployment: "Deploy 2 additional JCBs to Pune MC — road repair backlog is growing"
   - Crew reallocation: "Transfer 8 workers from Nashik MC (currently at 40% utilization) to Mumbai MC (92% utilization)"
   - Emergency stockpile: "Position 200 bags of cold-mix asphalt at Chakan depot before monsoon"

3. **Budget tracking:**
   - MC-wise fund usage vs allocation
   - Cost-per-issue analysis by category
   - ROI on preventive vs reactive maintenance

**Powered By:** Demand Analysis + Cost Modelling + Grok by xAI (grok-3) for explanation generation

**Portal:** State Government Portal (exclusively)

**Endpoints:**
- `GET /api/oracle/recommend-funds` — Get AI-recommended fund allocation across MCs
- `POST /api/oracle/approve-funds` — State official approves allocation (human-in-loop)
- `GET /api/oracle/recommend-resources` — Get equipment/crew reallocation recommendations
- `POST /api/oracle/approve-resources` — State official approves resource move
- `GET /api/oracle/budget-tracker` — MC-wise budget utilization dashboard

**Sample Output:**
```json
{
  "agent": "ORACLE",
  "action": "fund_recommendation",
  "fiscal_period": "Q1 FY2026-27",
  "total_budget_cr": 450,
  "recommendations": [
    {
      "mc": "BMC Mumbai",
      "recommended_allocation_cr": 120,
      "rationale": "Highest issue volume (4,200/month), highest population density. Resolution rate 86% — well above target. Fund allocation maintains current capacity.",
      "priority_categories": ["roads", "water_pipeline"]
    },
    {
      "mc": "PMC Pune",
      "recommended_allocation_cr": 65,
      "rationale": "Issue volume growing 15% month-over-month, primarily road-related. NH-48 corridor requires major rehabilitation (estimated cost: 8 Cr). Additional allocation recommended.",
      "priority_categories": ["roads", "structural"]
    },
    {
      "mc": "NMC Nagpur",
      "recommended_allocation_cr": 40,
      "rationale": "Resolution rate at 55% — significantly below 75% target. Issue is operational, not budgetary. Recommend performance audit before increasing funds. Flagged for review.",
      "flag": "PERFORMANCE_AUDIT_RECOMMENDED"
    }
  ],
  "emergency_reserve_cr": 67.5,
  "approval_required": true,
  "generated_at": "2026-04-17T09:00:00+05:30"
}
```

---

### 🔧 11. FIELD_COPILOT (Worker AI Assistant)

**Functionality:**
Real-time, context-aware AI assistant for field workers at the job site. Provides voice and text-based support for solving on-the-ground problems. Unlike VIRA (which is citizen-facing), FIELD_COPILOT speaks the technical language that workers understand — repair procedures, material specifications, safety protocols, IS code references.

**What FIELD_COPILOT knows:**
- Current task context (issue type, severity, location, procedure steps)
- Infrastructure repair knowledge (road repair, plumbing, electrical, structural)
- Material specifications (pipe diameters, asphalt grades, wire gauges)
- Safety protocols (traffic management during road repair, electrical lockout/tagout)
- Indian Standards codes (IS 1200, IS 2720, IS 456 for structural work)
- Historical repair data (what worked at similar issues before)

**Interaction modes:**
- **Text chat:** Worker types questions
- **Voice chat:** Worker speaks questions → STT transcription → LLM response → TTS playback → Worker hears answer hands-free (critical for on-site use)

**Example interactions:**
```
Worker: "The pothole is deeper than expected, almost 8 inches. What should I do?"
FIELD_COPILOT: "For depth exceeding 15cm (6 inches), do NOT fill entirely with 
cold-mix asphalt. Instead: (1) Fill with compacted gravel/WBM base to within 5cm 
of surface level, (2) Apply tack coat, (3) Top with cold-mix asphalt in 2.5cm layers, 
(4) Compact each layer. Flag this location for permanent hot-mix overlay within 72 hours. 
Also note: at 8 inches, this may indicate subgrade failure — check for drainage issues 
or underground pipe leaks nearby."

Worker: "The valve is completely seized, I can't shut it off"
FIELD_COPILOT: "For a seized gate valve: (1) Apply penetrating oil (WD-40 or equivalent) 
to the valve stem and bonnet area, (2) Wait 10-15 minutes, (3) Attempt to turn with a 
valve key — use steady pressure, not impact, (4) If still seized, try alternating 
quarter-turns clockwise then counter-clockwise to break corrosion, (5) If valve cannot 
be freed, locate the next upstream isolation valve and shut there. Do NOT apply excessive 
force — the bonnet may crack. Inform your fleet leader if isolation requires a wider 
service interruption."
```

**Powered By:** Grok by xAI (grok-3) with low temperature (0.1) for technical precision + Sarvam AI TTS (male voice, `amit` speaker) + Web Speech API STT

**Portal:** Worker Portal

**Endpoints:**
- `POST /api/field-copilot/chat` — Text message from worker
- `POST /api/field-copilot/voice` — Voice input from worker (returns text + audio)
- `POST /api/field-copilot/predict` — Generate diagnostic prediction for current task context

**Sample Output:**
```json
{
  "agent": "FIELD_COPILOT",
  "response": "For depth exceeding 15cm, do NOT fill entirely with cold-mix. Fill with compacted gravel base to within 5cm of surface, apply tack coat, then top with cold-mix in 2.5cm layers. Compact each layer. Flag for permanent hot-mix overlay within 72 hours.",
  "audio_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA...",
  "context": {
    "task_id": "ISS-MUM-2026-04-17-0042",
    "issue_type": "pothole",
    "severity": "HIGH"
  },
  "powered_by": "grok (grok-3)",
  "timestamp": "2026-04-17T12:30:00+05:30"
}
```

---

## Agent Interaction Map

```
                            ┌──────────┐
                            │  NEXUS   │
                            │ (Master) │
                            └────┬─────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
              ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐
              │  COGNOS   │ │ VIRA  │ │ SENTINEL  │
              │(Classify) │ │(Citz) │ │  (RBAC)   │
              └─────┬─────┘ └───────┘ └───────────┘
                    │
              ┌─────▼─────┐
              │ COMMANDER │
              │ (Assign)  │
              └─────┬─────┘
                    │
         ┌──────────┼──────────┐
         │          │          │
   ┌─────▼────┐ ┌──▼───┐ ┌───▼──────┐
   │ GUARDIAN  │ │ LOOP │ │ FIELD    │
   │(Deadline) │ │(Cmplt)│ │ COPILOT │
   └─────┬────┘ └──┬───┘ └──────────┘
         │         │
    ┌────▼─────────▼────┐
    │     PRESCIENT     │
    │    (Reporting)    │
    └────────┬──────────┘
             │
    ┌────────▼──────────┐
    │    ┌────────┐     │
    │    │ ORACLE │     │
    │    │(Funds) │     │
    │    └────────┘     │
    │      FLEET        │
    │   (Patterns)      │
    └───────────────────┘
```

---

## Agent-to-Portal Mapping

| Agent | Citizen App | BMC Portal | Worker Portal | State Portal | Backend Only |
|---|:---:|:---:|:---:|:---:|:---:|
| NEXUS | | | | | ✅ |
| COGNOS | | ✅ (results visible) | | | ✅ (processing) |
| VIRA | ✅ | | | | |
| COMMANDER | | ✅ | ✅ (results) | | |
| FLEET | | | | ✅ | |
| SENTINEL | ✅ | ✅ | ✅ | ✅ | |
| LOOP | ✅ (feedback) | ✅ (verification) | ✅ (proof upload) | ✅ (metrics) | |
| GUARDIAN | | ✅ (receives alerts) | ✅ (urgent flags) | ✅ (monitors) | |
| PRESCIENT | | ✅ (generates) | | ✅ (receives) | |
| ORACLE | | | | ✅ | |
| FIELD_COPILOT | | | ✅ | | |

---

*InfraLens Agent Architecture — 11 agents, 4 portals, 1 closed loop.*
