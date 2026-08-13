from typing import List, Optional, Dict, Any
from datetime import datetime, date
import numpy as np
from app.models.meal import Meal
from app.schemas.analytics import MealTimingAlert
from app.services.feature_engineering import parse_time_to_minutes

# Multi-language localized prompts for smart meal timing reminders
MEAL_LOCALIZED_MESSAGES = {
    "breakfast": {
        "en": "It's around your usual breakfast time. Have you had your breakfast today?",
        "ta": "இது நீங்கள் வழக்கமாக காலை உணவு சாப்பிடும் நேரம். காலை உணவு சாப்பிட்டுவிட்டீர்களா?",
        "hi": "यह आपके आमतौर पर सुबह के नाश्ते का समय है। क्या आपने नाश्ता कर लिया है?",
        "te": "ఇది మీరు సాధారణంగా అల్పాహారం తీసుకునే సమయం. మీరు అల్పాహారం చేశారా?",
        "ml": "ഇത് നിങ്ങൾ സാധാരണയായി പ്രഭാതഭക്ഷണം കഴിക്കുന്ന സമയമാണ്. പ്രഭാതഭക്ഷണം കഴിച്ചോ?",
        "kn": "ಇದು ನಿಮ್ಮ ಸಾಮಾನ್ಯ ಉಪಹಾರದ ಸಮಯ. ನೀವು ಉಪಹಾರ ಮಾಡಿದ್ದೀರಾ?"
    },
    "lunch": {
        "en": "It's around your usual lunch time. Have you had lunch?",
        "ta": "இது நீங்கள் வழக்கமாக மதிய உணவு சாப்பிடும் நேரம். மதிய உணவு சாப்பிட்டுவிட்டீர்களா?",
        "hi": "यह आपके आमतौर पर दोपहर के भोजन का समय है। क्या आपने दोपहर का भोजन कर लिया है?",
        "te": "ఇది మీరు సాధారణంగా మధ్యాహ్న భోజనం చేసే సమయం. మీరు మధ్యాహ్న భోజనం చేశారా?",
        "ml": "ഇത് നിങ്ങൾ സാധാരണയായി ഉച്ചഭക്ഷണം കഴിക്കുന്ന സമയമാണ്. നിങ്ങൾ ഉച്ചഭക്ഷണം കഴിച്ചോ?",
        "kn": "ಇದು ನಿಮ್ಮ ಸಾಮಾನ್ಯ ಮಧ್ಯಾಹ್ನದ ಊಟದ ಸಮಯ. ನೀವು ಊಟ ಮಾಡಿದ್ದೀರಾ?"
    },
    "snack": {
        "en": "It's around your usual evening refreshment time. Have you had your snack or tea?",
        "ta": "இது நீங்கள் வழக்கமாக மாலை சிற்றுண்டி / தேநீர் அருந்தும் நேரம். சிற்றுண்டி சாப்பிட்டீர்களா?",
        "hi": "यह आपकी शाम के नाश्ते या चाय का सामान्य समय है। क्या आपने कुछ खाया?",
        "te": "ఇది మీరు సాధారణంగా సాయంత్రం స్నాక్స్ లేదా టీ తీసుకునే సమయం. మీరు తీసుకున్నారా?",
        "ml": "ഇത് നിങ്ങളുടെ പതിവ് വൈകുന്നേരത്തെ ചായ സമയം ആണ്. ചായ കുടിച്ചോ?",
        "kn": "ಇದು ನಿಮ್ಮ ಸಂಜೆಯ ತಿಂಡಿ ಅಥವಾ ಚಹಾ ಸಮಯ. ನೀವು ಸೇವಿಸಿದ್ದೀರಾ?"
    },
    "dinner": {
        "en": "It's around your usual dinner time. Have you had dinner?",
        "ta": "இது நீங்கள் வழக்கமாக இரவு உணவு சாப்பிடும் நேரம். இரவு உணவு சாப்பிட்டுவிட்டீர்களா?",
        "hi": "यह आपके आमतौर पर रात के भोजन का समय है। क्या आपने रात का खाना खा लिया?",
        "te": "ఇది మీరు సాధారణంగా రాత్రి భோజనం చేసే సమయం. రాత్రి భோజనం చేశారా?",
        "ml": "ഇത് നിങ്ങൾ സാധാരണയായി അത്താഴം കഴിക്കുന്ന സമയമാണ്. അത്താഴം കഴിച്ചോ?",
        "kn": "ಇದು ನಿಮ್ಮ ಸಾಮಾನ್ಯ ರಾತ್ರಿಯ ಊಟದ ಸಮಯ. ರಾತ್ರಿ ಊಟ ಮಾಡಿದ್ದೀರಾ?"
    }
}

class MealIntelligenceService:
    """
    Circadian meal timing learner and localized reminder dispatcher.
    """

    def analyze_meal_schedule(
        self,
        historical_meals: List[Meal],
        today_meals: List[Meal],
        language: str = "en"
    ) -> MealTimingAlert:
        lang = language if language in ["en", "ta", "hi", "te", "ml", "kn"] else "en"
        now = datetime.now()
        current_minutes = now.hour * 60 + now.minute

        # Default fallback standard windows (in minutes from midnight)
        meal_windows = {
            "breakfast": {"target": 510, "start": 450, "end": 630, "label": "08:30 AM"},  # 8:30 AM (7:30 - 10:30)
            "lunch": {"target": 795, "start": 720, "end": 900, "label": "01:15 PM"},      # 1:15 PM (12:00 - 3:00)
            "snack": {"target": 1020, "start": 960, "end": 1110, "label": "05:00 PM"},    # 5:00 PM (4:00 - 6:30)
            "dinner": {"target": 1245, "start": 1170, "end": 1380, "label": "08:45 PM"}   # 8:45 PM (7:30 - 11:00)
        }

        # If user has historical meals, learn their personalized mean time per meal type
        if historical_meals:
            for m_type in ["breakfast", "lunch", "snack", "dinner"]:
                times = [
                    parse_time_to_minutes(m.meal_time)
                    for m in historical_meals
                    if m.meal_type.lower() == m_type and parse_time_to_minutes(m.meal_time) is not None
                ]
                if len(times) >= 2:
                    avg_time = int(np.mean(times))
                    # Set window: from 30 mins before to 75 mins after their usual time
                    h = avg_time // 60
                    m_min = avg_time % 60
                    meridian = "AM" if h < 12 else "PM"
                    display_h = h if h <= 12 else h - 12
                    if display_h == 0: display_h = 12
                    label_str = f"{display_h:02d}:{m_min:02d} {meridian}"
                    
                    meal_windows[m_type] = {
                        "target": avg_time,
                        "start": avg_time - 30,
                        "end": avg_time + 75,
                        "label": label_str
                    }

        # Check logged meals for today
        logged_types = set(m.meal_type.lower() for m in today_meals)

        # Check in chronological order if any active window matches current time
        for m_type in ["breakfast", "lunch", "snack", "dinner"]:
            win = meal_windows[m_type]
            if win["start"] <= current_minutes <= win["end"]:
                if m_type not in logged_types:
                    msg = MEAL_LOCALIZED_MESSAGES.get(m_type, {}).get(lang, MEAL_LOCALIZED_MESSAGES[m_type]["en"])
                    return MealTimingAlert(
                        needs_alert=True,
                        meal_type=m_type,
                        usual_time=win["label"],
                        message=msg
                    )

        # Also provide intelligent prompt if they just passed breakfast or lunch and haven't logged
        if current_minutes > meal_windows["lunch"]["start"] and "lunch" not in logged_types and "breakfast" not in logged_types:
            msg = MEAL_LOCALIZED_MESSAGES["lunch"].get(lang, MEAL_LOCALIZED_MESSAGES["lunch"]["en"])
            return MealTimingAlert(
                needs_alert=True,
                meal_type="lunch",
                usual_time=meal_windows["lunch"]["label"],
                message=msg
            )

        return MealTimingAlert(needs_alert=False)

meal_intelligence_service = MealIntelligenceService()
