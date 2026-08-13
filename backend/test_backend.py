import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_flow():
    client = TestClient(app)
    
    # 1. Health check
    res = client.get("/")
    assert res.status_code == 200
    print("Health check passed:", res.json()["application"])

    # 2. Signup
    signup_data = {
        "email": "testuser@digitaltwin.ai",
        "password": "Password123!",
        "language": "ta"
    }
    res = client.post("/api/v1/auth/signup", json=signup_data)
    if res.status_code != 200:
        # If already exists, login
        res = client.post("/api/v1/auth/login", json=signup_data)
    assert res.status_code == 200, res.text
    token_data = res.json()
    token = token_data["access_token"]
    print("Auth passed. Token received.")

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Create Profile
    profile_data = {
        "name": "Karthik Raja",
        "age": 28,
        "gender": "Male",
        "height": 178.0,
        "weight": 74.0,
        "place": "Chennai"
    }
    res = client.post("/api/v1/profile", json=profile_data, headers=headers)
    assert res.status_code == 200, res.text
    print("Profile created. BMI:", res.json()["bmi"])

    # 4. Seed 14-day history
    res = client.post("/api/v1/analytics/seed-demo", headers=headers)
    assert res.status_code == 200, res.text
    print("14-Day simulation seeded successfully:", res.json())

    # 5. Fetch Digital Twin State
    res = client.get("/api/v1/digital-twin", headers=headers)
    assert res.status_code == 200, res.text
    twin = res.json()
    print("Digital Twin Overall Score:", twin["health_score"]["overall_score"])
    print("Heart Score:", twin["organs"]["heart"]["score"])
    print("Brain Score:", twin["organs"]["brain"]["score"])

    # 6. Fetch Predictions
    res = client.get("/api/v1/analytics/predictions", headers=headers)
    assert res.status_code == 200
    print("AI Risk Indicators count:", len(res.json()))

    # 7. Fetch Week-over-Week Context Analysis
    res = client.get("/api/v1/analytics/weekly-analysis", headers=headers)
    assert res.status_code == 200
    wow = res.json()
    print("Week-over-Week Metrics count:", len(wow["metrics"]))
    print("AI Context Explanation:", wow["ai_context_explanation"])

    # 8. Fetch Recommendations
    res = client.get("/api/v1/recommendations", headers=headers)
    assert res.status_code == 200
    print("Recommendations count:", len(res.json()))

    # 9. Fetch Nearby Healthcare
    res = client.get("/api/v1/healthcare/nearby", headers=headers)
    assert res.status_code == 200
    print("Nearby Facilities matched:", len(res.json()))

    # 10. Fetch Meal Timing Alert
    res = client.get("/api/v1/analytics/meal-alert", headers=headers)
    assert res.status_code == 200
    print("Meal Alert status:", res.json())

    print("\nALL BACKEND TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_flow()
