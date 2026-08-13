from typing import List, Dict, Any, Optional
from app.schemas.analytics import HealthcareFacility, RiskIndicator
from app.models.profile import UserProfile

CITY_HEALTHCARE_DIRECTORY: Dict[str, List[Dict[str, Any]]] = {
    "chennai": [
        {"name": "Apollo Heart Centre", "type": "Super Specialty Hospital", "specialist": "Cardiologist", "address": "Greams Lane, Thousand Lights, Chennai", "dist": 2.3, "rating": 4.8, "phone": "+91 44 2829 0200"},
        {"name": "MGM Healthcare", "type": "Multi Specialty Hospital", "specialist": "Pulmonologist & Critical Care", "address": "Nelson Manickam Rd, Aminjikarai, Chennai", "dist": 4.1, "rating": 4.9, "phone": "+91 44 4524 2424"},
        {"name": "Dr. Mohan's Diabetes Specialities Centre", "type": "Metabolic & Endocrinology Clinic", "specialist": "Endocrinologist / Diabetologist", "address": "Gopalapuram, Chennai", "dist": 3.0, "rating": 4.7, "phone": "+91 44 4396 8888"},
        {"name": "Fortis Malar Hospital", "type": "Multi Specialty Hospital", "specialist": "General Physician & Internist", "address": "Adyar, Chennai", "dist": 5.2, "rating": 4.6, "phone": "+91 44 4289 2222"}
    ],
    "bangalore": [
        {"name": "Narayana Institute of Cardiac Sciences", "type": "Heart Hospital", "specialist": "Cardiologist", "address": "Bommasandra, Bangalore", "dist": 3.5, "rating": 4.9, "phone": "+91 80 7122 2222"},
        {"name": "Manipal Hospital", "type": "Super Specialty Hospital", "specialist": "Pulmonologist", "address": "HAL Old Airport Rd, Bangalore", "dist": 2.8, "rating": 4.8, "phone": "+91 80 2502 4444"},
        {"name": "Aster CMI Hospital", "type": "Multi Specialty Hospital", "specialist": "Endocrinologist & Nutritionist", "address": "Hebbal, Bangalore", "dist": 4.6, "rating": 4.7, "phone": "+91 80 4344 0400"}
    ],
    "coimbatore": [
        {"name": "KG Hospital & Heart Centre", "type": "Super Specialty Hospital", "specialist": "Cardiologist", "address": "Arts College Road, Coimbatore", "dist": 1.9, "rating": 4.7, "phone": "+91 422 221 2121"},
        {"name": "G. Kuppuswamy Naidu Memorial Hospital", "type": "Multi Specialty Hospital", "specialist": "Pulmonologist & Physician", "address": "P.N. Palayam, Coimbatore", "dist": 3.2, "rating": 4.8, "phone": "+91 422 224 5000"}
    ],
    "hyderabad": [
        {"name": "Care Hospitals Heart Institute", "type": "Heart Specialty", "specialist": "Cardiologist", "address": "Banjara Hills, Hyderabad", "dist": 2.4, "rating": 4.8, "phone": "+91 40 6165 6565"},
        {"name": "Yashoda Hospitals", "type": "Super Specialty Hospital", "specialist": "Pulmonologist & Internist", "address": "Somajiguda, Hyderabad", "dist": 3.7, "rating": 4.8, "phone": "+91 40 4567 4567"}
    ],
    "mumbai": [
        {"name": "Asian Heart Institute", "type": "Heart Hospital", "specialist": "Cardiologist", "address": "Bandra Kurla Complex, Mumbai", "dist": 3.1, "rating": 4.8, "phone": "+91 22 6698 6666"},
        {"name": "Kokilaben Dhirubhai Ambani Hospital", "type": "Multi Specialty Hospital", "specialist": "Pulmonologist & Endocrinologist", "address": "Andheri West, Mumbai", "dist": 4.5, "rating": 4.9, "phone": "+91 22 4269 6969"}
    ],
    "delhi": [
        {"name": "Max Super Speciality Hospital", "type": "Super Specialty Hospital", "specialist": "Cardiologist", "address": "Saket, New Delhi", "dist": 3.8, "rating": 4.8, "phone": "+91 11 2651 5050"},
        {"name": "Fortis Escorts Heart Institute", "type": "Heart Institute", "specialist": "Cardiologist & Pulmonologist", "address": "Okhla Road, New Delhi", "dist": 4.2, "rating": 4.9, "phone": "+91 11 4713 5000"}
    ]
}

DEFAULT_FACILITIES = [
    {"name": "City Heart & Vascular Medical Center", "type": "Super Specialty Hospital", "specialist": "Cardiologist", "address": "Central Medical Enclave, Main City Center", "dist": 2.4, "rating": 4.8, "phone": "+91 1800 200 4567"},
    {"name": "Pulmonary & Respiratory Care Clinic", "type": "Specialty Clinic", "specialist": "Pulmonologist", "address": "42 Health Park Avenue", "dist": 3.1, "rating": 4.7, "phone": "+91 1800 200 4568"},
    {"name": "Advanced Metabolic & Endocrine Center", "type": "Specialty Center", "specialist": "Endocrinologist", "address": "15 Wellness Boulevard", "dist": 4.0, "rating": 4.8, "phone": "+91 1800 200 4569"},
    {"name": "Metropolitan Multi-Specialty Hospital", "type": "General & Specialty Hospital", "specialist": "Internal Medicine / General Physician", "address": "88 Civic Health Way", "dist": 1.7, "rating": 4.9, "phone": "+91 1800 200 4570"}
]

class HealthcareLocatorService:
    """
    Matches detected health-risk indicators and user location to nearby clinical specialists.
    """

    def find_nearby_healthcare(
        self,
        profile: Optional[UserProfile],
        risks: List[RiskIndicator]
    ) -> List[HealthcareFacility]:
        city_key = (profile.place.lower().strip() if profile and profile.place else "chennai")
        
        # Match closest city dataset or use default
        matched_city = None
        for key in CITY_HEALTHCARE_DIRECTORY.keys():
            if key in city_key or city_key in key:
                matched_city = key
                break
        
        facilities_raw = CITY_HEALTHCARE_DIRECTORY.get(matched_city, DEFAULT_FACILITIES)

        # Identify which risk is highest
        highest_risk = "Cardiovascular"
        max_score = 0.0
        for r in risks:
            if r.score > max_score:
                max_score = r.score
                highest_risk = r.category

        results: List[HealthcareFacility] = []
        for idx, fac in enumerate(facilities_raw):
            specialist = fac["specialist"]
            reason = "Recommended for periodic general preventive health checkups."
            if "Cardio" in specialist and highest_risk == "Cardiovascular":
                reason = "Matched due to cardiovascular indicator screening recommendations."
            elif "Pulmon" in specialist and highest_risk == "Respiratory":
                reason = "Matched due to respiratory resilience and smoking risk reduction advice."
            elif "Endocrin" in specialist and highest_risk == "Metabolic":
                reason = "Matched for circadian metabolic review and dietary glycemic optimization."
            
            results.append(HealthcareFacility(
                id=f"fac_{idx+1}",
                name=fac["name"],
                facility_type=fac["type"],
                specialist_type=fac["specialist"],
                address=fac["address"],
                distance_km=fac["dist"],
                rating=fac["rating"],
                phone=fac["phone"],
                matching_reason=reason
            ))

        return results

healthcare_locator_service = HealthcareLocatorService()
