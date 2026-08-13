# AI-Driven Human Digital Twin for Predictive Life Modeling with Context-Aware Intelligent Analytics

An advanced, production-grade full-stack healthcare platform that transforms daily lifestyle and biometric data into an interactive **3D Human Digital Twin**, provides **AI-powered Multi-System Risk Estimations**, calculates **Physiological Organ Breakdown Scores**, synthesizes **Context-Aware Week-over-Week Comparative Analytics**, delivers **Circadian Smart Meal Timing Intelligence**, and guides proactive lifestyle actions and nearby specialist care.

---

## 🌟 Key Features

1. **Authentication First Architecture**:
   - Gated access with Email/Password, Social OAuth (Google / Apple), and Phone Number / OTP.
   - Dual flow: **First-Time User** (Auth → Landing Page → Language Selection → One-Time Profile Setup → Day 1 Health Data → Dashboard) vs **Returning User** (Auto-restores Profile, Digital Twin, Historical Data & Trends).

2. **Interactive 3D Holographic Human Digital Twin**:
   - Built with **Three.js** and **React Three Fiber**.
   - Full 3D rotation, zooming, pulsatile biological node shaders (Heart, Lungs, Brain, Digestive/Metabolic, Sleep, Fitness).
   - Clickable organ targets triggering smooth deep-dive organ analytics and AI risk indicators.

3. **Context-Aware Synergistic Analytics (Core Innovation)**:
   - Evaluates multi-dimensional shifts across Sleep Duration, Workout Frequency, Daily Steps, and Lifestyle Habits.
   - AI generates plain-language, cross-factor explanations (e.g. *“Your average sleep decreased by 48 mins while physical activity reduced and smoking increased, contributing to a 5-point drop in overall health score”*).

4. **Multi-System AI Risk Engine**:
   - Cardiovascular, Metabolic, Respiratory, and Lifestyle strain indicators.
   - Transparent feature weights and non-diagnostic educational justifications.
   - Prominent **Medical Disclaimers** across all predictive dashboards.

5. **Smart Meal Timing Intelligence**:
   - Learns user circadian eating rhythms.
   - Contextually alerts when meals are delayed or skipped in the user's selected language.

6. **6-Language Indian Localization**:
   - Full UI and AI translation in **English**, **Tamil (தமிழ்)**, **Hindi (हिन्दी)**, **Telugu (తెలుగు)**, **Malayalam (മലയാളം)**, and **Kannada (ಕನ್ನಡ)**.
   - Language preferences persisted in PostgreSQL/SQLite database.

7. **Personalized "Do This / Avoid This" Recommendations**:
   - Data-driven lifestyle advice prioritized into High, Medium, and Low actions.

8. **Nearby Healthcare & Specialist Finder**:
   - Geolocation/place-matched specialist routing (Cardiologists, Pulmonologists, Endocrinologists, General Physicians) and hospitals based on detected health strain indicators.

---

## 🏗️ System Architecture

```
d:/team/Digital twin/
├── backend/
│   ├── app/
│   │   ├── config.py             # Settings & database connection
│   │   ├── database.py           # SQLAlchemy engine & session factory
│   │   ├── models/               # Database ORM models (User, Profile, DailyHealthRecord, Meal, HealthScore, Prediction, Recommendation, Notification)
│   │   ├── schemas/              # Pydantic validation models
│   │   ├── routers/              # Modular REST API endpoints
│   │   ├── services/             # AI Risk Engine, Feature Engineering, Health Score Engine, Context Analytics, Meal Intelligence
│   │   └── utils/                # Direct bcrypt security & JWT handlers
│   ├── requirements.txt
│   ├── test_backend.py          # End-to-end backend test verification script
│   └── run.py                   # Uvicorn startup script
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # Typed fetch client and endpoint functions
│   │   ├── components/           # 3D Avatar, Modals, Daily Form, Layout, Navigation
│   │   ├── context/              # Auth, Language, and DigitalTwin context state
│   │   ├── locales/              # English, Tamil, Hindi, Telugu, Malayalam, Kannada JSONs
│   │   ├── pages/                # Landing, Dashboard, DailyLogging, Analytics, Recommendations, Healthcare, Profile, Settings
│   │   └── types/                # Complete TypeScript definitions
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js v18+ and npm

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
```
*Backend runs on `http://127.0.0.1:8000` (API Docs at `http://127.0.0.1:8000/docs`).*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🧪 Instant 14-Day Simulation Journey
To immediately test and demonstrate week-over-week comparative analytics, 3D anatomical heatmaps, and trend charts without waiting 14 real calendar days:
1. Log in or create an account.
2. Click **"Load 14-Day Simulation Journey"** in the Dashboard or Settings page.
3. Explore the live week-over-week comparison table, multi-metric time series, and 3D organ breakdown!
"# ai-drive-digital-human-twin" 
