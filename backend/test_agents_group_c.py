import asyncio
from fastapi.testclient import TestClient
from main import app

def run_tests():
    print("====================================")
    print(" GROUP C (AMIT) BACKEND AGENTS TEST ")
    print("====================================\\n")
    
    with TestClient(app) as client:
        print("1. Testing LOOP proof upload...")
        res_proof = client.post("/api/loop/proof", json={
            "issue_id": "ISS-MUM-2026-04-17-0042",
            "images": ["url1", "url2"],
            "notes": "Fixed the pothole."
        }, headers={"X-User-Role": "field_worker"})
        print("Proof Status:", res_proof.status_code)
        
        print("2. Testing LOOP verify completion...")
        res_verify = client.post("/api/loop/verify", json={
            "issue_id": "ISS-MUM-2026-04-17-0042",
            "verifier_id": "SUPER-001",
            "approved": True
        }, headers={"X-User-Role": "bmc_supervisor"})
        print("Verify Status:", res_verify.status_code)
        
        print("3. Testing ORACLE budget tracker...")
        res_tracker = client.get("/api/oracle/budget-tracker", headers={"X-User-Role": "state_official"})
        print("Tracker Status:", res_tracker.status_code)
        print("Tracker Data:", res_tracker.json())
        
        if res_proof.status_code == 200 and res_verify.status_code == 200 and res_tracker.status_code == 200:
            print("\\n✓ All Amit Phase 4 API endpoints functioning correctly!")
        else:
            print("\\n❌ Error in tests.")

if __name__ == "__main__":
    run_tests()
