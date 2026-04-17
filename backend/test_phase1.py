"""Phase 2 verification — tests VIRA and GUARDIAN with real models + data_store."""
import sys, os, asyncio
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from models import Issue, Worker, Location
from data_store import data_store
from config import settings

async def run_tests():
    # Load seed data
    data_store.load_seed_data()
    issues = await data_store.list_issues()
    workers = await data_store.list_workers()
    print(f"Seed data: {len(issues)} issues, {len(workers)} workers")
    assert len(issues) >= 25, f"Expected 25+ issues, got {len(issues)}"
    assert len(workers) >= 15, f"Expected 15+ workers, got {len(workers)}"
    print("[PASS] from models import ... works")
    print("[PASS] from data_store import data_store works")

    # === VIRA TESTS ===
    from agents.vira import detect_mode, chat, extract_complaint_data_rule_based

    print("\n=== VIRA Phase 2 Tests ===")

    # Mode detection
    assert detect_mode("There is a pothole near Andheri") == "report"
    assert detect_mode("What is the status of my complaint?") == "query"
    assert detect_mode("Hello!") == "general"
    print("[PASS] detect_mode works")

    # Extraction
    data = extract_complaint_data_rule_based("Huge pothole near Andheri metro, almost broke my tire")
    assert data["category"] == "roads"
    assert data["subcategory"] == "pothole"
    print(f"[PASS] Extraction: {data['category']}/{data['subcategory']}/{data['severity']}")

    # Full chat - report mode (creates issue in data_store)
    result = await chat("test-user-001", "There is a burst water pipe near Powai Lake flooding the road")
    assert result["mode_detected"] == "report"
    assert result["action_taken"] == "issue_created"
    assert "issue_id" in result
    print(f"[PASS] Chat report: created {result['issue_id']}")

    # Verify issue was stored
    created_issue = await data_store.get_issue(result["issue_id"])
    assert created_issue is not None
    assert created_issue.source == "manual_complaint"
    assert created_issue.category == "water_pipeline"
    print(f"[PASS] Issue stored in data_store: {created_issue.category}/{created_issue.subcategory}")

    # Full chat - query mode
    result2 = await chat("CIT-MUM-045", "What is the status of my complaint?")
    assert result2["mode_detected"] == "query"
    print(f"[PASS] Chat query: {result2['action_taken']}")

    # Full chat - general mode
    result3 = await chat("test-user-002", "Hello, what is InfraLens?")
    assert result3["mode_detected"] == "general"
    print(f"[PASS] Chat general: {result3['action_taken']}")

    # === GUARDIAN TESTS ===
    from agents.guardian import (
        check_overdue_tasks, check_mc_performance, escalate,
        run_monitoring_cycle, OVERDUE_THRESHOLDS, haversine_distance
    )

    print("\n=== GUARDIAN Phase 2 Tests ===")

    assert OVERDUE_THRESHOLDS["CRITICAL"] == 30
    assert OVERDUE_THRESHOLDS["HIGH"] == 240
    print("[PASS] Thresholds correct")

    dist = haversine_distance(19.1196, 72.8467, 19.0596, 72.8295)
    assert 5000 < dist < 8000
    print(f"[PASS] Haversine: {dist:.0f}m")

    # Check overdue (uses data_store)
    overdue = await check_overdue_tasks()
    print(f"[PASS] Overdue tasks from data_store: {len(overdue)} found")

    # MC performance
    mc_flags = await check_mc_performance()
    print(f"[PASS] MC performance flags: {len(mc_flags)} underperforming")
    for mc in mc_flags:
        print(f"       {mc['mc_name']}: {mc['resolution_rate_pct']}%")

    # Escalation (uses data_store)
    esc = await escalate("ISS-MUM-2026-04-17-0002", "STATE-OFF-001", "Test escalation")
    assert esc["action"] == "escalated"
    updated = await data_store.get_issue("ISS-MUM-2026-04-17-0002")
    assert updated.status == "escalated"
    print(f"[PASS] Escalation: {esc['issue_id']} -> status={updated.status}")

    # Full monitoring cycle
    cycle = await run_monitoring_cycle()
    print(f"[PASS] Monitoring cycle: {cycle['total_alerts']} alerts")
    print(f"       {cycle['summary']}")

    # Check agent events were logged
    events = await data_store.get_agent_events()
    guardian_events = [e for e in events if e.agent == "GUARDIAN"]
    vira_events = [e for e in events if e.agent == "VIRA"]
    print(f"\n[PASS] Agent events logged: VIRA={len(vira_events)}, GUARDIAN={len(guardian_events)}")

    print("\n" + "=" * 50)
    print("ALL PHASE 2 TESTS PASSED!")
    print("=" * 50)

asyncio.run(run_tests())
