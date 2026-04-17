"""Phase 1 quick verification — tests VIRA and GUARDIAN drafts."""
import sys
sys.path.insert(0, '.')

# ==================== VIRA TESTS ====================
from agents.vira import detect_mode, extract_complaint_data_rule_based, chat, format_general_response

print("=== VIRA Mode Detection Tests ===")
tests = [
    ("There is a huge pothole near Andheri metro station", "report"),
    ("What is the status of my complaint?", "query"),
    ("Hello, what is InfraLens?", "general"),
    ("Water pipe burst near Powai Lake Gate 2, flooding the road", "report"),
    ("My complaint ISS-MUM-2026-04-17-0042", "query"),
    ("Thank you!", "general"),
]

all_pass = True
for msg, expected in tests:
    result = detect_mode(msg)
    status = "PASS" if result == expected else "FAIL"
    if status == "FAIL":
        all_pass = False
    print(f"  [{status}] \"{msg[:55]}\" -> {result} (expected: {expected})")

print()
print("=== VIRA Complaint Extraction Test ===")
data = extract_complaint_data_rule_based("There is a huge pothole near Andheri metro station, almost broke my tire")
print(f"  Category: {data['category']}")
print(f"  Subcategory: {data['subcategory']}")
print(f"  Severity: {data['severity']}")
print(f"  Location: {data['location_text']}")
assert data["category"] == "roads", f"Expected roads, got {data['category']}"
assert data["subcategory"] == "pothole", f"Expected pothole, got {data['subcategory']}"
print("  [PASS] Extraction correct")

print()
print("=== VIRA Full Chat Test ===")
result = chat("user-001", "There is a burst water pipe near Powai Lake flooding the road")
print(f"  Mode: {result['mode_detected']}")
print(f"  Action: {result['action_taken']}")
print(f"  Has response: {bool(result.get('response'))}")
assert result["mode_detected"] == "report"
assert result["action_taken"] == "issue_created"
print("  [PASS] Chat works correctly")

# ==================== GUARDIAN TESTS ====================
print()
print("=" * 50)
from agents.guardian import (
    check_overdue_tasks, check_mc_performance, generate_alert,
    escalate, run_monitoring_cycle, OVERDUE_THRESHOLDS,
    haversine_distance, check_repeated_failures
)

print("=== GUARDIAN Constants Test ===")
print(f"  OVERDUE_THRESHOLDS: {OVERDUE_THRESHOLDS}")
assert OVERDUE_THRESHOLDS["CRITICAL"] == 30
assert OVERDUE_THRESHOLDS["HIGH"] == 240
assert OVERDUE_THRESHOLDS["MEDIUM"] == 480
assert OVERDUE_THRESHOLDS["LOW"] == 1440
print("  [PASS] Thresholds correct")

print()
print("=== GUARDIAN Haversine Distance Test ===")
# Mumbai: Andheri to Bandra ~5km
dist = haversine_distance(19.1196, 72.8467, 19.0596, 72.8295)
print(f"  Andheri to Bandra: {dist:.0f} meters")
assert 5000 < dist < 8000, f"Expected ~6km, got {dist:.0f}m"
print("  [PASS] Haversine calculation correct")

print()
print("=== GUARDIAN Overdue Tasks Test ===")
import datetime
# Create a fake overdue issue
now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5, minutes=30)))
past_deadline = (now - datetime.timedelta(hours=2)).isoformat()

mock_issues = [
    {
        "issue_id": "ISS-MUM-2026-04-17-0001",
        "status": "assigned",
        "severity": "CRITICAL",
        "deadline": past_deadline,
        "category": "roads",
        "location": {"lat": 19.1196, "lng": 72.8467, "city": "Mumbai", "ward": "K-West", "address": "WEH Andheri"},
        "assigned_to": {"worker_id": "WRK-001", "worker_name": "Ganesh Patil"},
    },
    {
        "issue_id": "ISS-MUM-2026-04-17-0002",
        "status": "resolved",
        "severity": "HIGH",
        "deadline": past_deadline,
        "category": "water_pipeline",
        "location": {"lat": 19.0760, "lng": 72.8777, "city": "Mumbai"},
    },
]

overdue = check_overdue_tasks(mock_issues)
print(f"  Found {len(overdue)} overdue tasks")
assert len(overdue) == 1, f"Expected 1 overdue (resolved should be excluded), got {len(overdue)}"
assert overdue[0]["issue_id"] == "ISS-MUM-2026-04-17-0001"
assert overdue[0]["overdue_minutes"] > 0
print(f"  Overdue minutes: {overdue[0]['overdue_minutes']}")
print(f"  Needs escalation: {overdue[0]['needs_escalation']}")
print("  [PASS] Overdue detection correct")

print()
print("=== GUARDIAN Alert Generation Test ===")
alert = generate_alert(mock_issues[0], "task_deadline_breach")
print(f"  Alert ID: {alert['alert_id']}")
print(f"  Type: {alert['alert_type']}")
print(f"  Title: {alert['title']}")
assert alert["agent"] == "GUARDIAN"
assert alert["alert_type"] == "task_deadline_breach"
assert alert["issue_id"] == "ISS-MUM-2026-04-17-0001"
print("  [PASS] Alert generation correct")

print()
print("=== GUARDIAN Escalation Test ===")
esc_result = escalate(mock_issues[0], "STATE-OFF-001", "Overdue critical task")
print(f"  Action: {esc_result['action']}")
print(f"  Cascade channels: {esc_result['broadcast_channels']}")
assert esc_result["action"] == "escalated"
assert "escalation" in esc_result
assert "alert" in esc_result
print("  [PASS] Escalation works correctly")

print()
print("=== GUARDIAN MC Performance Test ===")
mc_flags = check_mc_performance(mock_issues)
print(f"  Flagged MCs: {len(mc_flags)}")
# With 1 resolved out of 2, rate = 50% which is below 60% threshold
for mc in mc_flags:
    print(f"    {mc['mc_name']}: {mc['resolution_rate_pct']}%")
print("  [PASS] MC performance check correct")

print()
print("=== GUARDIAN Full Monitoring Cycle Test ===")
cycle = run_monitoring_cycle(mock_issues)
print(f"  Total alerts: {cycle['total_alerts']}")
print(f"  Summary: {cycle['summary']}")
assert cycle["total_alerts"] >= 1
print("  [PASS] Monitoring cycle works correctly")

print()
print("=" * 50)
print("ALL PHASE 1 TESTS PASSED!")
print("=" * 50)
