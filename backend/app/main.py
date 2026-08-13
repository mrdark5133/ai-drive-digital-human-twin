from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
import app.models  # Ensure all models are registered

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="AI-Driven Human Digital Twin for Predictive Life Modeling with Context-Aware Intelligent Analytics",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
from app.routers import (
    auth_router,
    profile_router,
    daily_health_router,
    meals_router,
    digital_twin_router,
    analytics_router,
    recommendations_router,
    healthcare_router,
    settings_router
)

api_prefix = settings.API_V1_STR

app.include_router(auth_router, prefix=api_prefix)
app.include_router(profile_router, prefix=api_prefix)
app.include_router(daily_health_router, prefix=api_prefix)
app.include_router(meals_router, prefix=api_prefix)
app.include_router(digital_twin_router, prefix=api_prefix)
app.include_router(analytics_router, prefix=api_prefix)
app.include_router(recommendations_router, prefix=api_prefix)
app.include_router(healthcare_router, prefix=api_prefix)
app.include_router(settings_router, prefix=api_prefix)

# Also mount on root aliases for direct API access
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(daily_health_router)
app.include_router(meals_router)
app.include_router(digital_twin_router)
app.include_router(analytics_router)
app.include_router(recommendations_router)
app.include_router(healthcare_router)
app.include_router(settings_router)

@app.get("/")
def root_info():
    return {
        "application": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "healthy",
        "purpose": "User Health Data -> Digital Twin -> AI Analysis -> Risk Prediction -> Context-Aware Comparison -> Health Trends -> Personalized Recommendations",
        "medical_disclaimer": "This is a predictive and educational health analytics platform, NOT a medical diagnosis system. Disease and risk predictions are estimates for preventive wellness."
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "digital_twin_api"}
