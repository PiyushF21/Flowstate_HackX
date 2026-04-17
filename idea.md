# InfraLens — Idea Document

> **AI-Powered Civic Infrastructure Intelligence Platform**
> Connecting Citizens, Municipal Corporations, Field Workers, and State Governments through autonomous AI agents for real-time infrastructure issue detection, assignment, resolution, and accountability.

---

## 1. Problem Statement

India's urban infrastructure maintenance is fundamentally broken:

| Stakeholder | Problem |
|---|---|
| **Citizens** | Potholes damage vehicles daily. Complaints filed via helplines or apps go unanswered for weeks. There is zero visibility into whether anyone is even working on the issue. |
| **Municipal Corporations (BMC/MC)** | Flooded with thousands of complaints. No intelligent triage — a burst water main gets the same priority as a faded road marking. Manual task assignment is slow and inefficient. No real-time worker tracking. |
| **Field Workers** | Receive vague task descriptions. No clear procedures, no map routing, no AI assistance on-site. Proof of completion is a paper trail that gets lost. |
| **State Government** | Has zero real-time visibility into MC performance. Learns about failures from newspapers. Fund allocation is political, not data-driven. No accountability enforcement. |

### Why Existing Solutions Fail

| Existing Approach | Gap |
|---|---|
| 311/helpline complaint systems | Reactive, no automatic detection. Complaints enter a black hole. |
| Municipal mobile apps (e.g., MyBMC) | Manual complaint only. No sensor-based detection. No AI triage. |
| GIS asset management tools | Static mapping, no live issue detection or worker assignment. |
| IoT smart city platforms | Collect data but have no action layer — no assignment, no worker portal, no accountability. |

**The core gap:** No system closes the full loop from **automatic detection → AI classification → intelligent assignment → guided resolution → verified completion → government accountability**.

InfraLens does.

---

## 2. Solution Overview

An **11-agent AI ecosystem** orchestrated by NEXUS that:

1. **Detects** infrastructure issues automatically via car sensor data (potholes), 360° captures (road hazards), and citizen complaints (water pipe bursts, garbage, electrical issues)
2. **Classifies** each issue by type, severity, and required expertise using dual-brain analysis (rule engine + LLM)
3. **Geo-tags** every issue with precise GPS coordinates from the originating vehicle or citizen device
4. **Routes** classified issues to the appropriate Municipal Corporation's BMC portal
5. **Auto-assigns** tasks to the most suitable field worker based on location proximity, expertise match, current workload, and urgency
6. **Generates** step-by-step resolution procedures tailored to the specific issue type
7. **Assists** workers on-site with voice/chat AI copilot for real-time problem-solving guidance
8. **Verifies** completion through photo/video proof uploaded by the worker, validated by fleet leaders
9. **Notifies** the reporting citizen when their complaint is resolved
10. **Reports** daily MC performance metrics (issues received vs. solved) to the State Government
11. **Recommends** fund and resource allocation at the state level with human-in-loop approval
12. **Escalates** delayed tasks by issuing urgent alerts that cascade from State → BMC → Worker

---

## 3. The Three Data Entry Points

### 3.1 Entry Point 1: Car Sensor Data (Automatic Pothole Detection)

**How it works:**

The citizen's vehicle is equipped with (or connected to) accelerometer and GPS data — either through a dedicated OBD-II device, a smartphone mounted on the dashboard, or the vehicle's built-in telematics system.

**Data captured:**
```json
{
  "source": "car_sensor",
  "vehicle_id": "MH-02-AB-1234",
  "timestamp": "2026-04-17T10:30:45+05:30",
  "gps": { "lat": 19.1196, "lng": 72.8467 },
  "speed_kmh": 35,
  "accelerometer": {
    "x": 0.12,
    "y": -2.8,
    "z": 0.05
  },
  "suspension_event": true,
  "road_segment": "Western Express Highway — KM 14.2",
  "city": "Mumbai",
  "ward": "K-West"
}
```

**Detection logic:**
- Accelerometer Y-axis spikes beyond threshold (e.g., > 2.0g downward jolt at speeds > 20 km/h) → pothole detected
- Multiple vehicles reporting jolts at the same GPS cluster (within 10m radius) → confirmed pothole with high confidence
- Severity calculated from jolt magnitude: Minor (< 2g), Moderate (2-4g), Severe (> 4g)
- Continuous background monitoring — no user action required

**What makes this powerful:**
- Zero friction — drivers don't do anything; their cars report automatically
- Cross-validation — when 5 cars detect the same anomaly at the same GPS point, it's confirmed
- Real-time — the pothole is reported within seconds of the first car hitting it

---

### 3.2 Entry Point 2: 360° Image Capture (Road Hazard Reporting)

**How it works:**

When a citizen spots a visible road hazard (fallen divider, debris on road, broken traffic signal, collapsed barrier, garbage accumulation, etc.), they tap a single button in the InfraLens app. The app triggers the phone's camera to capture a **360° panoramic image** (or a quick multi-angle burst) of the surroundings.

**Data captured:**
```json
{
  "source": "360_capture",
  "reporter_id": "CIT-USR-0042",
  "reporter_name": "Aarav Mehta",
  "timestamp": "2026-04-17T11:15:00+05:30",
  "gps": { "lat": 19.0760, "lng": 72.8777 },
  "images": [
    "captures/360_front_001.jpg",
    "captures/360_right_002.jpg",
    "captures/360_back_003.jpg",
    "captures/360_left_004.jpg"
  ],
  "auto_detected_category": "road_obstruction",
  "ai_confidence": 0.87,
  "road_segment": "SV Road — Near Bandra Station",
  "city": "Mumbai",
  "ward": "H-West"
}
```

**Processing pipeline:**
1. Images are uploaded to the backend
2. COGNOS Vision module analyzes images using LLM vision capabilities (Grok Vision by xAI)
3. AI classifies the issue: fallen divider, garbage pile, broken signal, etc.
4. Severity is assessed from visual analysis (e.g., complete road blockage = CRITICAL, partial obstruction = HIGH)
5. GPS coordinates are auto-attached from the phone's location
6. Issue is created and routed to the appropriate BMC portal

**One-tap design philosophy:**
- The citizen should NOT have to fill forms, select categories, or describe the issue
- Everything is inferred from the image + GPS
- Maximum friction: one button press, 3 seconds of holding the phone up

---

### 3.3 Entry Point 3: Manual Citizen Complaints

**How it works:**

For issues that cannot be detected by car sensors or images — like a water pipe burst underground, a gas leak smell, a non-functioning street light at night, a drainage overflow — the citizen files a manual complaint through the app.

**Data captured:**
```json
{
  "source": "manual_complaint",
  "reporter_id": "CIT-USR-0078",
  "reporter_name": "Sneha Desai",
  "timestamp": "2026-04-17T14:00:00+05:30",
  "gps": { "lat": 19.1334, "lng": 72.9133 },
  "category": "water_pipeline",
  "subcategory": "burst_pipe",
  "description": "Water pipe burst near Powai Lake Gate 2. Water flooding the footpath and part of the road.",
  "severity_self_assessed": "HIGH",
  "images": ["complaints/img_burst_pipe_001.jpg"],
  "address_text": "Near Powai Lake Gate 2, Hiranandani Gardens",
  "city": "Mumbai",
  "ward": "S-Ward"
}
```

**Categories available:**

| Category | Subcategories |
|---|---|
| 🚰 Water & Pipeline | Burst pipe, Low pressure, Contaminated water, Leaking valve |
| ⚡ Electrical | Street light out, Exposed wiring, Transformer issue, Traffic signal malfunction |
| 🗑️ Sanitation | Garbage accumulation, Drain blockage, Sewage overflow, Dead animal |
| 🛣️ Roads | Pothole (manual), Cave-in, Missing manhole cover, Broken footpath |
| 🌳 Environment | Fallen tree, Illegal dumping, Air quality concern, Noise pollution |
| 🏗️ Structural | Building crack, Retaining wall damage, Bridge concern, Flyover damage |
| 🚦 Traffic | Missing signage, Damaged barrier, Broken divider, Faded road markings |

**Voice option:**
- Citizens can also describe the issue via voice → VIRA transcribes and classifies automatically
- "There's a huge water pipe burst near Powai Lake gate 2, it's flooding the road" → VIRA extracts: category=water_pipeline, subcategory=burst_pipe, severity=HIGH, location=Powai Lake Gate 2

---

## 4. The Four Portals

### 4.1 Portal 1: Citizen App (Mobile)

**Primary users:** Residents, commuters, vehicle owners

**Purpose:** Data ingestion + complaint tracking + resolution notifications

**Key screens:**

| Screen | Features |
|---|---|
| **Home** | Infrastructure health score for their ward/area. Map showing nearby reported issues. Quick-action buttons: "Report Pothole" / "Capture Hazard" / "File Complaint" |
| **My Reports** | List of all issues the citizen has reported. Status tracking: Reported → Assigned → In Progress → Resolved. Resolution proof photos visible. |
| **Live Map** | Heat map of active issues in the city. Filterable by category (roads, water, electrical, etc.). Shows severity-coded pins. |
| **Notifications** | Push notifications when: their complaint is assigned, work begins, task is completed (with proof photo). |
| **VIRA Chat** | Voice/text AI assistant: "What's the status of my pothole complaint?", "I want to report a street light issue", "Is the water supply disruption in my area being fixed?" |

**Passive features (no user action):**
- Car sensor data runs in background when app is open and vehicle is moving
- Automatic pothole detection and reporting
- Contributes to crowd-sourced road quality data

---

### 4.2 Portal 2: BMC Field Operations Portal (Desktop + Tablet)

**Primary users:** Municipal Corporation operations managers, zone supervisors, fleet leaders

**Purpose:** Receive AI-analyzed issues, monitor auto-assignment, track worker progress, manage resources

**Key screens:**

| Screen | Features |
|---|---|
| **Dashboard** | KPI cards: Active issues (total / by severity), Issues resolved today, Worker utilization %, Average resolution time. Geographic heat map of active issues across all wards. Real-time feed of incoming issues. |
| **Issues Queue** | All reported issues in a prioritized table. Columns: Issue ID, Type, Severity, Location, Reported by (Sensor/Citizen/360°), Assigned to, Status, ETA. Filter by: ward, category, severity, status, date range. Issues auto-assigned by COMMANDER agent but supervisors can override. |
| **Workers** | Grid of all field workers. Status: Available / On Task / Off Duty. Current location on map. Active task + progress. Specializations. Performance metrics (tasks completed this week, avg resolution time). |
| **Zone Map** | Interactive ward-level map. Click a ward → see all active issues, assigned workers, completion rates. Overlay layers: Roads, Water, Electrical, Sanitation. |
| **Reports** | Daily summaries: issues received vs resolved by category. Worker performance leaderboard. Average response time by issue type. Exportable for state government reporting. |
| **Task Timeline** | Gantt-style view of all active tasks. Expected completion vs actual. Overdue tasks highlighted in red. |
| **Agent Activity Feed** | Real-time log of all AI agent actions (NEXUS dashboard pattern). Shows COGNOS classifications, COMMANDER assignments, GUARDIAN escalations. |

**Auto-assignment logic (COMMANDER agent):**
- When a new issue is classified by COGNOS, COMMANDER automatically assigns it:
  1. **Expertise match:** Water pipe burst → assign to a plumber/hydraulics crew, not an electrician
  2. **Location proximity:** Assign the nearest available worker/crew to minimize travel time
  3. **Current workload:** Don't pile up tasks on one worker; balance across available workers
  4. **Severity priority:** CRITICAL issues jump the queue — reassign workers from LOW tasks if needed
  5. **Shift timing:** Only assign to workers currently on shift
- Supervisors receive the assignment and can override if needed (human-in-loop at BMC level is optional, not mandatory)

---

### 4.3 Portal 3: State Government Portal (Desktop)

**Primary users:** State Infrastructure Secretary, Chief Engineer, District Collectors, Fund Controllers

**Purpose:** Macro-level oversight of all MCs in the state, fund & resource allocation, accountability enforcement

**Key screens:**

| Screen | Features |
|---|---|
| **State Dashboard** | Statewide overview: Total issues (today/week/month) across all MCs. Resolution rate by MC. Map of Maharashtra/State with MC-wise performance heatmap. Worst-performing MCs highlighted. |
| **MC Performance** | Table of all Municipal Corporations. Columns: MC Name, Issues Received (daily/weekly), Issues Resolved, Pending, Overdue, Avg Resolution Time, Resolution Rate %, Worker Count. Sortable. Drill-down into individual MC dashboards. |
| **Daily Reports** | Auto-generated daily report from each MC (generated by PRESCIENT agent): Issues received today by category. Issues resolved today. Overdue tasks. Resource utilization. Fund usage. Submitted automatically every evening. |
| **Weekly Digest** | AI-generated weekly summary (PRESCIENT + FLEET): Trends (is pothole count increasing? Is water pipeline failure rate growing?). MC performance comparison. Predictive warnings: "Monsoon approaching — expected 3x increase in drainage complaints in coastal MCs." Resource reallocation recommendations. |
| **Fund Allocation** | ORACLE agent recommends fund distribution based on: Issue volume per MC, Issue severity distribution, Historical resolution costs, Upcoming predicted demand. **Human-in-loop:** State official reviews AI recommendation and approves/modifies before funds are released. |
| **Resource Allocation** | ORACLE also recommends: Equipment deployment (JCBs, pump trucks, transformer units), Crew reallocation between MCs, Emergency stockpile positioning. Again with human-in-loop approval. |
| **Escalation Alerts** | GUARDIAN agent flags: Tasks exceeding deadline by >24 hours. MCs with resolution rate below 60%. Repeated complaints from the same location (indicates failed previous repair). Critical infrastructure failures (bridge structural concern, major pipeline burst). State official can issue urgent directive → cascades to BMC portal → COMMANDER reprioritizes. |
| **Accountability Board** | MC-wise accountability scorecard: Target vs actual resolution rates, Average response time vs SLA, Citizen satisfaction aggregated from LOOP feedback, Trend arrows (improving/declining). Color-coded: Green (target met), Yellow (near miss), Red (failing). |

**How the daily report works:**
- At 6:00 PM IST every day, PRESCIENT auto-generates a summary for each MC
- Report includes: New issues (count + severity breakdown), Resolved issues, Pending + overdue, Worker utilization, Fund usage vs budget
- Reports are pushed to the State Government portal automatically
- If an MC fails to resolve >50% of CRITICAL issues within 24 hours, GUARDIAN auto-flags it

**How escalation works:**
1. GUARDIAN monitors all task timelines across all MCs
2. If a HIGH/CRITICAL task exceeds its deadline → Alert generated
3. Alert appears on State Government portal with context
4. State official can click "Escalate" → This sends an urgent alert to the BMC portal
5. On the BMC portal, the escalated task is highlighted with a red banner
6. COMMANDER re-evaluates the assignment — may reassign more workers or escalate crew size
7. The worker(s) see the task flagged as "URGENT — State Escalated" on their portal

---

### 4.4 Portal 4: Worker Portal (Mobile)

**Primary users:** Field workers (plumbers, electricians, road repair crews, sanitation workers)

**Purpose:** Receive task assignments, follow guided procedures, get AI assistance, upload completion proof

**Key screens:**

| Screen | Features |
|---|---|
| **Dashboard** | Today's tasks on a map (pins show task locations with route). Quick stats: Tasks assigned today, Tasks completed, Tasks pending. Upcoming tasks with time estimates. Next task CTA button with navigation. |
| **Task List** | All assigned tasks in priority order. Each card shows: Task title, Severity badge (CRITICAL/HIGH/MEDIUM/LOW), Location address + distance from current position, Deadline, Category icon. |
| **Task Detail** (per task) | Full task information: **Description:** "Water pipe burst near Powai Lake Gate 2. Water flooding footpath and road." **Location:** Full address + map pin + "Navigate" button (opens Google Maps). **Severity:** HIGH. **Deadline:** April 17, 2026 — 6:00 PM. **Team:** Listed team members if it's a crew task. **Assigned by:** COMMANDER (auto) / Zone Supervisor (override). **Step-by-Step Procedure:** AI-generated procedure specific to the issue type (e.g., for burst pipe: 1. Locate isolation valve upstream, 2. Shut off water supply, 3. Excavate around burst point, 4. Assess pipe damage type, 5. Apply repair clamp or replace section, 6. Restore supply, 7. Test pressure, 8. Fill excavation). **Materials Required:** List of required materials/tools. **Upload Proof:** Camera button to take before/during/after photos. Upload to fleet leader for verification. **Contact Fleet Leader:** Direct call/message button. |
| **FIELD_COPILOT** | AI assistant panel (voice + text): "What type of repair clamp do I need for a 6-inch PVC pipe?" "The valve is seized — what should I try?" "How do I test pressure after a pipe repair?" Understands the current task context. Can also help with safety protocols and IS code references. |
| **Completed Tasks** | History of resolved tasks with proof photos and timestamps. Performance stats: Average resolution time, Tasks this week/month, Rating from fleet leader. |

**Task completion flow:**
1. Worker arrives at site → taps "Start Task"
2. GPS verified — confirms worker is at the correct location
3. Worker follows the step-by-step procedure
4. Can consult FIELD_COPILOT for any issues
5. After work is done → takes before/after photos → taps "Upload Proof"
6. Proof + completion status sent to fleet leader for verification
7. Fleet leader approves → task marked as "Resolved"
8. BMC portal updated in real-time
9. If the issue was a citizen complaint → citizen receives notification: "Your reported issue (water pipe burst near Powai Lake) has been resolved"
10. LOOP agent captures implicit feedback (resolution time vs deadline met) and explicit feedback (citizen satisfaction if they rate)

---

## 5. End-to-End Flow

```
+---------------------------------------------------------------------+
|                        DATA INGESTION LAYER                          |
|                                                                      |
|   Car Sensors          360 Capture          Manual Complaint          |
|   (auto pothole)       (hazard photo)       (citizen report)         |
|       |                      |                       |               |
|       +----------------------+-----------------------+               |
|                              |                                       |
|                        NEXUS Orchestrator                            |
|                              |                                       |
|                    +---------v----------+                            |
|                    |      COGNOS        |                            |
|                    |  Issue Detection   |                            |
|                    |  & Classification  |                            |
|                    +---------+----------+                            |
|                              |                                       |
|                    Issue + Severity + Location                       |
|                    + Category + Procedure                            |
+------------------------------+---------------------------------------+
                               |
                               v
+----------------------------------------------------------------------+
|                     BMC FIELD OPERATIONS PORTAL                       |
|                                                                       |
|   +----------+    +--------------+    +------------+                  |
|   | SENTINEL |    |  COMMANDER   |    |  Issue     |                  |
|   | (RBAC)   |    | (Auto-Assign)|    |  Queue     |                  |
|   +----------+    +------+-------+    +------------+                  |
|                          |                                            |
|              Worker + Procedure + Deadline                            |
+------------------------------+----------------------------------------+
                               |
                               v
+----------------------------------------------------------------------+
|                         WORKER PORTAL                                 |
|                                                                       |
|   +-----------+    +---------------+    +------------------+          |
|   | Task Map  |    | Task Details  |    |  FIELD_COPILOT   |          |
|   | Dashboard |    | + Procedures  |    |  (AI Assistant)  |          |
|   +-----------+    +-------+-------+    +------------------+          |
|                            |                                          |
|                    Task Completed + Proof                              |
+---------------------------------+-------------------------------------+
                                  |
                         +--------v--------+
                         |      LOOP       |
                         | (Verification)  |
                         +--------+--------+
                                  |
                   +--------------+--------------+
                   v              v              v
         BMC Portal Updated  Citizen Notified  State Report Updated
                                                       |
                                                       v
+----------------------------------------------------------------------+
|                    STATE GOVERNMENT PORTAL                             |
|                                                                       |
|   +----------+    +----------+    +----------+    +----------+        |
|   | PRESCIENT|    |  ORACLE  |    |  FLEET   |    | GUARDIAN  |       |
|   | (Reports)|    | (Funds)  |    |(Patterns)|    |(Escalate) |       |
|   +----------+    +----------+    +----------+    +----------+        |
|                                                                       |
|   Human-in-Loop Approval for Fund & Resource Allocation               |
|   Escalation Alerts -> Cascade back to BMC -> Worker                  |
+----------------------------------------------------------------------+
```

### Step-by-Step Flow Narrative:

1. **Detection:** A citizen's car hits a pothole on Western Express Highway. The phone's accelerometer registers a 3.2g vertical jolt. GPS coordinates are captured.

2. **Ingestion:** The data packet (jolt magnitude + GPS + timestamp + road speed) is sent to the InfraLens backend.

3. **Classification (COGNOS):** COGNOS analyzes the data:
   - Rule engine: Y-axis jolt of 3.2g at 45 km/h → Severity: HIGH
   - Cross-checks: 3 other cars reported jolts at the same GPS cluster in the last 2 hours → Confidence: CONFIRMED
   - LLM generates description: "Confirmed pothole on Western Express Highway near Andheri, KM 14.2. Severity HIGH based on multiple vehicle sensor reports."

4. **Routing (NEXUS):** NEXUS classifies severity as HIGH, routes to BMC Mumbai portal (K-West ward).

5. **Assignment (COMMANDER):** COMMANDER on the BMC portal:
   - Issue type: Road/Pothole → Needs road repair crew
   - Nearest available crew: Team Alpha (Ganesh Patil + 2 workers), currently 2.3 km away at Andheri East
   - Current workload: Team Alpha has 1 MEDIUM task left today
   - Decision: Assign to Team Alpha. Deadline: April 17, 6:00 PM (same day for HIGH severity)
   - Generates procedure: Assess pothole dimensions → Clean debris → Apply cold mix asphalt → Schedule permanent hot-mix repair within 7 days

6. **Worker (Ganesh):** Receives notification on Worker Portal:
   - "New HIGH priority task: Pothole repair on Western Expressway, KM 14.2"
   - Opens task → sees map, procedure, materials needed
   - Navigates to location → starts task
   - Consults FIELD_COPILOT: "The pothole is deeper than 6 inches, should I still use cold mix?" → Copilot: "For depth >6 inches, first fill with compacted gravel base to within 2 inches of surface, then apply cold mix. Flag for permanent repair within 72 hours."

7. **Completion:** Ganesh finishes the patch → takes before/after photos → uploads proof → marks complete.

8. **Verification (LOOP):** Fleet leader reviews proof photos → approves. Task marked RESOLVED.

9. **Citizen notification:** If any citizen manually reported this pothole, they receive: "The pothole you reported near Andheri has been repaired."

10. **Reporting (PRESCIENT):** At 6 PM, PRESCIENT includes this in the daily BMC Mumbai report to the State Government: "Ward K-West: 14 issues received, 12 resolved. Notable: HIGH severity pothole on Western Express repaired in 4.5 hours."

11. **State oversight:** If the pothole had NOT been fixed within 24 hours, GUARDIAN would flag it on the State portal. The state official could escalate → BMC receives urgent alert → COMMANDER reprioritizes.

---

## 6. Data Models

### 6.1 Issue Schema

```json
{
  "issue_id": "ISS-MUM-2026-04-17-0042",
  "source": "car_sensor | 360_capture | manual_complaint",
  "category": "roads",
  "subcategory": "pothole",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "confidence": 0.92,
  "status": "reported | assigned | in_progress | resolved | escalated | cancelled",
  "location": {
    "lat": 19.1196,
    "lng": 72.8467,
    "address": "Western Express Highway, KM 14.2, Near Andheri Metro",
    "city": "Mumbai",
    "ward": "K-West",
    "pincode": "400053"
  },
  "description": "Confirmed pothole — HIGH severity based on 3 vehicle sensor reports.",
  "ai_classification": {
    "agent": "COGNOS",
    "category_confidence": 0.95,
    "severity_confidence": 0.88,
    "cross_validation_count": 3
  },
  "reporter": {
    "reporter_id": "CIT-USR-0042 or SENSOR-AUTO",
    "reporter_name": "Auto-detected or citizen name",
    "contact": "+91-9876543210"
  },
  "images": ["path/to/image1.jpg"],
  "assigned_to": {
    "worker_id": "WRK-MUM-015",
    "worker_name": "Ganesh Patil",
    "team": ["WRK-MUM-015", "WRK-MUM-022", "WRK-MUM-031"],
    "assigned_at": "2026-04-17T10:45:00+05:30",
    "assigned_by": "COMMANDER"
  },
  "procedure": [
    "1. Assess pothole dimensions and depth",
    "2. Clean loose debris and standing water",
    "3. Apply tack coat to edges",
    "4. Fill with cold-mix asphalt",
    "5. Compact with tamper",
    "6. Upload before/after photos"
  ],
  "deadline": "2026-04-17T18:00:00+05:30",
  "materials_required": ["Cold-mix asphalt (50kg)", "Tamper/Compactor", "Broom", "Tack coat spray"],
  "completion": {
    "completed_at": "2026-04-17T15:30:00+05:30",
    "proof_images": ["proof/before_001.jpg", "proof/after_002.jpg"],
    "verified_by": "Fleet Leader — Suresh Naik",
    "verified_at": "2026-04-17T15:45:00+05:30"
  },
  "resolution_time_hours": 4.75,
  "sla_met": true,
  "citizen_notified": true,
  "created_at": "2026-04-17T10:30:45+05:30",
  "updated_at": "2026-04-17T15:45:00+05:30"
}
```

### 6.2 Worker Schema

```json
{
  "worker_id": "WRK-MUM-015",
  "name": "Ganesh Patil",
  "phone": "+91-9876500015",
  "role": "field_worker | fleet_leader | supervisor",
  "specializations": ["Roads", "Structural"],
  "certifications": ["Road Repair Level-2", "Heavy Equipment"],
  "zone": "K-West",
  "mc": "BMC Mumbai",
  "status": "available | on_task | off_duty",
  "current_task_id": "ISS-MUM-2026-04-17-0042",
  "shift": { "start": "07:00", "end": "19:00" },
  "current_location": { "lat": 19.1150, "lng": 72.8500 },
  "performance": {
    "tasks_completed_this_week": 12,
    "avg_resolution_time_hours": 3.8,
    "rating": 4.3,
    "on_time_completion_pct": 89
  }
}
```

### 6.3 Daily MC Report Schema

```json
{
  "report_id": "RPT-BMC-MUM-2026-04-17",
  "mc_name": "BMC Mumbai",
  "date": "2026-04-17",
  "generated_by": "PRESCIENT",
  "generated_at": "2026-04-17T18:00:00+05:30",
  "summary": {
    "issues_received": 156,
    "issues_resolved": 134,
    "issues_pending": 22,
    "issues_overdue": 4,
    "resolution_rate_pct": 85.9,
    "avg_resolution_time_hours": 5.2,
    "worker_utilization_pct": 78
  },
  "by_category": {
    "roads": { "received": 45, "resolved": 40, "overdue": 2 },
    "water": { "received": 32, "resolved": 28, "overdue": 1 },
    "electrical": { "received": 18, "resolved": 17, "overdue": 0 },
    "sanitation": { "received": 38, "resolved": 35, "overdue": 1 },
    "structural": { "received": 8, "resolved": 5, "overdue": 0 },
    "traffic": { "received": 10, "resolved": 7, "overdue": 0 },
    "environment": { "received": 5, "resolved": 2, "overdue": 0 }
  },
  "by_severity": {
    "CRITICAL": { "received": 8, "resolved": 7, "avg_time_hours": 2.1 },
    "HIGH": { "received": 42, "resolved": 38, "avg_time_hours": 4.5 },
    "MEDIUM": { "received": 68, "resolved": 62, "avg_time_hours": 6.8 },
    "LOW": { "received": 38, "resolved": 27, "avg_time_hours": 12.4 }
  },
  "worst_wards": [
    { "ward": "K-West", "pending": 8, "overdue": 2 },
    { "ward": "L-Ward", "pending": 5, "overdue": 1 }
  ],
  "escalated_tasks": 2,
  "fund_utilization_pct": 62
}
```

---

## 7. User Personas

### Persona 1: Aarav Mehta — Daily Commuter (Citizen)
- **Profile:** 32-year-old IT professional, drives 30 km daily from Powai to BKC on Western Express
- **Pain:** Hit the same pothole on WEH for 3 weeks straight. Filed a complaint on the BMC app — no response.
- **Win with InfraLens:** "My car's sensors auto-reported the pothole. By the time I drove back in the evening, it was patched. I didn't even have to file a complaint."

### Persona 2: Sneha Desai — Resident (Citizen)
- **Profile:** 28-year-old, lives in Powai. Non-car-owner, uses public transport.
- **Pain:** Water pipe burst outside her building for 2 days. Called the BMC helpline 4 times. No one came.
- **Win with InfraLens:** "I filed a complaint on the app with a photo. Got a notification in 3 hours that a team was assigned. Next morning, pipe was fixed. They even sent me photos of the repair."

### Persona 3: Rajesh Kadam — BMC Zone Supervisor
- **Profile:** 44-year-old, manages 35 field workers across K-West and K-East wards
- **Pain:** Spends 2 hours every morning manually assigning tasks, calling workers, checking who's available. By the time he finishes, 10 new complaints have come in.
- **Win with InfraLens:** "COMMANDER auto-assigns 90% of the tasks. I just review the dashboard, override if needed, and focus on the hard cases."

### Persona 4: Ganesh Patil — Field Worker
- **Profile:** 38-year-old, road repair specialist with 12 years experience
- **Pain:** Gets a paper slip saying "Pothole — Andheri." No map, no procedure, no way to report completion.
- **Win with InfraLens:** "I open my phone, see the exact pin on the map, follow the steps, and upload photos when done. The AI even helped me when I found a sinkhole instead of a pothole."

### Persona 5: Sunita Verma — State Infrastructure Secretary
- **Profile:** 56-year-old IAS officer, oversees 27 Municipal Corporations in Maharashtra
- **Pain:** Learns about BMC failures from newspaper headlines. Has no data to compare MC performance.
- **Win with InfraLens:** "I see every MC's daily resolution rate on my dashboard. When Nashik MC's water complaints spiked, I reallocated 2 Cr in maintenance funds before it became a crisis."

---

## 8. SLA (Service Level Agreement) Definitions

| Severity | Definition | SLA — Response Time | SLA — Resolution Time |
|---|---|---|---|
| **CRITICAL** | Immediate safety hazard. Examples: open manhole, major road cave-in, live electrical wire, gas leak, structural collapse risk | < 30 minutes | < 4 hours |
| **HIGH** | Significant disruption to public. Examples: large pothole on highway, water main burst, traffic signal failure at busy junction | < 1 hour | < 12 hours |
| **MEDIUM** | Notable inconvenience. Examples: street light out, drain blockage, moderate pothole on internal road | < 4 hours | < 48 hours |
| **LOW** | Minor issue. Examples: faded road marking, overflowing bin, minor crack in footpath | < 12 hours | < 7 days |

---

## 9. Accountability Enforcement

This is the core differentiator of InfraLens — **the system enforces accountability automatically.**

### How:

1. **Transparent SLAs:** Every issue has a severity-based deadline. Everyone — from the worker to the state secretary — can see it.

2. **Automatic escalation:** GUARDIAN monitors every deadline. No human needs to flag an overdue task — the system does it automatically, all the way up to the state level.

3. **Daily MC scorecards:** Every MC's performance is visible to the state government every day. Not quarterly reviews — daily.

4. **Citizen feedback loop:** Citizens are notified when their issue is resolved. If they rate the resolution poorly or re-report the issue, LOOP feeds this back — indicating failed repair.

5. **Re-report detection:** If a pothole at the same GPS location is reported again within 30 days of being "resolved," COGNOS flags it as a **failed repair**. This is tracked separately in MC performance metrics.

6. **Cross-MC comparison:** State government can compare: "Why does Pune MC resolve 90% of issues within SLA, but Nagpur MC only 55%?" This drives competition and accountability.

7. **Fund-linked performance:** ORACLE's fund allocation recommendations factor in MC performance. MCs that consistently underperform get flagged for audit, not rewarded with more funds.

---

## 10. Success Metrics

| KPI | Target |
|---|---|
| Auto-detection rate (sensor issues needing no citizen action) | >= 40% of all road issues |
| Issue classification accuracy (COGNOS) | >= 85% |
| Auto-assignment accuracy (COMMANDER — no supervisor override needed) | >= 80% |
| Average response time (assignment after detection) | < 45 minutes for CRITICAL |
| SLA compliance rate | >= 75% across all MCs |
| Citizen notification on resolution | 100% for manual complaints |
| Daily report delivery to state | 100% on-time |
| Worker on-site verification (GPS) | >= 95% |
| Re-report rate (same location within 30 days) | < 10% |
| State fund allocation processed within weekly cycle | >= 90% |

---

## 11. Tech Stack (Planned)

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, TailwindCSS v3, Framer Motion |
| **Backend** | Python 3.11+, FastAPI, Uvicorn, WebSockets |
| **AI Orchestration** | LangGraph (StateGraph), LangChain, Grok by xAI (grok-3) |
| **Voice** | Web Speech API (STT), Sarvam AI (TTS) |
| **Maps** | Leaflet.js or Mapbox GL (open-source) |
| **Auth** | Custom AuthContext with role-based routing |
| **Data** | JSON flat-file store, CSV seed data |

---

*InfraLens — Because infrastructure shouldn't wait for a headline.*
