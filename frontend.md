# InfraLens — Frontend Page Specification

> **5 Dashboards, 19 Pages** — Complete page-by-page specification for the InfraLens civic infrastructure platform.

---

## Dashboard Overview

| # | Dashboard | User | Layout | Pages |
|---|---|---|---|---|
| 1 | **Citizen Dashboard** | Residents, commuters, vehicle owners | Mobile-first (phone frame) | 4 pages |
| 2 | **BMC Dashboard** | Municipal Corporation operations team | Desktop (sidebar nav) | 4 pages |
| 3 | **State Government Dashboard** | State officials, fund controllers | Desktop (sidebar nav) | 4 pages |
| 4 | **Worker Dashboard** | Field workers, repair crews | Mobile-first (phone frame) | 4 pages |
| 5 | **NEXUS Agent Dashboard** | Admins, demo viewers, system operators | Desktop (full-screen immersive) | 3 pages |

---

## 🟦 Dashboard 1: Citizen Dashboard (Mobile)

**Layout:** Mobile phone frame with top status bar, bottom tab navigation (4 tabs: Area Map, My Cars, Report, Profile).

**Auth role:** `citizen`

---

### Page 1.1: Area Map (Home)

**Tab icon:** 🗺️ Map pin icon
**Route:** `/citizen/area-map`

**Purpose:** Show the citizen a live map of their locality with all reported infrastructure issues and their resolution progress.

**Layout (top to bottom):**

1. **Header bar:**
   - App logo (InfraLens) left-aligned
   - Notification bell icon (right) — shows count badge for updates on their complaints
   - User avatar (right) — links to profile

2. **Search & Filter strip:**
   - Search bar: "Search by area, ward, or issue..."
   - Filter pills (horizontally scrollable): All | Roads 🛣️ | Water 🚰 | Electrical ⚡ | Sanitation 🗑️ | Structural 🏗️
   - Active filter is highlighted with primary color

3. **Interactive Map (takes ~60% of screen):**
   - Full-width map of the citizen's locality (defaults to GPS location, ~2km radius)
   - Issue pins on the map color-coded by status:
     - 🔴 Red pin = Reported (not yet assigned)
     - 🟠 Orange pin = Assigned (worker assigned, not started)
     - 🟡 Yellow pin = In Progress (worker on-site)
     - 🟢 Green pin = Resolved
   - Tapping a pin opens a **mini card overlay** at the bottom:
     - Issue title (e.g., "Pothole — SV Road near Bandra Station")
     - Severity badge (CRITICAL / HIGH / MEDIUM / LOW)
     - Status pill with progress (Reported → Assigned → In Progress → Resolved)
     - Source icon (🚗 Sensor / 📸 360° Capture / ✍️ Manual)
     - "View Details" link → opens full issue detail modal
   - Cluster pins for dense areas (e.g., "12 issues" badge on a cluster)
   - Heat map toggle button — overlays a heat gradient showing issue density

4. **Issues list (below map, scrollable):**
   - Section header: "Issues Near You" with count
   - Cards showing most recent/nearby issues:
     - Each card: Category icon | Issue title | Distance ("0.3 km away") | Status pill | Time ago ("2 hours ago")
   - Sorted by proximity (nearest first)
   - Tapping a card highlights the pin on the map above and opens detail

5. **Floating Action Button (FAB) — bottom right:**
   - "+" icon → opens action menu:
     - "📸 Capture Hazard" (opens 360° camera)
     - "✍️ File Complaint" (opens complaint form on Page 1.3)

**Issue Detail Modal (opened by tapping "View Details"):**
- Full issue description
- Location address + mini-map
- Severity + category
- Status timeline: Reported → Assigned → In Progress → Resolved (with timestamps)
- If resolved: Before/after proof photos
- If the citizen reported this issue: Shows "Your complaint" badge
- Feedback prompt (if resolved): "Was this resolved satisfactorily?" → 1-5 star rating

---

### Page 1.2: My Cars

**Tab icon:** 🚗 Car icon
**Route:** `/citizen/my-cars`

**Purpose:** Show the citizen's registered vehicles and all 360° captures / sensor-detected issues from each car.

**Layout (top to bottom):**

1. **Header:** "My Cars" title

2. **Car selector (horizontal scroll of car cards):**
   - Each car card shows:
     - Car image/icon (generic car silhouette)
     - Registration number (e.g., "MH-02-AB-1234")
     - Model name (e.g., "Hyundai Creta")
     - Last trip date
     - Issues detected badge (e.g., "3 issues")
   - "➕ Add Car" card at the end — opens registration flow
   - Selected car is highlighted with a border/glow

3. **Selected car detail section (below car selector):**

   **Sub-tabs:** Sensor Detections | 360° Captures

   **Sub-tab A: Sensor Detections**
   - List of auto-detected issues from this car's sensor data
   - Each item:
     - "Pothole detected — WEH KM 14.2" with severity badge
     - Timestamp and GPS coordinates
     - Confidence indicator (✅ Confirmed by 4 vehicles / ⚠️ Single report — needs verification)
     - Status pill: Reported → Assigned → Resolved
     - Map pin showing location

   **Sub-tab B: 360° Captures**
   - Grid/list of all 360° image captures from this car
   - Each capture shows:
     - Thumbnail of the captured image
     - Timestamp + location
     - AI classification result:
       - ✅ **Identified:** "Fallen road divider — CRITICAL" → auto-reported
       - ❓ **Needs Your Help:** "AI could not confidently classify this image." → Tap to help
     - Status: Reported / Pending Review / Resolved

   **"Needs Your Help" flow (when AI confidence < 0.6):**
   - Tapping opens the full 360° image
   - Below the image: "What issue do you see?"
   - Category picker: Roads | Water | Electrical | Sanitation | Structural | Traffic | Other
   - Optional text description field
   - "Submit" button → citizen's input fused with AI analysis → issue is created
   - Thank you message: "Thanks! Your input helped classify this issue. It has been reported to BMC."

4. **Stats bar at bottom:**
   - Total trips tracked: 142
   - Issues auto-detected: 8
   - Issues resolved: 5

---

### Page 1.3: Report Complaint

**Tab icon:** ✍️ Pencil/Plus icon
**Route:** `/citizen/report`

**Purpose:** Allow citizens to manually report non-road issues (pipeline burst, garbage, electrical, etc.) by taking a photo and describing the problem.

**Layout (top to bottom):**

1. **Header:** "Report an Issue"

2. **Camera section (top half):**
   - Large camera preview taking top ~40% of screen
   - "📷 Take Photo" button (activates device camera)
   - After photo taken: shows captured image with "Retake" option
   - Also: "📁 Upload from Gallery" text link below camera button

3. **AI Auto-Detection banner (appears after photo captured):**
   - Loading state: "🔍 AI is analyzing your photo..."
   - Result state:
     - ✅ "AI detected: **Garbage accumulation** — Severity: MEDIUM" → pre-fills category below
     - ❓ "AI could not determine the issue. Please select a category below."
   - The citizen can override the AI's detection by changing the category

4. **Category selector (required):**
   - Grid of 7 category tiles (each with icon + label):
     - 🛣️ Roads | 🚰 Water | ⚡ Electrical | 🗑️ Sanitation | 🌳 Environment | 🏗️ Structural | 🚦 Traffic
   - Tapping selects (highlighted border) → reveals subcategory dropdown
   - Subcategory examples for Water: Burst pipe | Low pressure | Contaminated | Leaking valve

5. **Location section:**
   - Auto-detected GPS with address shown: "📍 Powai Lake Gate 2, Hiranandani Gardens"
   - "Edit location" link → opens map to adjust pin if GPS is off
   - Mini map showing the pin

6. **Description field (optional but encouraged):**
   - Placeholder: "Describe the issue in your own words..."
   - Can also tap 🎤 mic icon to dictate via voice → VIRA transcribes
   - Character count indicator

7. **Severity self-assessment (optional):**
   - "How urgent is this?"
   - Three options: 🟡 Not urgent | 🟠 Needs attention soon | 🔴 Emergency
   - Note: AI will override this if its analysis disagrees

8. **Submit button:**
   - "Report Issue" — full-width, primary color
   - On submit: loading state → success screen
   - Success screen: "✅ Issue Reported! Your complaint ID: ISS-MUM-2026-04-17-0078. You'll be notified when a team is assigned."
   - Buttons: "View on Map" | "Report Another"

---

### Page 1.4: My Profile

**Tab icon:** 👤 Person icon
**Route:** `/citizen/profile`

**Purpose:** User settings, complaint history, and notification preferences.

**Layout (top to bottom):**

1. **Profile header card:**
   - User avatar (large, circular)
   - Name: "Aarav Mehta"
   - Ward: "K-West, Mumbai"
   - Member since: "April 2026"

2. **Quick stats row (3 stat cards):**
   - Issues Reported: 12
   - Issues Resolved: 9
   - Cars Registered: 2

3. **My Complaints section:**
   - List of all complaints filed by this user (across all sources)
   - Each item: Issue title | Category icon | Date | Status pill
   - Filter tabs: All | Active | Resolved
   - Tapping opens the issue detail modal (same as Page 1.1)

4. **Settings section:**
   - 🔔 Notifications: Toggle on/off for complaint updates
   - 🚗 My Cars: Manage registered vehicles
   - 🌐 Language: English / Hindi / Marathi
   - 📧 Contact: Email, phone

5. **Logout button (bottom)**

---

## 🟧 Dashboard 2: BMC / Service Centre Dashboard (Desktop)

**Layout:** Desktop sidebar navigation (left) + main content area (right). Sidebar has 4 nav items with icons.

**Auth role:** `bmc_supervisor`

---

### Page 2.1: Issues Dashboard (Home)

**Sidebar icon:** 📊 Dashboard icon
**Route:** `/bmc/dashboard`

**Purpose:** Central command view of all reported infrastructure issues, prioritized by confidence score, with real-time assignment tracking.

**Layout:**

1. **Top KPI strip (4 cards, horizontally):**
   - 🔴 **Active Issues:** 47 (with +12 today badge)
   - ✅ **Resolved Today:** 34
   - 👷 **Workers On-Task:** 28 / 42
   - ⏱️ **Avg Resolution:** 4.8 hours

2. **Issue priority queue (main content, ~65% of width):**
   - Table/list of all reported issues, sorted by **Confidence Score** (descending)
   - Confidence Score formula shown as tooltip: `Confidence = (Report Count × 0.4) + (AI Severity Score × 0.6)`
   - Columns:
     - **Priority** — # rank
     - **Confidence Score** — e.g., 94, 87, 72 (color-coded: 80+ = red, 60-80 = orange, <60 = yellow)
     - **Issue** — title + category icon
     - **Location** — ward + address (truncated)
     - **Reports** — number of citizens/sensors that reported this (e.g., "🚗×4 📸×1" = 4 sensor + 1 manual)
     - **Severity** — CRITICAL / HIGH / MEDIUM / LOW badge
     - **Status** — Reported / Assigned / In Progress / Resolved
     - **Assigned To** — Worker name or "⏳ Pending" if not yet assigned
     - **Deadline** — date/time + "overdue" flag if past
   - Row click → opens **Issue Detail Panel** (slide-in from right)
   - Filter bar above table: By severity | By category | By status | By ward | Date range
   - Search box: "Search by issue ID, location, or worker..."

3. **Side panel — Issue Detail (opened on row click):**
   - Full issue information
   - Source breakdown: "4 car sensor reports + 1 citizen photo"
   - AI classification details with confidence percentages
   - Location map (mini)
   - Assignment section:
     - If unassigned: "COMMANDER auto-assigned to: Ganesh Patil (Roads & Asphalt) — 2.3 km away"
     - Override button: "Reassign" → opens worker selector modal
   - Procedure steps (AI-generated)
   - Timeline: all status transitions with timestamps
   - Proof photos (if completed)

4. **Real-time activity feed (right sidebar, ~35% width):**
   - Live stream of agent actions:
     - "🔍 COGNOS classified: Pothole — HIGH severity (Ward K-West)"
     - "⚙️ COMMANDER assigned WRK-015 to ISS-0042"
     - "🚨 GUARDIAN: ISS-0014 is 75 min overdue"
     - "✅ LOOP: ISS-0038 verified and resolved"
   - Each entry: Agent icon | Action text | Timestamp
   - Auto-scrolls, 200-event buffer

---

### Page 2.2: Workers Management

**Sidebar icon:** 👷 Worker icon
**Route:** `/bmc/workers`

**Purpose:** View and manage all field workers — their status, current assignments, location, and performance.

**Layout:**

1. **Worker summary strip (top):**
   - Total Workers: 42
   - Available: 14 (🟢)
   - On Task: 28 (🟡)
   - Off Duty: 8 (⚫)

2. **Worker map view (top half, ~50% height):**
   - Map showing real-time GPS locations of all workers
   - Color-coded pins: Green = available, Yellow = on-task, Grey = off-duty
   - Tapping a worker pin → shows tooltip: Name, current task (if any), specialization
   - Issue pins layered underneath (dimmed) for spatial context

3. **Worker table (bottom half):**
   - Columns:
     - **Name** — with avatar
     - **Specialization** — Roads, Water, Electrical, etc.
     - **Status** — Available / On Task / Off Duty (color badge)
     - **Current Task** — Issue ID + title, or "—"
     - **Zone** — Assigned ward
     - **Tasks Today** — completed / assigned (e.g., "3/5")
     - **Avg Resolution Time** — "3.8 hrs"
     - **Rating** — ⭐ 4.3/5
   - Row click → opens worker detail sidebar with:
     - Full profile
     - Active tasks list
     - Performance chart (tasks/week over last 4 weeks)
     - Certifications
   - Sort by any column
   - Filter by: status, specialization, zone

---

### Page 2.3: Completed Work

**Sidebar icon:** ✅ Checkmark icon
**Route:** `/bmc/completed`

**Purpose:** Archive of all resolved issues with proof verification, resolution times, and citizen feedback.

**Layout:**

1. **Summary strip (top):**
   - Resolved This Week: 187
   - Avg Resolution Time: 5.2 hrs
   - SLA Compliance: 82%
   - Citizen Satisfaction: ⭐ 4.1/5

2. **Completed issues table:**
   - Columns:
     - **Issue ID** — clickable
     - **Issue Title** — with category icon
     - **Location** — ward + address
     - **Severity** — original severity badge
     - **Worker** — name + team size
     - **Reported At** — date/time
     - **Resolved At** — date/time
     - **Resolution Time** — "4.5 hrs" (🟢 if within SLA, 🔴 if exceeded)
     - **Proof** — thumbnail of before/after photos (click to enlarge)
     - **Verified By** — Fleet leader name
     - **Citizen Rating** — ⭐ or "N/A" (if sensor-detected, no citizen to rate)
   - Filter by: date range, category, worker, SLA status (met/missed)
   - Export button: "📄 Export to PDF" / "📊 Export to CSV"

3. **Issue detail (on row click):**
   - Full resolution story: detection → classification → assignment → procedure → completion
   - Before/after photo comparison (side by side)
   - COGNOS classification details
   - COMMANDER assignment rationale
   - Worker's procedure steps (checked off)
   - Time breakdown: Detection-to-Assignment, Assignment-to-Arrival, Work Duration

---

### Page 2.4: Reports & Analytics

**Sidebar icon:** 📈 Chart icon
**Route:** `/bmc/reports`

**Purpose:** Weekly report generation for state government + internal analytics.

**Layout:**

1. **Report generation section (top card):**
   - "Generate Weekly Report" button — triggers PRESCIENT agent
   - Date range selector (defaults to current week: Monday–Sunday)
   - Report preview area (once generated):
     - Shows AI-generated narrative summary
     - Key metrics table: Issues Received, Resolved, Pending, Overdue, Resolution Rate %, Worker Utilization %
     - Charts: Issues by category (bar), Resolution trend (line over 7 days), Severity distribution (donut)
   - Actions: "📄 Download PDF" | "📧 Send to State Government" | "🔄 Regenerate"

2. **Analytics section (below):**
   - **Issues Trend Chart:** Line chart — daily issue volume over last 30 days, with category breakdown
   - **Category Distribution:** Donut/pie chart — Roads: 32%, Water: 18%, Sanitation: 22%, etc.
   - **Ward Performance Heatmap:** Color-coded ward grid showing resolution rates
   - **Worker Leaderboard:** Top 5 workers by tasks completed + avg resolution time
   - **SLA Compliance Trend:** Line chart — % of tasks completed within SLA over last 4 weeks

3. **Past Reports archive:**
   - List of previously generated weekly reports with date range and download links

---

## 🟩 Dashboard 3: State Government Dashboard (Desktop)

**Layout:** Desktop sidebar navigation (left) + main content area (right). Uses a more formal, data-dense design with charts and tables.

**Auth role:** `state_official`

---

### Page 3.1: State Overview (Home)

**Sidebar icon:** 🏛️ Government building icon
**Route:** `/state/overview`

**Purpose:** Bird's-eye view of all Municipal Corporations' performance across the state.

**Layout:**

1. **Top KPI strip (5 cards):**
   - 🏢 **Total MCs:** 27
   - 📋 **Issues This Week:** 4,280
   - ✅ **Resolution Rate:** 78.4%
   - ⏱️ **Avg Resolution Time:** 6.1 hrs
   - 🚨 **Overdue Tasks:** 34

2. **State Map (main, ~50% height):**
   - Map of the state (Maharashtra) with MC boundaries
   - Each MC region color-coded by performance:
     - 🟢 Green: Resolution rate ≥ 80%
     - 🟡 Yellow: 60% – 79%
     - 🔴 Red: < 60%
   - Hovering over an MC shows tooltip: MC name, issues this week, resolution rate %, avg time
   - Clicking an MC drills down to its detailed dashboard (same data BMC sees, but read-only)

3. **MC Performance Table (below map):**
   - Columns:
     - **MC Name** — e.g., "BMC Mumbai"
     - **Issues Received** — this week
     - **Issues Resolved** — this week
     - **Pending** — count
     - **Overdue** — count (🔴 if >5)
     - **Resolution Rate %** — with color bar
     - **Avg Resolution Time** — hours
     - **Worker Count** — total workers
     - **Worker Utilization %** — on-task vs total
     - **SLA Compliance %** — within-deadline rate
     - **Trend Arrow** — ↑ improving / ↓ declining / → stable
   - Sortable by any column
   - Click row → drill down to MC detail page
   - Worst performers highlighted with red left-border

4. **Escalation alerts panel (right sidebar or bottom section):**
   - Active GUARDIAN alerts:
     - "🚨 PMC Pune: Water main burst on FC Road — 75 min overdue"
     - "⚠️ NMC Nagpur: Resolution rate dropped to 48% today"
   - Each alert: Severity badge | MC name | Description | "Escalate" button
   - Clicking "Escalate" → confirms action → sends urgent alert to BMC

---

### Page 3.2: Weekly Reports

**Sidebar icon:** 📑 Document icon
**Route:** `/state/reports`

**Purpose:** View weekly reports submitted by each MC. PRESCIENT auto-generates these, state officials review and act on them.

**Layout:**

1. **Report inbox (left panel, ~35% width):**
   - List of all weekly reports received, grouped by date
   - Each item: MC name | Week period | Date received | Status badge (New / Reviewed)
   - "New" reports have an unread dot indicator
   - Filter: By MC, By date, Unread only

2. **Report viewer (right panel, ~65% width):**
   - Selected report displayed in a read-friendly format:
     - **Header:** MC Name, Report Period, Generated At
     - **Executive Summary:** AI-generated narrative (2-3 paragraphs) covering performance highlights, concerns, and recommendations
     - **Metrics Table:** Issues received/resolved/pending/overdue by category and severity
     - **Charts (embedded):**
       - Daily issue volume (bar chart, 7 bars)
       - Category distribution (donut)
       - Resolution time trend (line)
     - **Worst Wards:** Top 3 underperforming wards with data
     - **Escalated Tasks:** List of issues that triggered GUARDIAN alerts
     - **Fund Utilization:** Budget spent vs allocated with % bar
   - Actions at bottom: "✅ Mark Reviewed" | "📄 Download PDF" | "💬 Send Feedback to MC"

---

### Page 3.3: Fund & Resource Allocation

**Sidebar icon:** 💰 Money/coins icon
**Route:** `/state/allocation`

**Purpose:** AI-recommended fund and resource allocation with human-in-loop approval. This is where ORACLE's recommendations are presented.

**Layout:**

1. **ORACLE Recommendation Panel (main):**
   - Header: "ORACLE Fund Allocation Recommendation — Q1 FY2026-27"
   - Status badge: "⏳ Awaiting Approval" / "✅ Approved" / "✏️ Modified & Approved"
   - Total state budget card: "₹450 Cr" with breakdown bar

2. **MC allocation table:**
   - Columns:
     - **MC Name**
     - **Recommended Allocation (₹ Cr)** — ORACLE's AI recommendation
     - **Current Allocation (₹ Cr)** — existing
     - **Adjusted Allocation (₹ Cr)** — editable field (state official can modify)
     - **Rationale** — AI-generated one-liner (expandable)
     - **Performance Flag** — 🟢 On track / 🟡 Watch / 🔴 Audit recommended
   - Total row at bottom summing all allocations (must equal total budget)
   - Validation: warns if adjusted total ≠ budget total

3. **Resource recommendations section (below table):**
   - Equipment recommendations from ORACLE:
     - "Deploy 2 additional JCBs to PMC Pune — road repair backlog growing 15% WoW"
     - "Transfer 8 workers from NMC Nashik (40% utilization) to BMC Mumbai (92% utilization)"
   - Each recommendation: Description | Priority | "✅ Approve" | "❌ Reject" | "✏️ Modify" buttons

4. **Approval action bar (sticky bottom):**
   - "✅ Approve All Recommendations" — big primary button
   - "✏️ Submit Modified Allocation" — secondary button
   - "📄 Export Allocation Report" — tertiary

---

### Page 3.4: Accountability Board

**Sidebar icon:** 🏆 Trophy/Shield icon
**Route:** `/state/accountability`

**Purpose:** MC performance scorecards with accountability metrics. Shows whether each MC is meeting targets.

**Layout:**

1. **Accountability scorecard grid:**
   - Grid of MC cards (4-5 per row, like a report card)
   - Each MC card shows:
     - MC Name (bold)
     - Overall Grade: A / B / C / D / F (color-coded: A=green, F=red)
     - Resolution Rate: 86% (vs 75% target) → 🟢
     - Avg Response Time: 3.1 hrs (vs 4 hr SLA) → 🟢
     - Overdue Rate: 4% (vs <10% target) → 🟢
     - Citizen Satisfaction: ⭐ 4.2/5
     - Re-report Rate: 7% (vs <10% target) → 🟢
     - Trend: ↑ Improving / ↓ Declining
   - Clicking card → opens full MC performance detail page

2. **League table (below grid):**
   - All MCs ranked 1 to N by overall performance composite score
   - Visual leaderboard with position bars
   - Top 3 MCs highlighted with gold/silver/bronze

3. **Trend analysis section:**
   - Statewide trend charts:
     - Resolution rate trend (line chart, all MCs overlaid, last 12 weeks)
     - Issue volume trend (stacked area, by MC)
   - Anomaly highlights: "Nagpur MC's resolution rate has declined for 4 consecutive weeks"

---

## 🟪 Dashboard 4: Worker Dashboard (Mobile)

**Layout:** Mobile phone frame with bottom tab navigation (4 tabs: Dashboard, Tasks, AI Assistant, Profile). Designed for low-friction use — workers on-site need fast access.

**Auth role:** `field_worker`

---

### Page 4.1: Worker Dashboard (Home)

**Tab icon:** 🏠 Home icon
**Route:** `/worker/dashboard`

**Purpose:** Quick overview of today's workload with a map showing task locations.

**Layout (top to bottom):**

1. **Greeting header:**
   - "Good morning, Ganesh 👷" (time-aware greeting)
   - Today's date
   - Shift: 7:00 AM – 7:00 PM

2. **Quick stats row (3 cards):**
   - 📋 Assigned Today: 5
   - ✅ Completed: 2
   - ⏳ Pending: 3

3. **Task map (~50% of screen):**
   - Map centered on worker's current GPS location (blue dot with accuracy ring)
   - Task location pins (numbered 1-5 in priority order):
     - 🔴 Overdue/CRITICAL
     - 🟠 HIGH
     - 🟡 MEDIUM
     - 🟢 LOW / completed (faded)
   - Route line showing suggested travel path (next task highlighted)
   - Tapping a pin → shows task preview card with "Navigate" button (opens Google Maps)

4. **Next task card (prominent, below map):**
   - Large card highlighting the next priority task:
     - "🔴 HIGH — Pothole Repair"
     - "Western Express Highway, KM 14.2"
     - "📍 2.3 km away | ⏱️ Deadline: 6:00 PM"
   - Two buttons:
     - "📍 Navigate" (opens directions)
     - "▶️ Start Task" (transitions to task detail on Page 4.2)

5. **Recent completions (small list below):**
   - Last 2-3 completed tasks with timestamps and status

---

### Page 4.2: My Tasks

**Tab icon:** 📋 Clipboard icon
**Route:** `/worker/tasks`

**Purpose:** Full list of assigned tasks + detailed task view with procedures, team info, and proof upload.

**Layout:**

**View A: Task List (default view)**

1. **Filter tabs:** All | Active | Completed
2. **Task cards (scrollable list):**
   - Each card shows:
     - Severity badge (colored left border: red/orange/yellow/green)
     - Task title: "Pothole Repair — WEH KM 14.2"
     - Category icon + category name
     - Location: truncated address
     - Distance: "2.3 km away"
     - Deadline: "Today, 6:00 PM" (🔴 red if overdue)
     - Status: "Assigned" / "In Progress" / "Completed"
     - If escalated: "⚠️ URGENT — State Escalated" red banner across top

**View B: Task Detail (opened by tapping a task card)**

Full-screen detail view with back arrow:

1. **Task header:**
   - Severity banner across top (color-coded full width)
   - Issue title (large)
   - Issue ID: ISS-MUM-2026-04-17-0042
   - Category: 🛣️ Roads — Pothole

2. **Location section:**
   - Address: "Western Express Highway, KM 14.2, Near Andheri Metro"
   - Mini map with pin
   - "📍 Navigate" button (opens Google/Apple Maps)

3. **Assignment info:**
   - Assigned by: COMMANDER (auto)
   - Assigned at: 10:35 AM
   - Deadline: 6:00 PM today
   - SLA: 12 hours (HIGH severity)
   - If escalated: "⚠️ This task has been escalated by State Government"

4. **Team section:**
   - "Your Team for this Task:"
   - List: Ganesh Patil (Fleet Leader) | Ravi Shinde | Manoj Yadav
   - Phone icons for quick call/message

5. **Procedure section (most important):**
   - Header: "📋 How to Complete This Task"
   - Step-by-step accordion:
     - Step 1: "Assess pothole dimensions (length, width, depth)" — checkbox
     - Step 2: "Clear loose debris and standing water" — checkbox
     - Step 3: "Cut edges to create clean vertical walls (if >30cm)" — checkbox
     - Step 4: "Apply tack coat to edges and base" — checkbox
     - Step 5: "Fill with cold-mix asphalt in 5cm layers" — checkbox
     - Step 6: "Compact each layer with vibrating plate compactor" — checkbox
     - Step 7: "Final surface should be flush with surrounding road" — checkbox
     - Step 8: "Upload before/after photos as proof" — checkbox
     - Step 9: "Flag for permanent hot-mix overlay within 7 days if depth >15cm" — checkbox
   - Workers can check off steps as they complete them (progress saved)

6. **Materials required section:**
   - Bulleted list: Cold-mix asphalt (50kg × 2) | Tack coat spray | Vibrating plate compactor | Safety cones (4) | High-vis vest
   - Checklist style — worker can check off what they have

7. **Action buttons (sticky bottom):**
   - If not started: "▶️ Start Task" (records start time + GPS)
   - If in progress: "📸 Upload Proof" → opens camera
   - After proof uploaded: "✅ Mark as Complete" → submits to fleet leader

8. **Proof upload section (appears after tapping "Upload Proof"):**
   - Camera opens for before/after photos
   - Grid showing uploaded photos (min 2: before + after)
   - Optional notes field: "Any additional comments?"
   - "Submit for Verification" button → proof sent to fleet leader

---

### Page 4.3: AI Assistant (FIELD_COPILOT)

**Tab icon:** 🤖 Robot/AI icon
**Route:** `/worker/assistant`

**Purpose:** Voice and text AI assistant that helps workers solve on-site problems. Supports Hindi and English.

**Layout:**

1. **Header:**
   - "AI Assistant" title
   - Language toggle: 🇬🇧 EN / 🇮🇳 HI (switches FIELD_COPILOT language)
   - Current task context badge: "Working on: ISS-0042 — Pothole Repair" (auto-detected from active task)

2. **Chat area (takes ~75% of screen):**
   - Chat bubble interface (like WhatsApp):
     - Worker messages: right-aligned, colored bubbles
     - AI responses: left-aligned, white/dark bubbles with 🤖 icon
   - AI messages can include:
     - Text responses with formatted steps
     - Inline images (if worker uploaded a photo for analysis)
     - Material specifications in bold
     - Safety warnings highlighted with ⚠️ icon
   - Typing indicator: "FIELD_COPILOT is typing..."

3. **Input section (bottom):**
   - Text input field: "Ask anything about your current task..."
   - 🎤 **Voice button (large, prominent):** Hold-to-talk
     - When held: pulsing animation, "Listening..." text
     - On release: "Processing..." → AI response appears + audio plays
     - Voice works in Hindi or English based on language toggle
   - 📸 **Camera button:** Take photo and send to AI for analysis
     - Use case: "I found something weird underground — what is this?"
     - AI analyzes photo and responds with identification + guidance
   - 📎 Attach button (for images from gallery)

4. **Quick action buttons (above input, horizontally scrollable):**
   - Pre-built prompts for common questions:
     - "What's the next step?"
     - "I'm stuck, help me"
     - "Safety protocol?"
     - "What materials do I need?"
     - "Report a problem to fleet leader"
   - Tapping a quick action sends it directly

5. **Voice response playback:**
   - After AI responds, audio auto-plays (TTS via Sarvam AI)
   - Audio waveform visualization during playback
   - Replay button on each AI message

---

### Page 4.4: Worker Profile

**Tab icon:** 👤 Person icon
**Route:** `/worker/profile`

**Purpose:** Worker's personal stats, completed task history, and account settings.

**Layout (top to bottom):**

1. **Profile header:**
   - Avatar (large, circular)
   - Name: "Ganesh Patil"
   - Role: Fleet Leader
   - Specialization badge: 🛣️ Roads & Asphalt
   - Zone: K-West, Mumbai
   - MC: BMC Mumbai
   - Shift: 7:00 AM – 7:00 PM

2. **Performance stats (4 cards):**
   - ✅ Tasks This Week: 12
   - ⏱️ Avg Resolution: 3.8 hrs
   - ⭐ Rating: 4.3/5
   - 📊 On-Time: 89%

3. **Completed tasks list:**
   - Chronological list of past tasks
   - Each item: Issue title | Category icon | Date | Resolution time | Rating received
   - Tap to see full detail + proof photos

4. **Certifications:**
   - List of worker's certifications: "Road Repair Level-2" | "Heavy Equipment" | etc.

5. **Settings:**
   - 🌐 Language: English / Hindi
   - 🔔 Notifications: On/Off
   - 📞 Emergency contact
   - Logout button

---

## 🟣 Dashboard 5: NEXUS Master Agent Dashboard (Desktop — Immersive)

**Layout:** Full-screen immersive dark canvas. No traditional sidebar — uses a minimal top nav bar with 3 tab-style links. The centerpiece is the agent constellation visualization. Designed for demo presentations, system monitoring, and admin oversight.

**Auth role:** `nexus_admin`

**Design language:** Deep space dark theme (`#08080D` background). Glassmorphic agent cards. Neon-glow connection lines. Cinematic feel — this is the "wow" dashboard.

---

### Page 5.1: Agent Constellation (Home)

**Nav tab:** 🧠 Constellation
**Route:** `/nexus/constellation`

**Purpose:** Real-time visualization of all 11 agents arranged in a constellation pattern around the central NEXUS brain. Shows live agent communication, data flow, and system health — updating in real-time as actions happen across all other dashboards.

**Layout:**

1. **Top bar (minimal, semi-transparent):**
   - InfraLens logo (left)
   - 3 nav tabs: Constellation | Event Stream | Pipeline View
   - System health indicator (right): 🟢 "All Agents Online" or 🟡 "2 Agents Degraded"
   - Live clock + uptime counter

2. **Agent Constellation (full canvas, ~85% of viewport):**

   **Central node — NEXUS:**
   - Large circular node in the exact center of the screen
   - Animated 3D brain icon (rotating slowly) inside a glowing purple ring
   - Label below: "NEXUS — Master Orchestrator"
   - Pulsing ring animation (breathing effect) indicating NEXUS is active
   - Particle effects radiating outward when NEXUS routes an issue

   **Satellite agent nodes (arranged in a circle/orbit around NEXUS):**
   - 11 agent cards positioned in an orbital constellation around NEXUS:
     - Each agent is a glassmorphic square card (~80×80px) with:
       - Unique icon (emoji or custom SVG) matching the agent's role
       - Agent name (bold, e.g., "COGNOS")
       - Agent subtitle (e.g., "Detection Engine")
       - Colored border matching agent's theme color:
         - COGNOS: Cyan `#06B6D4`
         - VIRA: Pink `#EC4899`
         - COMMANDER: Green `#10B981`
         - FLEET: Blue `#3B82F6`
         - SENTINEL: Red `#EF4444`
         - LOOP: Emerald `#059669`
         - GUARDIAN: Amber `#F59E0B`
         - PRESCIENT: Purple `#8B5CF6`
         - ORACLE: Gold `#D97706`
         - FIELD_COPILOT: Teal `#14B8A6`
       - Status indicator dot: 🟢 Active / 🟡 Busy / 🔴 Error
       - Last action timestamp (e.g., "2s ago")

   **Connection lines (NEXUS ↔ each agent):**
   - Glowing neon lines connecting NEXUS to each satellite agent
   - Lines are normally dim/subtle (thin, low opacity)
   - When an agent is actively communicating with NEXUS:
     - The connection line **lights up bright** with the agent's theme color
     - An animated **data packet dot** travels along the line (from agent → NEXUS or NEXUS → agent, depending on direction)
     - A brief **label** appears on the line showing what data is flowing: "ISS-0042 classified → HIGH"
   - Multiple lines can be active simultaneously (showing parallel agent work)

   **Real-time animation triggers:**
   - When a citizen reports a complaint → VIRA's line lights up → data packet travels to NEXUS → NEXUS pulses → COGNOS line lights up → data flows to COGNOS
   - When COGNOS classifies an issue → COGNOS → NEXUS → COMMANDER line lights up
   - When COMMANDER assigns a worker → COMMANDER line glows → NEXUS broadcasts
   - When GUARDIAN detects overdue → GUARDIAN line flashes red urgently
   - When LOOP verifies completion → LOOP line glows green → NEXUS pulses with success
   - When PRESCIENT generates a report → PRESCIENT line pulses purple

3. **Agent detail panel (slide-in from right, opened by clicking any agent node):**
   - Agent name + icon (large)
   - Status: 🟢 Active
   - Powered by: "Grok by xAI (grok-3)"
   - Portal served: "BMC Dashboard"
   - **Live stats:**
     - Actions today: 142
     - Avg response time: 1.2s
     - Last action: "Classified ISS-0042 as HIGH — 3s ago"
   - **Recent actions log (last 20):**
     - Timestamped list of everything this agent has done:
       - "10:31:00 — Classified pothole (ISS-0042) → HIGH severity"
       - "10:28:15 — Analyzed 360° image (ISS-0039) → CRITICAL"
       - "10:25:30 — Validated citizen complaint (ISS-0037) → MEDIUM"
   - **Sample output:** Shows the last JSON output from this agent (collapsible code block)
   - Close button (X) to return to constellation view

4. **Live ticker strip (bottom of screen, horizontal scrolling):**
   - Continuously scrolling latest agent actions across the system:
   - "🔍 COGNOS: Pothole classified HIGH (K-West) · ⚙️ COMMANDER: WRK-015 assigned · 🚨 GUARDIAN: ISS-0014 overdue 75min · ✅ LOOP: ISS-0038 resolved · 🎙️ VIRA: Complaint received (Powai)"
   - Color-coded by agent theme color
   - Acts as a constant heartbeat showing the system is alive

---

### Page 5.2: Event Stream

**Nav tab:** 📡 Event Stream
**Route:** `/nexus/events`

**Purpose:** Chronological real-time feed of every agent action across the entire system. Like a system-wide activity log but visually rich.

**Layout:**

1. **Filter bar (top):**
   - Agent filter: All | COGNOS | VIRA | COMMANDER | FLEET | SENTINEL | LOOP | GUARDIAN | PRESCIENT | ORACLE | FIELD_COPILOT (multi-select, each with agent color)
   - Severity filter: All | CRITICAL | HIGH | MEDIUM | LOW
   - Portal filter: All | Citizen | BMC | State | Worker
   - Time range: Last 1 hour | Last 6 hours | Today | Custom
   - Search: "Search by issue ID, agent, or keyword..."
   - "⏸️ Pause" / "▶️ Resume" toggle — pauses auto-scroll for reading

2. **Event feed (main, full width, auto-scrolling):**
   - Each event is a card/row:
     - **Agent badge** (colored icon + name): 🔍 COGNOS
     - **Action text:** "Classified sensor data from VIN MH-02-AB-1234 — Pothole detected, Severity: HIGH"
     - **Issue ID link:** ISS-MUM-2026-04-17-0042 (clickable → opens issue context)
     - **Portal tag:** "BMC Portal" (shows which dashboard this action affects)
     - **Timestamp:** "10:31:00 AM" with relative time "(3s ago)"
     - **Data payload** (expandable): Click to see raw JSON input/output of this agent action
   - New events slide in from top with a subtle animation
   - Events color-coded by agent on the left border
   - CRITICAL/GUARDIAN events have a red pulse highlight

3. **Stats sidebar (right, ~25% width):**
   - **Agent activity heatmap:** 11 rows (one per agent), columns = last 24 hours in 1-hour blocks, color intensity = number of actions
   - **Events per minute:** Live counter with sparkline
   - **Most active agent:** "COGNOS — 142 actions today"
   - **Busiest portal:** "BMC — 67% of all actions"

---

### Page 5.3: Pipeline Visualizer

**Nav tab:** 🔀 Pipeline
**Route:** `/nexus/pipeline`

**Purpose:** Shows the LangGraph pipeline for a specific issue — how it traveled through the agent chain from detection to resolution. Select any issue and watch its journey replayed.

**Layout:**

1. **Issue selector (top):**
   - Dropdown: "Select an issue to view its pipeline"
   - Shows recent issues: ISS-0042 (Pothole — HIGH — Resolved) | ISS-0039 (Divider — CRITICAL — In Progress) | ...
   - Or search by issue ID

2. **Pipeline diagram (main, ~70% of viewport):**
   - Horizontal left-to-right flow diagram showing the agent chain for the selected issue:
   ```
   [Data Source] → [NEXUS] → [COGNOS] → [SENTINEL] → [COMMANDER] → [LOOP] → [RESOLVED]
       📡            🧠          🔍          🛡️           ⚙️           ♻️          ✅
   car_sensor    classify    detect &    verify       auto-assign   verify
                 source     classify    permissions   WRK-015      completion
   ```
   - Each node is a glassmorphic card showing:
     - Agent icon + name
     - Action performed
     - Input data (collapsed)
     - Output data (collapsed)
     - Duration: "1.2s"
     - Status: ✅ Complete / 🔄 In Progress / ⏳ Pending
   - Connection arrows between nodes with data labels
   - Completed nodes glow green, current node pulses, pending nodes are dimmed
   - For live in-progress issues: animation shows the pipeline advancing in real-time

3. **Timeline strip (below pipeline):**
   - Horizontal timeline bar showing timestamps for each step
   - Total pipeline duration: "Detection → Resolution: 4h 32m"
   - Each step marked with timestamp + duration

4. **Issue context panel (right sidebar, ~30%):**
   - Full issue details: title, location, severity, category
   - Reporter info
   - Assigned worker
   - Current status
   - Proof photos (if resolved)
   - COGNOS classification JSON
   - COMMANDER assignment rationale

---

## File / Route Structure Summary

```
src/
├── pages/
│   ├── LoginPage.tsx           # Role selection → routes to correct dashboard
│   ├── citizen/
│   │   ├── AreaMapPage.tsx     # Page 1.1
│   │   ├── MyCarsPage.tsx      # Page 1.2
│   │   ├── ReportPage.tsx      # Page 1.3
│   │   └── ProfilePage.tsx     # Page 1.4
│   ├── bmc/
│   │   ├── IssuesDashboard.tsx # Page 2.1
│   │   ├── WorkersPage.tsx     # Page 2.2
│   │   ├── CompletedPage.tsx   # Page 2.3
│   │   └── ReportsPage.tsx     # Page 2.4
│   ├── state/
│   │   ├── OverviewPage.tsx    # Page 3.1
│   │   ├── WeeklyReports.tsx   # Page 3.2
│   │   ├── AllocationPage.tsx  # Page 3.3
│   │   └── AccountabilityPage.tsx # Page 3.4
│   ├── worker/
│   │   ├── DashboardPage.tsx   # Page 4.1
│   │   ├── TasksPage.tsx       # Page 4.2
│   │   ├── AssistantPage.tsx   # Page 4.3
│   │   └── ProfilePage.tsx     # Page 4.4
│   └── nexus/
│       ├── ConstellationPage.tsx # Page 5.1
│       ├── EventStreamPage.tsx   # Page 5.2
│       └── PipelinePage.tsx      # Page 5.3
├── components/
│   ├── citizen/               # Citizen-specific components
│   ├── bmc/                   # BMC-specific components
│   ├── state/                 # State-specific components
│   ├── worker/                # Worker-specific components
│   ├── nexus/                 # Agent constellation, event stream, pipeline viz
│   └── shared/                # Shared: maps, charts, modals, badges, etc.
└── context/
    └── AuthContext.tsx         # Role-based auth + routing
```

---

## Design System Notes

| Token | Value | Usage |
|---|---|---|
| **Primary** | `#2563EB` (Blue 600) | Primary action buttons, active states, links |
| **Background** | `#0A0A0F` | App background (dark mode) |
| **Surface** | `#13131A` | Card/panel surfaces |
| **Surface Elevated** | `#1C1C27` | Modals, dropdowns, hover states |
| **Critical** | `#EF4444` (Red) | CRITICAL severity, overdue, errors |
| **High** | `#F97316` (Orange) | HIGH severity, warnings |
| **Medium** | `#EAB308` (Yellow) | MEDIUM severity, caution |
| **Low** | `#22C55E` (Green) | LOW severity, resolved, success |
| **Text Primary** | `#F1F5F9` | Main text |
| **Text Secondary** | `#94A3B8` | Secondary/muted text |
| **Glass panels** | `backdrop-filter: blur(12px)` | Card containers, modals |
| **NEXUS glow** | `#A855F7` (Purple 500) | NEXUS ring, pipeline active glow |
| **Agent connection lines** | Each agent's theme color at 40% opacity, 100% when active | Constellation connection lines |
| **Font - Headings** | Inter or Space Grotesk | Bold, modern |
| **Font - Body** | Inter | Clean, readable |
| **Animations** | Framer Motion | Page transitions, micro-interactions |

---

*InfraLens Frontend Specification — 5 Dashboards, 19 Pages*
