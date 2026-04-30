# 🏠 FairEstate AI

### **AI-Powered Real Estate Valuation & Deal Advisor**

> _"Know the fair value before you buy."_

[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)

---

## 📌 What is FairEstate AI?

**FairEstate AI** is not just another house-price prediction tool.  
It is an **AI-powered real estate deal advisor** that answers one critical question:

> **"Is this property worth the asking price?"**

Most projects only predict price. FairEstate AI goes further — it **predicts the price, evaluates the deal, and advises the buyer.**

### What it does:

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🔮 **AI Price Prediction** | Predicts the fair unit price using a trained Random Forest model |
| 2 | 📊 **Fair Value Range** | Generates a ±5% fair price range around the predicted value |
| 3 | 🏷️ **Deal Classification** | Labels the deal as **Underpriced**, **Fairly Priced**, or **Overpriced** |
| 4 | 💯 **Deal Score (0–100)** | Composite score factoring price, location, age, and convenience |
| 5 | 💰 **Negotiation Gap** | Shows how much the buyer is overpaying (if overpriced) |
| 6 | 🧠 **AI Explanation** | Top factors driving the prediction (feature importance) |
| 7 | 🏘️ **Similar Properties** | 5 most similar properties from the dataset for comparison |
| 8 | 🗺️ **Location Intelligence** | Human-readable insight on transport access & neighborhood quality |
| 9 | 🤝 **Negotiation Advice** | Buyer-focused advice on what price to counter-offer |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)               │
│  Landing Page → Property Form → Results Dashboard       │
│  Tailwind CSS · Framer Motion · Recharts                │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP (axios)
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Valuation   │  │  Fairness    │  │   Location    │  │
│  │    Agent     │  │    Agent     │  │    Agent      │  │
│  │ (ML predict) │  │ (deal class) │  │ (geo insight) │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                   │          │
│  ┌──────┴───────┐  ┌──────┴───────┐           │          │
│  │ Comparable   │  │ Negotiation  │           │          │
│  │   Agent      │  │    Agent     │           │          │
│  │ (neighbors)  │  │ (deal score) │           │          │
│  └──────────────┘  └──────────────┘           │          │
│                                                          │
│  Model: Random Forest (R² = 0.82, RMSE = 5.55)         │
│  Trained on 414 real estate transactions                 │
└─────────────────────────────────────────────────────────┘
```

### 5 AI Agents

| Agent | Responsibility |
|-------|---------------|
| **Valuation Agent** | Applies feature engineering, scales input, runs ML prediction |
| **Fairness Agent** | Computes ±5% fair range, classifies deal status, calculates gap |
| **Location Intelligence Agent** | Analyzes MRT distance + convenience stores → human-readable insight |
| **Comparable Property Agent** | Finds 5 nearest neighbors using scaled Euclidean distance |
| **Negotiation Agent** | Computes deal score (0–100), generates buyer advice |

---

## 📂 Project Structure

```
FairEstate-AI/
├── backend/
│   ├── main.py                          # FastAPI server + 5 AI Agents
│   ├── train_model.py                   # ML training pipeline
│   ├── requirements.txt                 # Python dependencies
│   ├── model.pkl                        # Trained Random Forest model
│   ├── scaler.pkl                       # StandardScaler
│   ├── feature_names.pkl                # Feature name list
│   ├── model_comparison.pkl             # All model metrics
│   ├── dataset.pkl                      # Processed dataset (for similarity)
│   ├── Real estate valuation data set.xlsx  # Source dataset
│   └── venv/                            # Python virtual environment
│
├── frontend/
│   ├── package.json                     # NPM dependencies
│   ├── vite.config.js                   # Vite configuration
│   ├── tailwind.config.js               # Tailwind CSS theme
│   ├── index.html                       # Entry HTML
│   └── src/
│       ├── main.jsx                     # React entry point
│       ├── App.jsx                      # Main app + routing
│       ├── index.css                    # Global styles + design system
│       ├── api/
│       │   └── api.js                   # Axios API client
│       └── components/
│           ├── Navbar.jsx               # Sticky glassmorphism nav
│           ├── LandingPage.jsx          # Hero + features + CTA
│           ├── PropertyForm.jsx         # 7-field input form
│           ├── ResultCards.jsx          # Price, range, score cards
│           ├── DealVerdict.jsx          # AI verdict + explanation
│           ├── SimilarProperties.jsx    # Comparable properties table
│           └── Charts.jsx              # Recharts visualizations
│
└── README.md                            # This file
```

---

## 🚀 How to Run (Local Setup)

### Prerequisites

- **Python 3.10+** (tested on 3.12)
- **Node.js 18+** (tested on 20.x)
- **npm 9+**

### Step 1: Clone the repository

```bash
git clone https://github.com/Aman-techy/Fairestate_Ai.git
cd Fairestate_Ai
```

### Step 2: Set up the Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Train the ML model (generates .pkl files)
python train_model.py

# Start the API server
python main.py
```

The API server will start at **http://localhost:8000**.  
You can verify it at: http://localhost:8000/health

### Step 3: Set up the Frontend

Open a **new terminal**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The frontend will start at **http://localhost:5173**.

### Step 4: Use the App

1. Open **http://localhost:5173** in your browser.
2. Click **"Analyze a Property"** on the landing page.
3. Fill in the form (or click **"Fill Sample"** for demo data).
4. Click **"Analyze Property"** to run the AI analysis.
5. View the full results dashboard with predictions, deal verdict, similar properties, and charts.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check — API status |
| `POST` | `/predict` | Full property analysis (all 5 agents) |
| `GET` | `/metrics` | Model comparison metrics (MAE, RMSE, R²) |
| `GET` | `/feature-importance` | Feature importance values |

### Example `/predict` Request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_date": 2013.25,
    "house_age": 12.5,
    "distance_to_mrt": 500,
    "convenience_stores": 5,
    "latitude": 24.98,
    "longitude": 121.54,
    "asking_price": 50
  }'
```

### Example Response

```json
{
  "predicted_price": 40.09,
  "fair_range": { "lower": 38.09, "upper": 42.09 },
  "status": "Overpriced",
  "deal_score": 50,
  "negotiation_gap": 9.91,
  "price_difference_percent": 24.72,
  "top_factors": ["Transport Accessibility", "Distance to Nearest MRT Station", "House Age"],
  "location_insight": "The property has very good transport access and good nearby convenience.",
  "suggestion": "The asking price is 24.7% higher than the AI-estimated fair value...",
  "similar_properties": [{ "house_age": 11.6, "distance_to_mrt": 390.6, "actual_price": 39.4 }]
}
```

---

## 📊 Dataset

**Source:** Real Estate Valuation dataset (414 records, 0 missing values)

| Column | Description | Range |
|--------|-------------|-------|
| Transaction date | Decimal year (e.g., 2013.25) | 2012.67 – 2013.58 |
| House age | Age of property in years | 0 – 43.8 |
| Distance to MRT | Distance to nearest MRT station (meters) | 23 – 6,488 |
| Convenience stores | Number of nearby stores | 0 – 10 |
| Latitude | Geographic latitude | 24.93 – 25.01 |
| Longitude | Geographic longitude | 121.47 – 121.57 |
| **Price per unit area** | Target variable | 7.6 – 117.5 |

### Feature Engineering (6 derived features)

| Feature | Logic |
|---------|-------|
| House Age Category | New (≤10) / Medium (10–25) / Old (>25) |
| MRT Distance Category | Very Near (≤500m) / Near / Far / Very Far (>3000m) |
| Convenience Score | `stores / 10` (normalized 0–1) |
| Transport Accessibility | `1 / (1 + distance/1000)` |
| Urban Convenience Score | `convenience × transport_accessibility` |
| Location Cluster | `latitude × longitude` (geographic interaction) |

---

## 🤖 ML Model Comparison

| Model | MAE | RMSE | R² |
|-------|-----|------|-----|
| Linear Regression | 4.30 | 6.37 | 0.758 |
| **Random Forest** ✅ | **3.75** | **5.55** | **0.817** |
| Gradient Boosting | 4.22 | 6.30 | 0.764 |
| XGBoost | 4.50 | 6.28 | 0.765 |

**Best Model:** Random Forest (lowest RMSE, highest R²)

---

## 🎯 Deal Score Logic

The deal score (0–100) is a composite metric:

```
Base score = 80

Price Factor:
  Underpriced by >10%  → +15 points
  Underpriced by 5-10% → +10 points
  Overpriced by 5-10%  → -15 points
  Overpriced by >20%   → -35 points

Location Factor:
  MRT ≤ 500m   → +5 points
  MRT > 3000m  → -5 points

Age Factor:
  Age ≤ 10 yrs → +3 points
  Age > 30 yrs → -5 points

Convenience Factor:
  7+ stores  → +3 points
  0-1 stores → -3 points

Final score clamped to [0, 100]
```

---

## 🌐 Hosting / Deployment Options

Yes — FairEstate AI can be hosted! Here are your options:

### Option 1: **Render** (Recommended — Free tier available)

| Component | Service | How |
|-----------|---------|-----|
| Backend | Render Web Service | Deploy `backend/` as a Python web service with `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Frontend | Render Static Site | Run `npm run build` → deploy `frontend/dist/` as static site |

**Steps:**
1. Push code to GitHub.
2. Create a **Web Service** on [render.com](https://render.com) for the backend:
   - Root: `backend/`
   - Build: `pip install -r requirements.txt && python train_model.py`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Create a **Static Site** for the frontend:
   - Root: `frontend/`
   - Build: `npm install && npm run build`
   - Publish: `dist`
4. Update `frontend/src/api/api.js` with your Render backend URL.

### Option 2: **Railway** (Free tier available)

Similar to Render — deploy backend and frontend as separate services.

### Option 3: **Vercel (frontend) + Railway (backend)**

| Component | Platform |
|-----------|----------|
| Frontend | Vercel (free, optimized for React) |
| Backend | Railway or Render |

**Frontend on Vercel:**
```bash
cd frontend
npx vercel --prod
```

### Option 4: **Docker** (for self-hosting / VPS)

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

### ⚠️ Important for deployment

When deploying, update the API base URL in `frontend/src/api/api.js`:

```javascript
// Change from localhost:
const API_BASE = 'http://localhost:8000';

// To your deployed backend URL:
const API_BASE = 'https://your-backend-url.onrender.com';
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS 3, Framer Motion, Recharts, Lucide Icons, Axios |
| **Backend** | Python 3.12, FastAPI, Uvicorn |
| **ML** | Scikit-learn, XGBoost, Pandas, NumPy, Joblib |
| **Design** | Glassmorphism, Dark Navy theme, Inter font, Responsive |

---

## 📝 Algorithm Flow

```
User Input (7 fields)
       │
       ▼
┌─────────────────────┐
│  Feature Engineering │ ← 6 derived features created
│  (12 total features) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   StandardScaler    │ ← Normalize to zero mean, unit variance
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Random Forest      │ ← 200 trees, max_depth=15
│  Prediction         │
└──────────┬──────────┘
           │
           ▼
   predicted_price
           │
     ┌─────┼──────────────────┐
     │     │                  │
     ▼     ▼                  ▼
  Fair   Deal             Similar
  Range  Classification   Properties
  (±5%)  (Under/Fair/Over) (KNN)
     │     │                  │
     └─────┼──────────────────┘
           │
           ▼
     Deal Score (0-100)
     + Negotiation Advice
           │
           ▼
     Results Dashboard
```

---

## 🎤 Pitch Script

> **"Imagine you're buying a property. The seller says it's worth 50 per unit area. But is it really? How do you know you're not overpaying?"**
>
> **FairEstate AI** solves this. It's not just a price predictor — it's your **AI deal advisor**.
>
> You enter the property details — age, MRT distance, convenience stores, location. Our **5 AI agents** go to work:
>
> - The **Valuation Agent** predicts the fair price.
> - The **Fairness Agent** tells you if it's overpriced.
> - The **Location Agent** analyzes the neighborhood.
> - The **Comparable Agent** finds similar properties.
> - The **Negotiation Agent** tells you how much to negotiate.
>
> The result? A **deal score out of 100**, a **fair price range**, and **actionable buyer advice** — all in seconds.
>
> **FairEstate AI — Know the fair value before you buy.**

---

## 📑 PPT Content Outline

| Slide | Content |
|-------|---------|
| 1 | **Title** — FairEstate AI: Know the Fair Value Before You Buy |
| 2 | **Problem** — Buyers have no way to know if asking price is fair |
| 3 | **Solution** — AI-powered deal advisor, not just price predictor |
| 4 | **USP** — 5 AI agents: Valuation, Fairness, Location, Comparable, Negotiation |
| 5 | **Architecture** — React + FastAPI + Scikit-learn full-stack |
| 6 | **Feature Engineering** — 6 derived features from raw dataset |
| 7 | **Model Comparison** — 4 models trained, Random Forest selected (R²=0.82) |
| 8 | **Demo** — Live walkthrough: form → results → verdict → charts |
| 9 | **Results** — Deal score, fair range, similar properties, negotiation advice |
| 10 | **Future Scope** — Map view, real-time listings, mortgage calculator, mobile app |
| 11 | **Thank You** — Team, tech stack, GitHub link |

---

## 🔮 Future Scope

- 🗺️ Interactive map with property markers
- 📱 Mobile-responsive PWA
- 🏦 Mortgage affordability calculator
- 📈 Real-time market trend charts
- 🔗 Integration with live property listing APIs
- 🤖 LLM-powered natural language property Q&A

---

## 👨‍💻 Team

Built by **Aman** for a hackathon project.

---

_FairEstate AI — Making real estate decisions smarter, one prediction at a time._ 🏠✨
