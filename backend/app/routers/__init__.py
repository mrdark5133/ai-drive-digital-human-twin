from app.routers.auth import router as auth_router
from app.routers.profile import router as profile_router
from app.routers.daily_health import router as daily_health_router
from app.routers.meals import router as meals_router
from app.routers.digital_twin import router as digital_twin_router
from app.routers.analytics import router as analytics_router
from app.routers.recommendations import router as recommendations_router
from app.routers.healthcare import router as healthcare_router
from app.routers.settings import router as settings_router

__all__ = [
    "auth_router",
    "profile_router",
    "daily_health_router",
    "meals_router",
    "digital_twin_router",
    "analytics_router",
    "recommendations_router",
    "healthcare_router",
    "settings_router"
]
