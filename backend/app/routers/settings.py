from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LanguageUpdateRequest
from app.utils.security import get_current_user

router = APIRouter(prefix="/settings", tags=["User Settings"])

SUPPORTED_LANGUAGES = ["en", "ta", "hi", "te", "ml", "kn"]

@router.put("/language")
def update_language(
    req: LanguageUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lang = req.language.lower().strip()
    if lang not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Language '{lang}' is not supported. Choose from {', '.join(SUPPORTED_LANGUAGES)}."
        )

    current_user.language = lang
    db.commit()
    return {
        "success": True,
        "language": current_user.language,
        "message": f"Preferred language updated to {lang}."
    }

@router.get("/language")
def get_language(current_user: User = Depends(get_current_user)):
    return {
        "language": current_user.language or "en",
        "supported_languages": SUPPORTED_LANGUAGES
    }
