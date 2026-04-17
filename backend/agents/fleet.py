"""
FLEET -- Cross-MC Pattern Analytics Agent
==========================================
Agent #5 in the InfraLens ecosystem.

Purpose: Monitors all MCs statewide to detect macro-level infrastructure
failure patterns, clusters, trends, and performance anomalies.

Powered By: Python Clustering + Grok by xAI (insight generation)
Portal: State Government Portal
"""

import sys, os, math
from datetime import datetime, timezone, timedelta
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import AgentEvent
from data_store import data_store
from config import settings

IST = timezone(timedelta(hours=5, minutes=30))


def _haversine(lat1, lng1, lat2, lng2):
    R = 6371000
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp, dl = math.radians(lat2 - lat1), math.radians(lng2 - lng1)
    a = math.sin(dp/2)**2 + math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# =============================================================================
# CORE ANALYTICS
# =============================================================================

async def detect_geographic_clusters(radius_m: float = 500, min_count: int = 3, days: int = 7) -> list[dict]:
    """Find geographic clusters of issues within radius_m meters."""
    all_issues = await data_store.list_issues()
    issues_with_loc = [i for i in all_issues if i.location]
    checked = set()
    clusters = []

    for issue in issues_with_loc:
        key = f"{round(issue.location.lat, 3)},{round(issue.location.lng, 3)}"
        if key in checked:
            continue
        checked.add(key)

        nearby = [i for i in issues_with_loc
                  if _haversine(issue.location.lat, issue.location.lng,
                               i.location.lat, i.location.lng) <= radius_m]

        if len(nearby) >= min_count:
            cats = Counter(i.category for i in nearby)
            sevs = Counter(i.severity for i in nearby)
            clusters.append({
                "type": "geographic_cluster",
                "center": {"lat": issue.location.lat, "lng": issue.location.lng,
                           "address": issue.location.address, "city": issue.location.city},
                "issue_count": len(nearby),
                "issue_ids": [i.issue_id for i in nearby],
                "categories": dict(cats),
                "severities": dict(sevs),
                "dominant_category": cats.most_common(1)[0][0] if cats else "unknown",
                "priority": "HIGH" if sevs.get("CRITICAL", 0) > 0 else "MEDIUM",
                "insight": f"{len(nearby)} issues within {radius_m}m of {issue.location.address}. "
                           f"Dominant category: {cats.most_common(1)[0][0] if cats else 'mixed'}. "
                           f"May indicate systemic infrastructure failure.",
            })

    clusters.sort(key=lambda x: x["issue_count"], reverse=True)
    return clusters


async def detect_category_anomalies(threshold_pct: float = 40) -> list[dict]:
    """Flag MCs where one category dominates above threshold."""
    all_issues = await data_store.list_issues()
    mc_cats = defaultdict(lambda: Counter())

    for issue in all_issues:
        city = issue.location.city if issue.location else "Unknown"
        mc_cats[city][issue.category] += 1

    anomalies = []
    for city, cats in mc_cats.items():
        total = sum(cats.values())
        if total < 3:
            continue
        for cat, count in cats.most_common(1):
            pct = (count / total) * 100
            if pct >= threshold_pct:
                anomalies.append({
                    "type": "category_anomaly",
                    "mc": city, "category": cat,
                    "count": count, "total": total,
                    "percentage": round(pct, 1),
                    "priority": "HIGH" if pct >= 60 else "MEDIUM",
                    "insight": f"{city}: {cat} issues represent {round(pct)}% of all issues ({count}/{total}). "
                               f"Consider dedicated resource allocation.",
                })
    return anomalies


async def compare_mc_performance() -> list[dict]:
    """Rank all MCs by key performance metrics."""
    mcs = await data_store.list_mcs()
    all_issues = await data_store.list_issues()
    rankings = []

    for mc in mcs:
        city = mc.city
        mc_issues = [i for i in all_issues
                     if i.location and i.location.city and city.lower() in i.location.city.lower()]
        total = len(mc_issues)
        if total == 0:
            continue

        resolved = sum(1 for i in mc_issues if i.status == "resolved")
        rate = round((resolved / total) * 100, 1)
        res_times = [i.resolution_time_hours for i in mc_issues
                     if i.status == "resolved" and i.resolution_time_hours]
        avg_hours = round(sum(res_times) / len(res_times), 1) if res_times else 0
        sla_met = sum(1 for i in mc_issues if i.sla_met is True)
        sla_rate = round((sla_met / resolved) * 100, 1) if resolved else 0
        critical = sum(1 for i in mc_issues if i.severity == "CRITICAL" and i.status != "resolved")

        rankings.append({
            "mc_name": mc.name, "city": city,
            "total_issues": total, "resolved": resolved,
            "resolution_rate_pct": rate,
            "avg_resolution_hours": avg_hours,
            "sla_compliance_pct": sla_rate,
            "active_critical": critical,
            "score": round(rate * 0.4 + sla_rate * 0.3 + max(0, 100 - avg_hours * 2) * 0.3, 1),
        })

    rankings.sort(key=lambda x: x["score"], reverse=True)

    # Add rank
    for i, r in enumerate(rankings):
        r["rank"] = i + 1

    return rankings


async def detect_recurrence(days: int = 30) -> list[dict]:
    """Find GPS locations with resolved-then-re-reported issues."""
    all_issues = await data_store.list_issues()
    resolved = [i for i in all_issues if i.status == "resolved" and i.location]
    active = [i for i in all_issues if i.status in ("reported", "assigned", "in_progress") and i.location]
    recurrences = []
    checked = set()

    for res_issue in resolved:
        key = f"{round(res_issue.location.lat, 4)},{round(res_issue.location.lng, 4)}"
        if key in checked:
            continue
        checked.add(key)

        re_reports = [a for a in active
                      if _haversine(res_issue.location.lat, res_issue.location.lng,
                                    a.location.lat, a.location.lng) <= 50]
        if re_reports:
            recurrences.append({
                "type": "recurrence",
                "original_issue": res_issue.issue_id,
                "re_reported_issues": [a.issue_id for a in re_reports],
                "location": res_issue.location.model_dump(),
                "category": res_issue.category,
                "priority": "HIGH",
                "insight": f"Location {res_issue.location.address} has {len(re_reports)} new report(s) "
                           f"after being marked resolved. Previous repair may have failed.",
            })
    return recurrences


async def generate_insights() -> dict:
    """Aggregate all analytics into a single insights report."""
    now = datetime.now(IST)
    clusters = await detect_geographic_clusters()
    anomalies = await detect_category_anomalies()
    rankings = await compare_mc_performance()
    recurrences = await detect_recurrence()

    all_insights = []
    for c in clusters:
        all_insights.append({"type": c["type"], "priority": c["priority"],
                             "insight": c["insight"], "data": c})
    for a in anomalies:
        all_insights.append({"type": a["type"], "priority": a["priority"],
                             "insight": a["insight"], "data": a})
    for r in recurrences:
        all_insights.append({"type": r["type"], "priority": r["priority"],
                             "insight": r["insight"], "data": r})

    # Performance gaps
    if len(rankings) >= 2:
        best, worst = rankings[0], rankings[-1]
        if best["resolution_rate_pct"] - worst["resolution_rate_pct"] > 20:
            all_insights.append({
                "type": "performance_gap", "priority": "MEDIUM",
                "insight": f"Performance gap: {best['city']} ({best['resolution_rate_pct']}%) vs "
                           f"{worst['city']} ({worst['resolution_rate_pct']}%). Consider resource reallocation.",
                "data": {"best": best, "worst": worst},
            })

    all_insights.sort(key=lambda x: {"HIGH": 0, "MEDIUM": 1, "LOW": 2}.get(x["priority"], 3))

    await data_store.add_agent_event(AgentEvent(
        agent="FLEET", action="insights_generated",
        data={"total_insights": len(all_insights), "clusters": len(clusters),
              "anomalies": len(anomalies), "recurrences": len(recurrences)},
        portal="state", timestamp=now.isoformat(),
    ))

    return {
        "agent": "FLEET", "action": "insights",
        "insights": all_insights,
        "summary": {
            "geographic_clusters": len(clusters),
            "category_anomalies": len(anomalies),
            "recurrences": len(recurrences),
            "total_insights": len(all_insights),
        },
        "mc_rankings": rankings,
        "timestamp": now.isoformat(),
    }
