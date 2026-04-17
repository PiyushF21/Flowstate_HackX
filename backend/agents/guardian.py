"""
GUARDIAN — Deadline Monitor & Escalation Engine
=================================================
Agent #8 in the InfraLens ecosystem.

Purpose: Monitors task deadlines, triggers escalation alerts,
cascades urgent notifications State → BMC → Worker.

Powered By: Python Rules + WebSocket Broadcasting
Portal: State → BMC → Worker (cascade)

Phase 2: Connected to models.py + data_store.py with real types.
"""

import sys
import os
import math
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import Issue, AgentEvent, AuditEntry
from data_store import data_store
from config import settings

# =============================================================================
# CONSTANTS
# =============================================================================

IST = timezone(timedelta(hours=5, minutes=30))

OVERDUE_THRESHOLDS = {
    "CRITICAL": 30,    # 30 minutes past SLA
    "HIGH": 240,       # 4 hours
    "MEDIUM": 480,     # 8 hours
    "LOW": 1440,       # 24 hours
}

SLA_RESOLUTION_HOURS = {
    "CRITICAL": 4, "HIGH": 12, "MEDIUM": 48, "LOW": 168,
}

MC_PERFORMANCE_THRESHOLD = 60.0
REREPORT_RADIUS_M = 10
REREPORT_WINDOW_DAYS = 30
REREPORT_MIN_COUNT = 3
WORKER_IDLE_MINUTES = 120

ALERT_TYPES = {
    "task_deadline_breach": {"title": "Task Deadline Breach", "icon": "⏰", "priority_boost": True},
    "mc_performance_drop": {"title": "MC Performance Below Threshold", "icon": "📉", "priority_boost": False},
    "repeated_failure": {"title": "Repeated Repair Failure", "icon": "🔄", "priority_boost": True},
    "worker_idle": {"title": "Worker Idle Alert", "icon": "🚨", "priority_boost": False},
    "critical_sla_breach": {"title": "CRITICAL Issue SLA Breach", "icon": "🔴", "priority_boost": True},
    "state_escalation": {"title": "State-Level Escalation", "icon": "🏛️", "priority_boost": True},
}

# In-memory alert storage
active_alerts: list = []

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance in meters between two GPS points."""
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dl/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))


def parse_iso_datetime(dt_str: str) -> datetime:
    """Parse ISO datetime string."""
    try:
        if "+" in dt_str and "T" in dt_str and dt_str[-3] == ":":
            dt_str = dt_str[:-3] + dt_str[-2:]
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return datetime.now(IST)


def calculate_overdue_minutes(deadline_str: str) -> float:
    """Minutes past deadline. Negative if not yet overdue."""
    if not deadline_str:
        return 0
    deadline = parse_iso_datetime(deadline_str)
    now = datetime.now(IST)
    return (now - deadline).total_seconds() / 60


# =============================================================================
# CORE MONITORING FUNCTIONS (now async, using data_store)
# =============================================================================

async def check_overdue_tasks() -> list[dict]:
    """Scan active issues from data_store and find overdue tasks."""
    all_issues = await data_store.list_issues()
    overdue_tasks = []

    for issue in all_issues:
        if issue.status not in ("assigned", "in_progress"):
            continue
        if not issue.deadline:
            continue

        overdue_min = calculate_overdue_minutes(issue.deadline)
        if overdue_min <= 0:
            continue

        threshold = OVERDUE_THRESHOLDS.get(issue.severity, 480)
        if overdue_min > threshold * 3:
            esc_level = "state_official"
        elif overdue_min > threshold * 2:
            esc_level = "bmc_supervisor"
        elif overdue_min > threshold:
            esc_level = "fleet_leader"
        else:
            esc_level = "worker"

        loc_dict = issue.location.model_dump() if issue.location else {}
        assign_dict = issue.assigned_to.model_dump() if issue.assigned_to else {}

        overdue_tasks.append({
            "issue_id": issue.issue_id,
            "severity": issue.severity,
            "status": issue.status,
            "deadline": issue.deadline,
            "overdue_minutes": round(overdue_min, 1),
            "overdue_hours": round(overdue_min / 60, 1),
            "threshold_minutes": threshold,
            "escalation_level": esc_level,
            "needs_escalation": overdue_min > threshold,
            "location": loc_dict,
            "category": issue.category,
            "assigned_to": assign_dict,
            "mc": issue.location.city if issue.location else "Unknown",
        })

    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    overdue_tasks.sort(key=lambda x: (severity_order.get(x["severity"], 4), -x["overdue_minutes"]))
    return overdue_tasks


async def check_mc_performance() -> list[dict]:
    """Calculate each MC's resolution rate and flag underperformers."""
    all_issues = await data_store.list_issues()
    mc_stats: dict = {}

    for issue in all_issues:
        city = issue.location.city if issue.location else "Unknown"
        if city not in mc_stats:
            mc_stats[city] = {"total": 0, "resolved": 0, "overdue": 0, "critical_overdue": 0}
        mc_stats[city]["total"] += 1
        if issue.status == "resolved":
            mc_stats[city]["resolved"] += 1
        if issue.deadline and issue.status in ("assigned", "in_progress"):
            if calculate_overdue_minutes(issue.deadline) > 0:
                mc_stats[city]["overdue"] += 1
                if issue.severity == "CRITICAL":
                    mc_stats[city]["critical_overdue"] += 1

    flagged = []
    for mc_name, stats in mc_stats.items():
        if stats["total"] == 0:
            continue
        rate = (stats["resolved"] / stats["total"]) * 100
        if rate < MC_PERFORMANCE_THRESHOLD:
            flagged.append({
                "mc_name": mc_name, "total_issues": stats["total"],
                "resolved": stats["resolved"],
                "resolution_rate_pct": round(rate, 1),
                "threshold_pct": MC_PERFORMANCE_THRESHOLD,
                "overdue_count": stats["overdue"],
                "critical_overdue": stats["critical_overdue"],
                "gap_pct": round(MC_PERFORMANCE_THRESHOLD - rate, 1),
                "alert_type": "mc_performance_drop",
            })
    flagged.sort(key=lambda x: x["resolution_rate_pct"])
    return flagged


async def check_repeated_failures(radius_m: float = REREPORT_RADIUS_M, days: int = REREPORT_WINDOW_DAYS) -> list[dict]:
    """Find locations with multiple resolved-then-re-reported issues."""
    all_issues = await data_store.list_issues()
    checked = set()
    clusters = []

    for issue in all_issues:
        if issue.status != "resolved" or not issue.location:
            continue
        lat, lng = issue.location.lat, issue.location.lng
        key = f"{round(lat, 4)},{round(lng, 4)}"
        if key in checked:
            continue
        checked.add(key)

        nearby = [i for i in all_issues if i.location and
                  haversine_distance(lat, lng, i.location.lat, i.location.lng) <= radius_m]
        resolved = sum(1 for i in nearby if i.status == "resolved")
        active = sum(1 for i in nearby if i.status in ("reported", "assigned", "in_progress"))

        if resolved >= 1 and active >= 1 and len(nearby) >= REREPORT_MIN_COUNT:
            clusters.append({
                "location": {"lat": lat, "lng": lng,
                             "address": issue.location.address,
                             "ward": issue.location.ward,
                             "city": issue.location.city},
                "total_reports": len(nearby), "resolved_count": resolved,
                "active_count": active,
                "issue_ids": [i.issue_id for i in nearby],
                "alert_type": "repeated_failure",
                "recommendation": f"Location has {len(nearby)} reports ({resolved} resolved, {active} active). Indicates failed repair.",
            })
    return clusters


async def check_worker_idle(worker_id: str = None) -> list[dict]:
    """Check workers marked on_task without GPS movement."""
    workers = await data_store.list_workers({"status": "on_task"} if not worker_id else None)
    if worker_id:
        workers = [w for w in workers if w.worker_id == worker_id]

    idle_alerts = []
    # Note: Without last_location_update tracking in current models,
    # this is a placeholder that returns empty. Will be functional when ws_manager tracks GPS.
    return idle_alerts


# =============================================================================
# ESCALATION FUNCTIONS
# =============================================================================

async def auto_escalate_critical() -> list[dict]:
    """Auto-flag CRITICAL issues past SLA."""
    all_issues = await data_store.list_issues()
    escalated = []

    for issue in all_issues:
        if issue.severity != "CRITICAL" or issue.status not in ("assigned", "in_progress"):
            continue
        if not issue.deadline:
            continue
        overdue_min = calculate_overdue_minutes(issue.deadline)
        if overdue_min > OVERDUE_THRESHOLDS["CRITICAL"]:
            alert = generate_alert_from_issue(issue, "critical_sla_breach")
            alert["auto_escalated"] = True
            alert["overdue_minutes"] = round(overdue_min, 1)
            alert["action_required"] = "CRITICAL SLA breach. Auto-escalated. COMMANDER should reassign immediately."
            escalated.append(alert)

            # Log event
            await data_store.add_agent_event(AgentEvent(
                agent="GUARDIAN", action="auto_escalate_critical",
                issue_id=issue.issue_id,
                data={"overdue_minutes": round(overdue_min, 1), "severity": "CRITICAL"},
                portal="state", timestamp=datetime.now(IST).isoformat(),
            ))
    return escalated


async def escalate(issue_id: str, escalated_by: str, reason: str = "") -> dict:
    """Manual escalation by state official."""
    issue = await data_store.get_issue(issue_id)
    if not issue:
        return {"agent": "GUARDIAN", "action": "error", "message": f"Issue {issue_id} not found"}

    now = datetime.now(IST)
    prev_status = issue.status

    # Update issue status
    await data_store.update_issue(issue_id, {"status": "escalated"})

    escalation_record = {
        "issue_id": issue_id, "previous_status": prev_status,
        "new_status": "escalated", "escalated_by": escalated_by,
        "escalated_at": now.isoformat(),
        "reason": reason or f"Manual escalation by {escalated_by}",
        "severity": issue.severity,
    }

    alert = generate_alert_from_issue(issue, "state_escalation")
    alert["escalation"] = escalation_record
    alert["cascade"] = {
        "bmc_portal": {"action": "URGENT — State Escalated",
                       "notification": f"⚠️ State has escalated {issue_id} ({issue.severity}). Immediate attention required."},
        "worker_portal": {"action": "URGENT — State Escalated",
                          "notification": f"🚨 Your task {issue_id} has been flagged as urgent by state officials."},
    }

    active_alerts.append(alert)

    # Log events
    await data_store.add_agent_event(AgentEvent(
        agent="GUARDIAN", action="manual_escalation", issue_id=issue_id,
        data={"escalated_by": escalated_by, "reason": reason, "severity": issue.severity},
        portal="state", timestamp=now.isoformat(),
    ))

    return {
        "agent": "GUARDIAN", "action": "escalated", "issue_id": issue_id,
        "escalation": escalation_record, "alert": alert,
        "broadcast_channels": ["escalations", "issues", "tasks", "notifications"],
        "timestamp": now.isoformat(),
    }


# =============================================================================
# ALERT GENERATION
# =============================================================================

def generate_alert_from_issue(issue: Issue, alert_type: str) -> dict:
    """Generate structured alert from an Issue model."""
    now = datetime.now(IST)
    config = ALERT_TYPES.get(alert_type, {"title": alert_type, "icon": "⚠️", "priority_boost": False})
    loc = issue.location.model_dump() if issue.location else {}
    loc_str = f"{issue.location.address}, {issue.location.ward}, {issue.location.city}" if issue.location else ""

    descriptions = {
        "task_deadline_breach": f"{issue.severity} {issue.category} issue at {loc_str} has breached its deadline.",
        "critical_sla_breach": f"🔴 CRITICAL issue {issue.issue_id} at {loc_str} has breached SLA. Immediate action required.",
        "state_escalation": f"🏛️ State official has escalated {issue.issue_id} ({issue.severity}) at {loc_str}.",
    }

    return {
        "agent": "GUARDIAN",
        "alert_id": f"ALR-{now.strftime('%Y%m%d%H%M%S')}-{issue.issue_id[-4:]}",
        "alert_type": alert_type, "title": config["title"], "icon": config["icon"],
        "description": descriptions.get(alert_type, f"Alert for {issue.issue_id}"),
        "issue_id": issue.issue_id, "severity": issue.severity,
        "category": issue.category, "location": loc,
        "priority_boost": config["priority_boost"],
        "requires_action": alert_type in ("critical_sla_breach", "state_escalation", "repeated_failure"),
        "timestamp": now.isoformat(),
    }


def generate_alert(data: dict, alert_type: str) -> dict:
    """Generate alert from a plain dict (for MC performance, repeated failure, etc.)."""
    now = datetime.now(IST)
    config = ALERT_TYPES.get(alert_type, {"title": alert_type, "icon": "⚠️", "priority_boost": False})
    return {
        "agent": "GUARDIAN",
        "alert_id": f"ALR-{now.strftime('%Y%m%d%H%M%S')}-{str(hash(str(data)))[-4:]}",
        "alert_type": alert_type, "title": config["title"], "icon": config["icon"],
        "description": data.get("recommendation", f"Alert: {alert_type}"),
        "issue_id": data.get("issue_id", ""),
        "severity": data.get("severity", "MEDIUM"),
        "priority_boost": config["priority_boost"],
        "requires_action": alert_type in ("critical_sla_breach", "state_escalation", "repeated_failure"),
        "timestamp": now.isoformat(),
        "data": data,
    }


# =============================================================================
# MONITORING CYCLE
# =============================================================================

async def run_monitoring_cycle() -> dict:
    """Run all monitoring checks. Called periodically as background task."""
    now = datetime.now(IST)
    findings = {
        "agent": "GUARDIAN", "cycle_timestamp": now.isoformat(),
        "overdue_tasks": [], "critical_escalations": [],
        "mc_performance_flags": [], "repeated_failures": [],
        "idle_workers": [], "total_alerts": 0,
    }

    findings["overdue_tasks"] = await check_overdue_tasks()
    findings["critical_escalations"] = await auto_escalate_critical()
    findings["mc_performance_flags"] = await check_mc_performance()
    findings["repeated_failures"] = await check_repeated_failures()
    findings["idle_workers"] = await check_worker_idle()

    findings["total_alerts"] = sum(len(findings[k]) for k in
        ["overdue_tasks", "critical_escalations", "mc_performance_flags",
         "repeated_failures", "idle_workers"])

    # Generate and store alerts
    all_new_alerts = []
    for task in findings["overdue_tasks"]:
        if task.get("needs_escalation"):
            all_new_alerts.append(generate_alert(task, "task_deadline_breach"))
    all_new_alerts.extend(findings["critical_escalations"])
    for mc in findings["mc_performance_flags"]:
        all_new_alerts.append(generate_alert(mc, "mc_performance_drop"))
    for fail in findings["repeated_failures"]:
        all_new_alerts.append(generate_alert(fail, "repeated_failure"))

    active_alerts.extend(all_new_alerts)
    findings["generated_alerts"] = all_new_alerts

    # Log cycle event
    await data_store.add_agent_event(AgentEvent(
        agent="GUARDIAN", action="monitoring_cycle_complete",
        data={"total_alerts": findings["total_alerts"],
              "overdue": len(findings["overdue_tasks"]),
              "critical": len(findings["critical_escalations"])},
        portal="state", timestamp=now.isoformat(),
    ))

    findings["summary"] = (
        f"Monitoring cycle complete. Found: {len(findings['overdue_tasks'])} overdue, "
        f"{len(findings['critical_escalations'])} critical escalations, "
        f"{len(findings['mc_performance_flags'])} underperforming MCs, "
        f"{len(findings['repeated_failures'])} repeated failures."
    )
    return findings


def get_active_alerts() -> list:
    """Return all active alerts."""
    return active_alerts


def clear_alert(alert_id: str) -> bool:
    """Clear/acknowledge an alert."""
    global active_alerts
    orig = len(active_alerts)
    active_alerts = [a for a in active_alerts if a.get("alert_id") != alert_id]
    return len(active_alerts) < orig
