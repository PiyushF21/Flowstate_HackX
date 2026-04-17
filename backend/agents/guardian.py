"""
GUARDIAN — Deadline Monitor & Escalation Engine
=================================================
Agent #8 in the InfraLens ecosystem.

Purpose: Continuously monitors task deadlines, triggers escalation alerts,
and cascades urgent notifications from State → BMC → Worker.

Responsibilities:
- Monitor all active task deadlines against SLAs
- Auto-escalate CRITICAL issues past SLA
- Allow manual escalation by state officials
- Detect repeated failures at same GPS locations
- Check MC performance thresholds
- Check for idle workers
- Generate structured alert objects
- Broadcast alerts via WebSocket

Powered By: Python Rules + WebSocket Broadcasting
Portal: State → BMC → Worker (cascade)

Phase 1 Draft: Pure Python logic — no external imports.
All functions take str/dict params and return dict.
Real model imports (from models import ...) will be added in Phase 2 after Stavan pushes models.py.
"""

import datetime
import math

# =============================================================================
# CONSTANTS
# =============================================================================

# SLA thresholds — how many minutes past the deadline before escalation triggers
OVERDUE_THRESHOLDS = {
    "CRITICAL": 30,    # 30 minutes past SLA → immediate escalation
    "HIGH": 240,       # 4 hours past SLA
    "MEDIUM": 480,     # 8 hours past SLA
    "LOW": 1440,       # 24 hours (1 day) past SLA
}

# SLA resolution time limits (from task-piyush.md / idea.md)
SLA_RESOLUTION_HOURS = {
    "CRITICAL": 4,     # Must be resolved within 4 hours
    "HIGH": 12,        # Must be resolved within 12 hours
    "MEDIUM": 48,      # Must be resolved within 48 hours
    "LOW": 168,        # Must be resolved within 7 days
}

# MC performance threshold — MCs below this are flagged
MC_PERFORMANCE_THRESHOLD = 60.0  # percent resolution rate

# Re-report detection constants
REREPORT_RADIUS_M = 10       # GPS proximity for same-location matching
REREPORT_WINDOW_DAYS = 30    # Days to look back for resolved issues
REREPORT_MIN_COUNT = 3       # Minimum re-reports to flag as failed repair

# Worker idle detection
WORKER_IDLE_MINUTES = 120    # 2 hours without GPS movement = idle alert

# Alert types
ALERT_TYPES = {
    "task_deadline_breach": {
        "title": "Task Deadline Breach",
        "icon": "⏰",
        "priority_boost": True,
    },
    "mc_performance_drop": {
        "title": "MC Performance Below Threshold",
        "icon": "📉",
        "priority_boost": False,
    },
    "repeated_failure": {
        "title": "Repeated Repair Failure",
        "icon": "🔄",
        "priority_boost": True,
    },
    "worker_idle": {
        "title": "Worker Idle Alert",
        "icon": "🚨",
        "priority_boost": False,
    },
    "critical_sla_breach": {
        "title": "CRITICAL Issue SLA Breach",
        "icon": "🔴",
        "priority_boost": True,
    },
    "state_escalation": {
        "title": "State-Level Escalation",
        "icon": "🏛️",
        "priority_boost": True,
    },
}

# Escalation levels
ESCALATION_CASCADE = [
    "worker",          # Level 1: Worker directly
    "fleet_leader",    # Level 2: Fleet leader
    "bmc_supervisor",  # Level 3: BMC supervisor
    "state_official",  # Level 4: State government
]


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the great-circle distance between two GPS points in meters.
    Uses the Haversine formula.
    """
    R = 6371000  # Earth's radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    a = (math.sin(delta_phi / 2) ** 2 +
         math.cos(phi1) * math.cos(phi2) *
         math.sin(delta_lambda / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def parse_iso_datetime(dt_str: str) -> datetime.datetime:
    """Parse an ISO format datetime string to a datetime object."""
    # Handle various ISO formats
    try:
        # Try standard ISO with timezone
        if "+" in dt_str and "T" in dt_str:
            # Remove colon in timezone offset for Python < 3.11 compatibility
            if dt_str[-3] == ":":
                dt_str = dt_str[:-3] + dt_str[-2:]
        return datetime.datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        # Fallback: use current time
        return datetime.datetime.now(datetime.timezone.utc)


def minutes_since(dt_str: str) -> float:
    """Calculate minutes elapsed since the given ISO datetime string."""
    then = parse_iso_datetime(dt_str)
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30)))  # IST
    diff = now - then
    return diff.total_seconds() / 60


def calculate_overdue_minutes(deadline_str: str) -> float:
    """
    Calculate how many minutes an issue is overdue.
    Returns negative if not yet past deadline.
    """
    if not deadline_str:
        return 0
    
    deadline = parse_iso_datetime(deadline_str)
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30)))  # IST
    diff = now - deadline
    return diff.total_seconds() / 60


# =============================================================================
# CORE MONITORING FUNCTIONS
# =============================================================================

def check_overdue_tasks(issues: list) -> list:
    """
    Scan all active issues and identify tasks that are past their deadline.
    
    Args:
        issues: List of issue dicts with at least: issue_id, status, severity, deadline
        
    Returns:
        List of overdue task dicts with overdue_minutes and escalation_level
    """
    overdue_tasks = []
    
    for issue in issues:
        status = issue.get("status", "")
        
        # Only check assigned or in_progress tasks
        if status not in ("assigned", "in_progress"):
            continue
        
        deadline = issue.get("deadline")
        if not deadline:
            continue
        
        overdue_minutes = calculate_overdue_minutes(deadline)
        
        if overdue_minutes <= 0:
            continue  # Not yet past deadline
        
        severity = issue.get("severity", "MEDIUM")
        threshold = OVERDUE_THRESHOLDS.get(severity, 480)
        
        # Determine escalation level based on how far past threshold
        if overdue_minutes > threshold * 3:
            escalation_level = "state_official"
        elif overdue_minutes > threshold * 2:
            escalation_level = "bmc_supervisor"
        elif overdue_minutes > threshold:
            escalation_level = "fleet_leader"
        else:
            escalation_level = "worker"
        
        overdue_tasks.append({
            "issue_id": issue.get("issue_id", ""),
            "severity": severity,
            "status": status,
            "deadline": deadline,
            "overdue_minutes": round(overdue_minutes, 1),
            "overdue_hours": round(overdue_minutes / 60, 1),
            "threshold_minutes": threshold,
            "escalation_level": escalation_level,
            "needs_escalation": overdue_minutes > threshold,
            "location": issue.get("location", {}),
            "category": issue.get("category", ""),
            "assigned_to": issue.get("assigned_to", {}),
            "mc": issue.get("location", {}).get("city", "Unknown"),
        })
    
    # Sort by severity (CRITICAL first) then overdue_minutes (most overdue first)
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    overdue_tasks.sort(
        key=lambda x: (severity_order.get(x["severity"], 4), -x["overdue_minutes"])
    )
    
    return overdue_tasks


def check_mc_performance(issues: list, mcs: list = None) -> list:
    """
    Calculate each MC's daily resolution rate and flag underperformers.
    
    Args:
        issues: List of all issue dicts
        mcs: Optional list of MC dicts for enrichment
        
    Returns:
        List of flagged MCs with performance data
    """
    # Group issues by MC (city)
    mc_stats: dict = {}
    
    for issue in issues:
        city = "Unknown"
        if isinstance(issue.get("location"), dict):
            city = issue["location"].get("city", "Unknown")
        
        if city not in mc_stats:
            mc_stats[city] = {
                "total": 0,
                "resolved": 0,
                "overdue": 0,
                "critical_overdue": 0,
            }
        
        mc_stats[city]["total"] += 1
        
        if issue.get("status") == "resolved":
            mc_stats[city]["resolved"] += 1
        
        # Check if overdue
        deadline = issue.get("deadline")
        if deadline and issue.get("status") in ("assigned", "in_progress"):
            overdue_min = calculate_overdue_minutes(deadline)
            if overdue_min > 0:
                mc_stats[city]["overdue"] += 1
                if issue.get("severity") == "CRITICAL":
                    mc_stats[city]["critical_overdue"] += 1
    
    # Flag underperformers
    flagged_mcs = []
    for mc_name, stats in mc_stats.items():
        total = stats["total"]
        if total == 0:
            continue
        
        resolution_rate = (stats["resolved"] / total) * 100
        
        if resolution_rate < MC_PERFORMANCE_THRESHOLD:
            flagged_mcs.append({
                "mc_name": mc_name,
                "total_issues": total,
                "resolved": stats["resolved"],
                "resolution_rate_pct": round(resolution_rate, 1),
                "threshold_pct": MC_PERFORMANCE_THRESHOLD,
                "overdue_count": stats["overdue"],
                "critical_overdue": stats["critical_overdue"],
                "gap_pct": round(MC_PERFORMANCE_THRESHOLD - resolution_rate, 1),
                "alert_type": "mc_performance_drop",
            })
    
    # Sort by resolution rate (worst first)
    flagged_mcs.sort(key=lambda x: x["resolution_rate_pct"])
    
    return flagged_mcs


def check_repeated_failures(
    issues: list,
    target_gps: dict = None,
    radius_m: float = REREPORT_RADIUS_M,
    days: int = REREPORT_WINDOW_DAYS,
) -> list:
    """
    Find locations with 3+ resolved-then-re-reported issues.
    These indicate failed repairs or deeper structural problems.
    
    Args:
        issues: List of all issue dicts
        target_gps: Optional specific GPS to check (dict with lat, lng)
        radius_m: Radius in meters for same-location matching
        days: Number of days to look back
        
    Returns:
        List of failure clusters with location and report details
    """
    # Filter for recently resolved issues
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30)))
    cutoff = now - datetime.timedelta(days=days)
    
    resolved_issues = []
    active_issues = []
    
    for issue in issues:
        # Get GPS coordinates
        location = issue.get("location", {})
        if isinstance(location, dict):
            lat = location.get("lat")
            lng = location.get("lng")
        else:
            continue
        
        if lat is None or lng is None:
            continue
        
        if issue.get("status") == "resolved":
            resolved_issues.append(issue)
        elif issue.get("status") in ("reported", "assigned", "in_progress"):
            active_issues.append(issue)
    
    # Find clusters — locations where resolved issues have been re-reported
    failure_clusters = []
    checked_locations = set()
    
    for resolved in resolved_issues:
        r_loc = resolved.get("location", {})
        r_lat = r_loc.get("lat")
        r_lng = r_loc.get("lng")
        
        if r_lat is None or r_lng is None:
            continue
        
        # Avoid duplicate cluster detection
        location_key = f"{round(r_lat, 4)},{round(r_lng, 4)}"
        if location_key in checked_locations:
            continue
        checked_locations.add(location_key)
        
        # If target_gps specified, only check that location
        if target_gps:
            dist = haversine_distance(r_lat, r_lng, target_gps["lat"], target_gps["lng"])
            if dist > radius_m:
                continue
        
        # Count reports at this location
        reports_at_location = []
        for issue in issues:
            i_loc = issue.get("location", {})
            i_lat = i_loc.get("lat")
            i_lng = i_loc.get("lng")
            if i_lat is None or i_lng is None:
                continue
            
            dist = haversine_distance(r_lat, r_lng, i_lat, i_lng)
            if dist <= radius_m:
                reports_at_location.append(issue)
        
        # Check if we have enough re-reports
        resolved_count = sum(1 for i in reports_at_location if i.get("status") == "resolved")
        active_count = sum(1 for i in reports_at_location if i.get("status") in ("reported", "assigned", "in_progress"))
        
        if resolved_count >= 1 and active_count >= 1 and len(reports_at_location) >= REREPORT_MIN_COUNT:
            failure_clusters.append({
                "location": {
                    "lat": r_lat,
                    "lng": r_lng,
                    "address": r_loc.get("address", "Unknown"),
                    "ward": r_loc.get("ward", ""),
                    "city": r_loc.get("city", ""),
                },
                "total_reports": len(reports_at_location),
                "resolved_count": resolved_count,
                "active_count": active_count,
                "issue_ids": [i.get("issue_id", "") for i in reports_at_location],
                "categories": list(set(i.get("category", "") for i in reports_at_location)),
                "alert_type": "repeated_failure",
                "recommendation": (
                    f"Location has {len(reports_at_location)} reports with {resolved_count} "
                    f"resolved and {active_count} still active. Indicates failed previous repair. "
                    f"Recommend comprehensive assessment rather than surface-level fix."
                ),
            })
    
    return failure_clusters


def check_worker_idle(worker: dict, idle_threshold_minutes: int = WORKER_IDLE_MINUTES) -> dict:
    """
    Check if a worker marked as 'on_task' hasn't shown GPS movement for too long.
    Indicates potential issues (worker stuck, GPS malfunction, unauthorized break).
    
    Args:
        worker: Worker dict with at least: worker_id, status, current_location, last_location_update
        idle_threshold_minutes: Minutes without movement to trigger alert
        
    Returns:
        Alert dict if idle, None otherwise
    """
    if worker.get("status") != "on_task":
        return None
    
    last_update = worker.get("last_location_update")
    if not last_update:
        return None
    
    idle_minutes = minutes_since(last_update)
    
    if idle_minutes > idle_threshold_minutes:
        return {
            "worker_id": worker.get("worker_id", ""),
            "worker_name": worker.get("name", "Unknown"),
            "status": "on_task",
            "idle_minutes": round(idle_minutes, 1),
            "last_location": worker.get("current_location", {}),
            "current_task_id": worker.get("current_task_id", ""),
            "alert_type": "worker_idle",
            "recommendation": (
                f"Worker {worker.get('name', 'Unknown')} has been stationary for "
                f"{round(idle_minutes)} minutes while marked as on-task. "
                f"Verify worker status and task progress."
            ),
        }
    
    return None


# =============================================================================
# ESCALATION FUNCTIONS
# =============================================================================

def auto_escalate_critical(issues: list) -> list:
    """
    Auto-flag CRITICAL issues that have exceeded their SLA.
    These get immediate attention — broadcast to both State + BMC channels.
    
    Args:
        issues: List of all issue dicts
        
    Returns:
        List of auto-escalated issue alerts
    """
    escalated = []
    
    for issue in issues:
        if issue.get("severity") != "CRITICAL":
            continue
        
        if issue.get("status") not in ("assigned", "in_progress"):
            continue
        
        deadline = issue.get("deadline")
        if not deadline:
            continue
        
        overdue_minutes = calculate_overdue_minutes(deadline)
        
        if overdue_minutes > OVERDUE_THRESHOLDS["CRITICAL"]:
            alert = generate_alert(issue, "critical_sla_breach")
            alert["auto_escalated"] = True
            alert["overdue_minutes"] = round(overdue_minutes, 1)
            alert["action_required"] = (
                "CRITICAL issue has breached SLA. Auto-escalated to BMC and State portals. "
                "COMMANDER should reassign or add more resources immediately."
            )
            escalated.append(alert)
    
    return escalated


def escalate(issue: dict, escalated_by: str, reason: str = "") -> dict:
    """
    Manual escalation — typically triggered by a state official.
    Updates issue status and creates urgent cascade alert.
    
    Args:
        issue: The issue dict to escalate
        escalated_by: User ID of the person escalating (e.g., "STATE-OFF-001")
        reason: Optional reason for escalation
        
    Returns:
        Escalation result dict with updated status and alert
    """
    issue_id = issue.get("issue_id", "")
    severity = issue.get("severity", "MEDIUM")
    current_status = issue.get("status", "")
    
    # Build escalation record
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30)))
    
    escalation_record = {
        "issue_id": issue_id,
        "previous_status": current_status,
        "new_status": "escalated",
        "escalated_by": escalated_by,
        "escalated_at": now.isoformat(),
        "reason": reason or f"Manual escalation by {escalated_by}",
        "severity": severity,
    }
    
    # Generate cascade alerts
    alert = generate_alert(issue, "state_escalation")
    alert["escalation"] = escalation_record
    alert["cascade"] = {
        "state_portal": {
            "action": "Escalation logged",
            "notification": f"Issue {issue_id} has been escalated by {escalated_by}",
        },
        "bmc_portal": {
            "action": "URGENT — State Escalated",
            "notification": (
                f"⚠️ State has escalated issue {issue_id} ({severity}). "
                f"Immediate attention required. Reason: {reason or 'Priority override'}"
            ),
            "banner": "red",
        },
        "worker_portal": {
            "action": "URGENT — State Escalated",
            "notification": (
                f"🚨 Your task {issue_id} has been flagged as urgent by state officials. "
                f"Please prioritize this task immediately."
            ),
            "banner": "red",
        },
    }
    
    # In Phase 2: will call data_store.update_issue() and ws_manager.broadcast()
    
    return {
        "agent": "GUARDIAN",
        "action": "escalated",
        "issue_id": issue_id,
        "escalation": escalation_record,
        "alert": alert,
        "broadcast_channels": ["escalations", "issues", "tasks", "notifications"],
        "timestamp": now.isoformat(),
    }


# =============================================================================
# ALERT GENERATION
# =============================================================================

def generate_alert(issue: dict, alert_type: str) -> dict:
    """
    Create a structured alert object for any type of monitoring trigger.
    
    Args:
        issue: The issue dict that triggered the alert
        alert_type: One of ALERT_TYPES keys
        
    Returns:
        Structured alert dict ready for WebSocket broadcast
    """
    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30)))
    
    alert_config = ALERT_TYPES.get(alert_type, {
        "title": alert_type.replace("_", " ").title(),
        "icon": "⚠️",
        "priority_boost": False,
    })
    
    issue_id = issue.get("issue_id", "")
    severity = issue.get("severity", "MEDIUM")
    category = issue.get("category", "general")
    location = issue.get("location", {})
    
    # Build human-readable description
    location_str = ""
    if isinstance(location, dict):
        addr = location.get("address", "")
        ward = location.get("ward", "")
        city = location.get("city", "")
        location_str = f"{addr}, {ward}, {city}".strip(", ")
    
    description = ""
    if alert_type == "task_deadline_breach":
        description = (
            f"{severity} severity {category} issue at {location_str} "
            f"has breached its deadline."
        )
    elif alert_type == "critical_sla_breach":
        description = (
            f"🔴 CRITICAL issue {issue_id} at {location_str} has breached SLA. "
            f"Immediate action required."
        )
    elif alert_type == "state_escalation":
        description = (
            f"🏛️ State official has escalated issue {issue_id} ({severity}) "
            f"at {location_str}."
        )
    elif alert_type == "repeated_failure":
        description = (
            f"🔄 Location {location_str} has multiple resolved-then-re-reported issues. "
            f"Previous repairs may have failed."
        )
    elif alert_type == "mc_performance_drop":
        mc_name = issue.get("mc_name", "Unknown MC")
        rate = issue.get("resolution_rate_pct", 0)
        description = (
            f"📉 {mc_name} resolution rate dropped to {rate}%, "
            f"below the {MC_PERFORMANCE_THRESHOLD}% threshold."
        )
    elif alert_type == "worker_idle":
        description = (
            f"🚨 Worker {issue.get('worker_name', 'Unknown')} has been idle for "
            f"{issue.get('idle_minutes', 0)} minutes while on task."
        )
    else:
        description = f"Alert for issue {issue_id}: {alert_type}"
    
    return {
        "agent": "GUARDIAN",
        "alert_id": f"ALR-{now.strftime('%Y%m%d%H%M%S')}-{issue_id[-4:] if len(issue_id) >= 4 else '0000'}",
        "alert_type": alert_type,
        "title": alert_config["title"],
        "icon": alert_config["icon"],
        "description": description,
        "issue_id": issue_id,
        "severity": severity,
        "category": category,
        "location": location,
        "priority_boost": alert_config["priority_boost"],
        "requires_action": alert_type in ("critical_sla_breach", "state_escalation", "repeated_failure"),
        "timestamp": now.isoformat(),
    }


# =============================================================================
# MONITORING CYCLE (Background task — will be periodic in Phase 2)
# =============================================================================

# In-memory alert storage (will use data_store in Phase 2)
active_alerts: list = []


def run_monitoring_cycle(issues: list, workers: list = None, mcs: list = None) -> dict:
    """
    Run all monitoring checks in a single cycle.
    This will be called periodically (every 5 minutes) as a background task in Phase 2.
    
    Args:
        issues: List of all issue dicts
        workers: Optional list of worker dicts
        mcs: Optional list of MC dicts
        
    Returns:
        Summary of all findings
    """
    findings = {
        "agent": "GUARDIAN",
        "cycle_timestamp": datetime.datetime.now(
            datetime.timezone(datetime.timedelta(hours=5, minutes=30))
        ).isoformat(),
        "overdue_tasks": [],
        "critical_escalations": [],
        "mc_performance_flags": [],
        "repeated_failures": [],
        "idle_workers": [],
        "total_alerts": 0,
    }
    
    # 1. Check overdue tasks
    overdue = check_overdue_tasks(issues)
    findings["overdue_tasks"] = overdue
    
    # 2. Auto-escalate CRITICAL issues past SLA
    critical_escalations = auto_escalate_critical(issues)
    findings["critical_escalations"] = critical_escalations
    
    # 3. Check MC performance
    mc_flags = check_mc_performance(issues, mcs)
    findings["mc_performance_flags"] = mc_flags
    
    # 4. Check for repeated failures
    repeated = check_repeated_failures(issues)
    findings["repeated_failures"] = repeated
    
    # 5. Check for idle workers
    if workers:
        for worker in workers:
            idle_alert = check_worker_idle(worker)
            if idle_alert:
                findings["idle_workers"].append(idle_alert)
    
    # Tally total alerts
    findings["total_alerts"] = (
        len(findings["overdue_tasks"]) +
        len(findings["critical_escalations"]) +
        len(findings["mc_performance_flags"]) +
        len(findings["repeated_failures"]) +
        len(findings["idle_workers"])
    )
    
    # Generate alerts for each finding
    all_alerts = []
    
    for task in overdue:
        if task.get("needs_escalation"):
            alert = generate_alert(task, "task_deadline_breach")
            alert["overdue_minutes"] = task["overdue_minutes"]
            alert["escalation_level"] = task["escalation_level"]
            all_alerts.append(alert)
    
    for esc in critical_escalations:
        all_alerts.append(esc)
    
    for mc_flag in mc_flags:
        alert = generate_alert(mc_flag, "mc_performance_drop")
        all_alerts.append(alert)
    
    for failure in repeated:
        alert = generate_alert(failure, "repeated_failure")
        all_alerts.append(alert)
    
    for idle in findings["idle_workers"]:
        alert = generate_alert(idle, "worker_idle")
        all_alerts.append(alert)
    
    # Store alerts (in Phase 2: broadcast via ws_manager)
    active_alerts.extend(all_alerts)
    findings["generated_alerts"] = all_alerts
    
    # Summary message
    findings["summary"] = (
        f"Monitoring cycle complete. Found: "
        f"{len(overdue)} overdue tasks, "
        f"{len(critical_escalations)} critical escalations, "
        f"{len(mc_flags)} underperforming MCs, "
        f"{len(repeated)} repeated failures, "
        f"{len(findings['idle_workers'])} idle workers."
    )
    
    return findings


def get_active_alerts() -> list:
    """Return all active alerts. In Phase 2, will filter by resolved status."""
    return active_alerts


def clear_alert(alert_id: str) -> bool:
    """Clear/acknowledge an alert by ID. Returns True if found and removed."""
    global active_alerts
    original_count = len(active_alerts)
    active_alerts = [a for a in active_alerts if a.get("alert_id") != alert_id]
    return len(active_alerts) < original_count
