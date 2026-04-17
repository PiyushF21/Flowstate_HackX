"""
PRESCIENT -- Daily/Weekly Reporting & Forecasting Agent
========================================================
Agent #9 in the InfraLens ecosystem.

Purpose: Auto-generates MC performance reports for state government.
- Daily reports per MC with category/severity breakdowns
- Weekly cross-MC digest for state officials
- Predictive forecasting for resource planning

Powered By: Python Aggregation + Grok by xAI (narrative generation)
Portal: BMC -> State Portal
"""

import sys, os
from datetime import datetime, timezone, timedelta
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import DailyReport, AgentEvent
from data_store import data_store
from config import settings

IST = timezone(timedelta(hours=5, minutes=30))

# =============================================================================
# PROMPT TEMPLATES
# =============================================================================

DAILY_NARRATIVE_PROMPT = """You are PRESCIENT, InfraLens's reporting agent. Generate a concise executive summary for the following daily MC performance data.

MC Name: {mc_name}
Date: {date}
Issues Received: {received}
Issues Resolved: {resolved}
Issues Pending: {pending}
Overdue Issues: {overdue}
Resolution Rate: {resolution_rate}%
Avg Resolution Time: {avg_hours} hours
Top Category: {top_category}
Worst Wards: {worst_wards}

Write a 3-4 sentence professional executive summary highlighting key achievements, concerns, and recommended actions.
"""

# =============================================================================
# CORE FUNCTIONS
# =============================================================================

async def generate_daily_report(mc_name: str, date: str = None) -> dict:
    """
    Generate a daily performance report for a specific Municipal Corporation.
    Aggregates issues from data_store by city name.
    """
    if not date:
        date = datetime.now(IST).strftime("%Y-%m-%d")

    all_issues = await data_store.list_issues()
    mc_issues = [i for i in all_issues
                 if i.location and i.location.city and mc_name.lower() in i.location.city.lower()]

    if not mc_issues:
        return {"agent": "PRESCIENT", "error": f"No issues found for MC: {mc_name}"}

    # Core metrics
    total = len(mc_issues)
    resolved = [i for i in mc_issues if i.status == "resolved"]
    pending = [i for i in mc_issues if i.status in ("reported", "assigned", "in_progress")]
    escalated = [i for i in mc_issues if i.status == "escalated"]
    overdue = []
    for i in mc_issues:
        if i.deadline and i.status in ("assigned", "in_progress"):
            deadline = _parse_dt(i.deadline)
            if datetime.now(IST) > deadline:
                overdue.append(i)

    resolution_rate = round((len(resolved) / total) * 100, 1) if total > 0 else 0

    # Avg resolution time
    res_times = [i.resolution_time_hours for i in resolved if i.resolution_time_hours is not None]
    avg_res_hours = round(sum(res_times) / len(res_times), 1) if res_times else 0

    # By category
    by_category = {}
    for i in mc_issues:
        cat = i.category or "unknown"
        if cat not in by_category:
            by_category[cat] = {"total": 0, "resolved": 0, "pending": 0}
        by_category[cat]["total"] += 1
        if i.status == "resolved":
            by_category[cat]["resolved"] += 1
        elif i.status in ("reported", "assigned", "in_progress"):
            by_category[cat]["pending"] += 1

    # By severity
    by_severity = {}
    for i in mc_issues:
        sev = i.severity or "MEDIUM"
        if sev not in by_severity:
            by_severity[sev] = {"total": 0, "resolved": 0, "pending": 0}
        by_severity[sev]["total"] += 1
        if i.status == "resolved":
            by_severity[sev]["resolved"] += 1
        elif i.status in ("reported", "assigned", "in_progress"):
            by_severity[sev]["pending"] += 1

    # Worst wards (top 3 by pending count)
    ward_pending = Counter()
    for i in pending:
        ward = i.location.ward if i.location else "Unknown"
        ward_pending[ward] += 1
    worst_wards = [w for w, _ in ward_pending.most_common(3)]

    # Worker utilization
    all_workers = await data_store.list_workers()
    mc_workers = [w for w in all_workers if mc_name.lower() in w.mc.lower()]
    on_task = sum(1 for w in mc_workers if w.status == "on_task")
    worker_util = round((on_task / len(mc_workers)) * 100, 1) if mc_workers else 0

    # SLA compliance
    sla_met_count = sum(1 for i in resolved if i.sla_met is True)
    sla_compliance = round((sla_met_count / len(resolved)) * 100, 1) if resolved else 0

    # Top category
    top_cat = max(by_category, key=lambda c: by_category[c]["total"]) if by_category else "N/A"

    # Generate narrative (rule-based; will use Grok when API key available)
    narrative = _generate_narrative_rule_based(
        mc_name, date, total, len(resolved), len(pending), len(overdue),
        resolution_rate, avg_res_hours, top_cat, worst_wards, sla_compliance
    )

    now = datetime.now(IST)
    report_id = f"RPT-{mc_name[:3].upper()}-{date}"

    report = DailyReport(
        report_id=report_id,
        mc_name=mc_name,
        date=date,
        generated_by="PRESCIENT",
        generated_at=now.isoformat(),
        summary={
            "issues_received": total,
            "issues_resolved": len(resolved),
            "issues_pending": len(pending),
            "issues_overdue": len(overdue),
            "issues_escalated": len(escalated),
            "resolution_rate_pct": resolution_rate,
            "avg_resolution_hours": avg_res_hours,
            "worker_utilization_pct": worker_util,
            "sla_compliance_pct": sla_compliance,
            "narrative": narrative,
        },
        by_category=by_category,
        by_severity=by_severity,
        worst_wards=worst_wards,
        escalated_tasks=len(escalated),
        fund_utilization_pct=0.0,
    )

    await data_store.create_report(report)
    await data_store.add_agent_event(AgentEvent(
        agent="PRESCIENT", action="daily_report_generated",
        data={"mc_name": mc_name, "report_id": report_id, "total_issues": total},
        portal="state", timestamp=now.isoformat(),
    ))

    return {
        "agent": "PRESCIENT",
        "action": "daily_report",
        "report_id": report_id,
        "report": report.model_dump(),
        "timestamp": now.isoformat(),
    }


async def generate_weekly_digest() -> dict:
    """Generate a state-level weekly digest across all MCs."""
    mcs = await data_store.list_mcs()
    all_issues = await data_store.list_issues()

    mc_summaries = []
    for mc in mcs:
        city = mc.city
        mc_issues = [i for i in all_issues
                     if i.location and i.location.city and city.lower() in i.location.city.lower()]
        total = len(mc_issues)
        resolved = sum(1 for i in mc_issues if i.status == "resolved")
        rate = round((resolved / total) * 100, 1) if total > 0 else 0
        res_times = [i.resolution_time_hours for i in mc_issues
                     if i.status == "resolved" and i.resolution_time_hours]
        avg_h = round(sum(res_times) / len(res_times), 1) if res_times else 0

        mc_summaries.append({
            "mc_name": mc.name, "city": city,
            "total_issues": total, "resolved": resolved,
            "resolution_rate_pct": rate, "avg_resolution_hours": avg_h,
        })

    mc_summaries.sort(key=lambda x: x["resolution_rate_pct"])

    # State-wide totals
    total_all = sum(m["total_issues"] for m in mc_summaries)
    resolved_all = sum(m["resolved"] for m in mc_summaries)
    state_rate = round((resolved_all / total_all) * 100, 1) if total_all else 0

    return {
        "agent": "PRESCIENT",
        "action": "weekly_digest",
        "state_summary": {
            "total_issues": total_all,
            "total_resolved": resolved_all,
            "resolution_rate_pct": state_rate,
            "total_mcs": len(mcs),
        },
        "mc_rankings": mc_summaries,
        "best_mc": mc_summaries[-1]["mc_name"] if mc_summaries else "N/A",
        "worst_mc": mc_summaries[0]["mc_name"] if mc_summaries else "N/A",
        "timestamp": datetime.now(IST).isoformat(),
    }


async def generate_forecast(mc_name: str) -> dict:
    """Predictive warnings based on trends in recent data."""
    all_issues = await data_store.list_issues()
    mc_issues = [i for i in all_issues
                 if i.location and i.location.city and mc_name.lower() in i.location.city.lower()]

    # Category trend analysis
    cat_counts = Counter(i.category for i in mc_issues)
    sev_counts = Counter(i.severity for i in mc_issues)
    pending = sum(1 for i in mc_issues if i.status in ("reported", "assigned", "in_progress"))

    warnings = []
    if sev_counts.get("CRITICAL", 0) >= 2:
        warnings.append({
            "type": "critical_surge",
            "message": f"{mc_name} has {sev_counts['CRITICAL']} CRITICAL issues. High risk of cascade failure.",
            "priority": "HIGH",
        })
    if pending > len(mc_issues) * 0.6:
        warnings.append({
            "type": "backlog_risk",
            "message": f"{mc_name} has {pending} pending issues ({round(pending/len(mc_issues)*100)}% of total). Risk of SLA breaches increasing.",
            "priority": "HIGH",
        })
    top_cat = cat_counts.most_common(1)[0] if cat_counts else ("unknown", 0)
    if top_cat[1] >= 3:
        warnings.append({
            "type": "category_concentration",
            "message": f"{top_cat[0]} issues dominate ({top_cat[1]} issues). Consider dedicated crew allocation.",
            "priority": "MEDIUM",
        })
    if not warnings:
        warnings.append({"type": "stable", "message": f"{mc_name} metrics are within normal range.", "priority": "LOW"})

    return {
        "agent": "PRESCIENT", "action": "forecast", "mc_name": mc_name,
        "warnings": warnings, "category_distribution": dict(cat_counts),
        "severity_distribution": dict(sev_counts),
        "timestamp": datetime.now(IST).isoformat(),
    }


# =============================================================================
# HELPERS
# =============================================================================

def _parse_dt(dt_str: str) -> datetime:
    try:
        if "+" in dt_str and dt_str[-3] == ":":
            dt_str = dt_str[:-3] + dt_str[-2:]
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return datetime.now(IST)


def _generate_narrative_rule_based(mc_name, date, total, resolved, pending, overdue,
                                    rate, avg_hours, top_cat, worst_wards, sla_compliance):
    """Rule-based narrative generation (Grok upgrade in later phase)."""
    parts = [f"{mc_name} processed {total} infrastructure issues on {date}."]

    if rate >= 80:
        parts.append(f"Strong performance with {rate}% resolution rate and average resolution time of {avg_hours} hours.")
    elif rate >= 50:
        parts.append(f"Moderate performance at {rate}% resolution rate. Average resolution time: {avg_hours} hours.")
    else:
        parts.append(f"Performance needs attention -- only {rate}% resolution rate. Average resolution time: {avg_hours} hours.")

    if overdue > 0:
        parts.append(f"ALERT: {overdue} tasks are currently overdue and require immediate attention.")

    if worst_wards:
        parts.append(f"Priority wards: {', '.join(worst_wards)}. Top category: {top_cat}.")

    if sla_compliance < 80 and resolved > 0:
        parts.append(f"SLA compliance at {sla_compliance}% -- below target.")

    return " ".join(parts)
