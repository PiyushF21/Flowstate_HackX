"""
Phase 4 — Comprehensive Agent Testing
=======================================
Tests all 4 agents (VIRA, GUARDIAN, PRESCIENT, FLEET) with seed data.
"""
import sys, os, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models import Issue, Worker, Location
from data_store import data_store

passed = 0
failed = 0
bugs_found = []

def check(name, condition, details=""):
    global passed, failed, bugs_found
    if condition:
        passed += 1
        print(f"  [PASS] {name}")
    else:
        failed += 1
        bugs_found.append(f"{name}: {details}")
        print(f"  [FAIL] {name} -- {details}")


async def test_vira_complaint_types():
    """Test VIRA with multiple complaint types."""
    print("\n=== VIRA: Multiple Complaint Types ===")
    from agents.vira import extract_complaint_data_rule_based

    tests = [
        ("There's a huge pothole on the highway near Andheri",
         "roads", "pothole"),
        ("Water pipe burst near Powai Lake, flooding the road",
         "water_pipeline", "burst_pipe"),
        ("Garbage piling up outside Malad station for 3 days",
         "sanitation", "garbage"),
        ("Street light not working on our road since a week, very dark and unsafe",
         "electrical", "street_light"),
        ("Sewage overflowing from manhole near Bandra, terrible smell",
         "sanitation", "sewage_overflow"),
        ("Fallen tree blocking the road after last night's storm",
         "environment", "fallen_tree"),
        ("Traffic signal not working at the busy junction, causing accidents",
         "electrical", "traffic_signal"),
        ("Exposed wires hanging from pole near school, very dangerous for children",
         "electrical", "exposed_wiring"),
        ("Road divider broken and debris scattered on highway",
         "traffic", "broken_divider"),
        ("Drain completely blocked near our house, water not flowing",
         "sanitation", "drain_blockage"),
    ]

    for msg, expected_cat, expected_sub in tests:
        data = extract_complaint_data_rule_based(msg)
        check(f"'{msg[:50]}...' -> {expected_cat}",
              data["category"] == expected_cat,
              f"got {data['category']}/{data['subcategory']}")
        check(f"  subcategory -> {expected_sub}",
              data["subcategory"] == expected_sub,
              f"got {data['subcategory']}")


async def test_vira_mode_detection():
    """Test VIRA mode detection accuracy."""
    print("\n=== VIRA: Mode Detection Accuracy ===")
    from agents.vira import detect_mode

    report_msgs = [
        "There is a pothole near my house",
        "I want to report a broken street light",
        "Water leaking from pipe on main road",
        "Garbage dump is growing outside the park",
        "Huge crack in the road surface, very dangerous",
        "Fallen tree blocking traffic on the highway",
        "Open manhole near the bus stop, someone could fall in",
    ]

    query_msgs = [
        "What is the status of my complaint?",
        "Any update on ISS-MUM-2026-04-17-0001?",
        "When will my issue be fixed?",
        "Is my complaint being worked on?",
        "Track my report please",
        "Has anyone been assigned to my complaint?",
    ]

    general_msgs = [
        "Hello!",
        "What is InfraLens?",
        "What can you do?",
        "Thank you so much!",
        "Good morning",
    ]

    for msg in report_msgs:
        mode = detect_mode(msg)
        check(f"REPORT: '{msg[:45]}' -> {mode}", mode == "report", f"got '{mode}'")

    for msg in query_msgs:
        mode = detect_mode(msg)
        check(f"QUERY: '{msg[:45]}' -> {mode}", mode == "query", f"got '{mode}'")

    for msg in general_msgs:
        mode = detect_mode(msg)
        check(f"GENERAL: '{msg[:45]}' -> {mode}", mode == "general", f"got '{mode}'")


async def test_vira_full_chat():
    """Test VIRA full chat flow with data_store."""
    print("\n=== VIRA: Full Chat Flow ===")
    from agents.vira import chat

    # Report flow
    r1 = await chat("test-p4-001", "There is a burst water pipe near Powai Lake flooding everything")
    check("Report: action=issue_created", r1["action_taken"] == "issue_created")
    check("Report: has issue_id", "issue_id" in r1 and r1["issue_id"].startswith("ISS-"))
    check("Report: category=water_pipeline", r1["extracted_data"]["category"] == "water_pipeline")
    check("Report: has response text", len(r1.get("response", "")) > 50)

    # Verify stored in data_store
    stored = await data_store.get_issue(r1["issue_id"])
    check("Report: stored in data_store", stored is not None)
    check("Report: stored status=assigned (via NEXUS)", stored.status == "assigned" if stored else False)

    # Query flow - by user ID (search seed data reporter)
    r2 = await chat("CIT-MUM-042", "What's the status of my complaint?")
    check("Query: action=status_query", r2["action_taken"] == "status_query")
    check("Query: has response", len(r2.get("response", "")) > 20)

    # Query flow - by issue ID
    r3 = await chat("anyone", "What happened with ISS-MUM-2026-04-17-0001?")
    check("Query by ID: mode=query", r3["mode_detected"] == "query")

    # General flow
    r4 = await chat("test-p4-002", "Hello, what is InfraLens?")
    check("General: mode=general", r4["mode_detected"] == "general")
    check("General: has helpful response", "InfraLens" in r4.get("response", ""))


async def test_guardian_overdue():
    """Test GUARDIAN with overdue seed data."""
    print("\n=== GUARDIAN: Overdue Detection ===")
    from agents.guardian import check_overdue_tasks, OVERDUE_THRESHOLDS

    overdue = await check_overdue_tasks()
    check("Overdue: found tasks", len(overdue) > 0, f"found {len(overdue)}")

    # Seed data has CRITICAL issues with past deadlines
    critical_overdue = [t for t in overdue if t["severity"] == "CRITICAL"]
    check("Overdue: has CRITICAL tasks", len(critical_overdue) > 0,
          f"found {len(critical_overdue)}")

    for task in critical_overdue:
        check(f"Overdue {task['issue_id']}: needs_escalation=True",
              task["needs_escalation"] == True)
        check(f"Overdue {task['issue_id']}: has overdue_minutes > 0",
              task["overdue_minutes"] > 0)
        check(f"Overdue {task['issue_id']}: escalation_level set",
              task["escalation_level"] in ("worker", "fleet_leader", "bmc_supervisor", "state_official"))


async def test_guardian_escalation():
    """Test GUARDIAN escalation flow."""
    print("\n=== GUARDIAN: Escalation ===")
    from agents.guardian import escalate, auto_escalate_critical, get_active_alerts

    # Manual escalation
    esc = await escalate("ISS-MUM-2026-04-17-0005", "STATE-OFF-TEST", "Phase 4 test")
    check("Escalate: action=escalated", esc["action"] == "escalated")
    check("Escalate: has escalation record", "escalation" in esc)
    check("Escalate: has cascade alerts", "cascade" in esc.get("alert", {}))

    # Verify issue status updated
    issue = await data_store.get_issue("ISS-MUM-2026-04-17-0005")
    check("Escalate: status=escalated in data_store", issue.status == "escalated")

    # Auto-escalate critical
    auto = await auto_escalate_critical()
    check("Auto-escalate: returns list", isinstance(auto, list))

    # Alerts stored
    alerts = get_active_alerts()
    check("Alerts: active alerts exist", len(alerts) > 0, f"found {len(alerts)}")


async def test_guardian_mc_performance():
    """Test GUARDIAN MC performance monitoring."""
    print("\n=== GUARDIAN: MC Performance ===")
    from agents.guardian import check_mc_performance

    flags = await check_mc_performance()
    check("MC perf: returns flags", isinstance(flags, list))
    check("MC perf: found underperformers", len(flags) > 0, f"found {len(flags)}")

    for mc in flags:
        check(f"MC perf {mc['mc_name']}: has rate", "resolution_rate_pct" in mc)
        check(f"MC perf {mc['mc_name']}: rate < 60%",
              mc["resolution_rate_pct"] < 60,
              f"rate={mc['resolution_rate_pct']}%")


async def test_guardian_monitoring_cycle():
    """Test GUARDIAN full monitoring cycle."""
    print("\n=== GUARDIAN: Full Monitoring Cycle ===")
    from agents.guardian import run_monitoring_cycle

    cycle = await run_monitoring_cycle()
    check("Cycle: has summary", "summary" in cycle)
    check("Cycle: has overdue_tasks", "overdue_tasks" in cycle)
    check("Cycle: has total_alerts", cycle["total_alerts"] >= 0)
    check("Cycle: agent=GUARDIAN", cycle["agent"] == "GUARDIAN")


async def test_prescient_daily():
    """Test PRESCIENT daily report with correct metrics."""
    print("\n=== PRESCIENT: Daily Report ===")
    from agents.prescient import generate_daily_report

    report = await generate_daily_report("Mumbai")
    check("Daily: has report", "report" in report)

    r = report["report"]
    s = r["summary"]
    check("Daily: issues_received > 0", s["issues_received"] > 0, f"got {s['issues_received']}")
    check("Daily: issues_resolved >= 0", s["issues_resolved"] >= 0)
    check("Daily: resolution_rate in 0-100", 0 <= s["resolution_rate_pct"] <= 100)
    check("Daily: avg_resolution_hours >= 0", s["avg_resolution_hours"] >= 0)
    check("Daily: has narrative", len(s.get("narrative", "")) > 20)

    # Category breakdown
    check("Daily: has by_category", len(r["by_category"]) > 0)
    check("Daily: roads in categories", "roads" in r["by_category"])

    # Severity breakdown
    check("Daily: has by_severity", len(r["by_severity"]) > 0)

    # Worst wards
    check("Daily: has worst_wards", isinstance(r["worst_wards"], list))

    # Verify Mumbai-specific: seed has ~25 Mumbai issues
    check("Daily: Mumbai has 20+ issues", s["issues_received"] >= 20,
          f"got {s['issues_received']}")


async def test_prescient_weekly():
    """Test PRESCIENT weekly digest."""
    print("\n=== PRESCIENT: Weekly Digest ===")
    from agents.prescient import generate_weekly_digest

    digest = await generate_weekly_digest()
    check("Weekly: has state_summary", "state_summary" in digest)
    check("Weekly: has mc_rankings", "mc_rankings" in digest)
    check("Weekly: total_issues > 0", digest["state_summary"]["total_issues"] > 0)
    check("Weekly: has multiple MCs", len(digest["mc_rankings"]) >= 3,
          f"got {len(digest['mc_rankings'])}")


async def test_prescient_forecast():
    """Test PRESCIENT forecast."""
    print("\n=== PRESCIENT: Forecast ===")
    from agents.prescient import generate_forecast

    fc = await generate_forecast("Mumbai")
    check("Forecast: has warnings", len(fc["warnings"]) > 0)
    check("Forecast: has category_distribution", len(fc["category_distribution"]) > 0)
    check("Forecast: has severity_distribution", len(fc["severity_distribution"]) > 0)


async def test_fleet_compare():
    """Test FLEET MC comparison returns ranked list."""
    print("\n=== FLEET: MC Comparison ===")
    from agents.fleet import compare_mc_performance

    rankings = await compare_mc_performance()
    check("Compare: returns list", isinstance(rankings, list))
    check("Compare: has 3+ MCs", len(rankings) >= 3, f"got {len(rankings)}")

    # Verify ranking order
    if len(rankings) >= 2:
        check("Compare: ranked by score (desc)",
              rankings[0]["score"] >= rankings[-1]["score"],
              f"first={rankings[0]['score']}, last={rankings[-1]['score']}")

    for r in rankings:
        check(f"Compare {r['city']}: has rank", "rank" in r)
        check(f"Compare {r['city']}: has resolution_rate", "resolution_rate_pct" in r)
        check(f"Compare {r['city']}: has score", "score" in r)


async def test_fleet_clusters():
    """Test FLEET geographic clustering."""
    print("\n=== FLEET: Geographic Clusters ===")
    from agents.fleet import detect_geographic_clusters

    # With smaller radius, seed data might cluster
    clusters = await detect_geographic_clusters(radius_m=5000, min_count=2)
    check("Clusters: returns list", isinstance(clusters, list))
    if clusters:
        for c in clusters[:2]:
            check(f"Cluster at {c['center'].get('address','?')}: has issue_count",
                  c["issue_count"] >= 2)
            check(f"Cluster: has insight", len(c.get("insight", "")) > 10)


async def test_fleet_anomalies():
    """Test FLEET category anomaly detection."""
    print("\n=== FLEET: Category Anomalies ===")
    from agents.fleet import detect_category_anomalies

    anomalies = await detect_category_anomalies(threshold_pct=30)
    check("Anomalies: returns list", isinstance(anomalies, list))
    if anomalies:
        for a in anomalies[:2]:
            check(f"Anomaly {a['mc']}/{a['category']}: pct >= 30",
                  a["percentage"] >= 30)


async def test_fleet_insights():
    """Test FLEET full insights generation."""
    print("\n=== FLEET: Full Insights ===")
    from agents.fleet import generate_insights

    ins = await generate_insights()
    check("Insights: has summary", "summary" in ins)
    check("Insights: has mc_rankings", "mc_rankings" in ins)
    check("Insights: has insights list", isinstance(ins["insights"], list))
    check("Insights: total > 0", ins["summary"]["total_insights"] > 0,
          f"got {ins['summary']['total_insights']}")

    # Check agent events logged
    events = await data_store.get_agent_events()
    fleet_events = [e for e in events if e.agent == "FLEET"]
    check("Insights: FLEET events logged", len(fleet_events) > 0)


async def run_all():
    data_store.load_seed_data()
    print(f"Seed data loaded: {len(await data_store.list_issues())} issues, "
          f"{len(await data_store.list_workers())} workers")

    await test_vira_complaint_types()
    await test_vira_mode_detection()
    await test_vira_full_chat()
    await test_guardian_overdue()
    await test_guardian_escalation()
    await test_guardian_mc_performance()
    await test_guardian_monitoring_cycle()
    await test_prescient_daily()
    await test_prescient_weekly()
    await test_prescient_forecast()
    await test_fleet_compare()
    await test_fleet_clusters()
    await test_fleet_anomalies()
    await test_fleet_insights()

    print("\n" + "=" * 60)
    print(f"PHASE 4 RESULTS: {passed} passed, {failed} failed")
    print("=" * 60)

    if bugs_found:
        print(f"\nBUGS FOUND ({len(bugs_found)}):")
        for bug in bugs_found:
            print(f"  - {bug}")
    else:
        print("\nNO BUGS FOUND!")

    return failed == 0


if __name__ == "__main__":
    success = asyncio.run(run_all())
    sys.exit(0 if success else 1)
