import asyncio
from fastapi.testclient import TestClient
from main import app
from data_store import data_store

def run_tests():
    print("====================================")
    print(" NEXUS END-TO-END PIPELINE TEST ")
    print("====================================\\n")
    
    with TestClient(app) as client:
        # Simulate a car sensor detecting a severe jolt (pothole)
        payload = {
            "source": "car_sensor",
            "raw_data": {
                "speed_kmh": 45,
                "accelerometer": {"y": 3.2}
            },
            "location": {
                "lat": 19.1196,
                "lng": 72.8467,
                "address": "WEH, Andheri",
                "ward": "K-West",
                "city": "BMC Mumbai"
            }
        }
        
        print("Sending POST /api/nexus/process")
        print("Payload:", payload)
        
        response = client.post(
            "/api/nexus/process",
            json=payload,
            headers={"X-User-Role": "nexus_admin"}
        )
        
        print("\\n=== RESPONSE ===")
        print("Status code:", response.status_code)
        
        if response.status_code == 200:
            data = response.json()
            print("Status:", data.get("status"))
            
            nexus_output = data.get("data", {})
            print("Final Execution Steps:", nexus_output.get("execution_steps"))
            print("Severity Assigned:", nexus_output.get("severity"))
            print("Worker Assigned:", nexus_output.get("worker_id"))
            print("Procedure Generated:", nexus_output.get("procedure"))
        else:
            print("ERROR DETAILS:", response.text)

if __name__ == "__main__":
    run_tests()
