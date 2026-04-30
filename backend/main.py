"""
=============================================================================
FairEstate AI — FastAPI Backend Server
=============================================================================
AI-powered real estate valuation and deal advisor.

This server exposes the prediction pipeline through a REST API.
The logic is structured around 5 intelligent "agents," each responsible 
for a specific aspect of the property analysis.

Agents:
  1. Valuation Agent     — Predicts fair unit price using the ML model
  2. Fairness Agent      — Classifies the deal as Underpriced / Fair / Overpriced
  3. Location Agent      — Generates human-readable location insights
  4. Comparable Agent    — Finds similar properties from the dataset
  5. Negotiation Agent   — Calculates deal score and gives buyer advice

Endpoints:
  POST /predict           — Full property analysis
  GET  /metrics           — Model comparison metrics
  GET  /feature-importance — Feature importance values
  GET  /health            — Health check
=============================================================================
"""

import os
import numpy as np
import pandas as pd
import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from sklearn.preprocessing import StandardScaler

# ── Initialize App ──────────────────────────────────────────────────────────
app = FastAPI(
    title="FairEstate AI",
    description="AI-powered real estate valuation and deal advisor",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Artifacts ──────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    model = joblib.load(os.path.join(BASE_DIR, "model.pkl"))
    scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))
    feature_names = joblib.load(os.path.join(BASE_DIR, "feature_names.pkl"))
    model_comparison = joblib.load(os.path.join(BASE_DIR, "model_comparison.pkl"))
    dataset = joblib.load(os.path.join(BASE_DIR, "dataset.pkl"))
    print("✅ All artifacts loaded successfully")
except Exception as e:
    print(f"❌ Error loading artifacts: {e}")
    print("   Run train_model.py first to generate model artifacts.")
    raise

# ── Request / Response Schemas ──────────────────────────────────────────────

class PropertyInput(BaseModel):
    """Input schema for property analysis request."""
    transaction_date: float = Field(..., description="Transaction date as decimal year (e.g., 2013.25)")
    house_age: float = Field(..., ge=0, description="Age of the house in years")
    distance_to_mrt: float = Field(..., ge=0, description="Distance to nearest MRT station in meters")
    convenience_stores: int = Field(..., ge=0, le=20, description="Number of convenience stores nearby")
    latitude: float = Field(..., description="Geographic latitude")
    longitude: float = Field(..., description="Geographic longitude")
    asking_price: float = Field(..., gt=0, description="Asking price per unit area")


class SimilarProperty(BaseModel):
    """Schema for a similar property in the response."""
    house_age: float
    distance_to_mrt: float
    convenience_stores: int
    latitude: float
    longitude: float
    actual_price: float


class PredictionResponse(BaseModel):
    """Full prediction response with all agent outputs."""
    predicted_price: float
    fair_range: dict
    status: str
    deal_score: int
    negotiation_gap: float
    price_difference_percent: float
    top_factors: List[str]
    feature_importance: dict
    location_insight: str
    suggestion: str
    similar_properties: List[SimilarProperty]
    agent_explanations: dict


# =============================================================================
# AGENT 1: Valuation Agent
# =============================================================================
# Responsible for: Feature engineering + ML model prediction
# Takes raw property features, engineers derived features, scales them,
# and returns the predicted fair unit price.
# =============================================================================

class ValuationAgent:
    """Predicts fair unit price using the trained ML model."""

    def __init__(self, model, scaler, feature_names):
        self.model = model
        self.scaler = scaler
        self.feature_names = feature_names

    def engineer_features(self, data: PropertyInput) -> dict:
        """
        Create engineered features from raw input.
        Must match the features used during training exactly.
        """
        features = {}

        # Raw features
        features["transaction_date"] = data.transaction_date
        features["house_age"] = data.house_age
        features["distance_to_mrt"] = data.distance_to_mrt
        features["convenience_stores"] = data.convenience_stores
        features["latitude"] = data.latitude
        features["longitude"] = data.longitude

        # ---- Engineered Feature 1: House Age Category ----
        # New (≤10) = 0, Medium (10-25) = 1, Old (>25) = 2
        if data.house_age <= 10:
            features["house_age_category"] = 0
        elif data.house_age <= 25:
            features["house_age_category"] = 1
        else:
            features["house_age_category"] = 2

        # ---- Engineered Feature 2: MRT Distance Category ----
        # Very Near (≤500) = 0, Near (≤1000) = 1, Far (≤3000) = 2, Very Far (>3000) = 3
        if data.distance_to_mrt <= 500:
            features["mrt_distance_category"] = 0
        elif data.distance_to_mrt <= 1000:
            features["mrt_distance_category"] = 1
        elif data.distance_to_mrt <= 3000:
            features["mrt_distance_category"] = 2
        else:
            features["mrt_distance_category"] = 3

        # ---- Engineered Feature 3: Convenience Score ----
        # Normalized to 0–1 range (stores / 10)
        features["convenience_score"] = data.convenience_stores / 10.0

        # ---- Engineered Feature 4: Transport Accessibility ----
        # Inverse distance: closer MRT = higher score
        features["transport_accessibility"] = 1.0 / (1.0 + data.distance_to_mrt / 1000.0)

        # ---- Engineered Feature 5: Urban Convenience Score ----
        # Combines transport + convenience signals
        features["urban_convenience_score"] = (
            features["convenience_score"] * features["transport_accessibility"]
        )

        # ---- Engineered Feature 6: Location Cluster ----
        # Lat × Lon interaction for geographic signal
        features["location_cluster"] = data.latitude * data.longitude

        return features

    def predict(self, data: PropertyInput) -> float:
        """Run the full prediction pipeline: engineer → scale → predict."""
        features = self.engineer_features(data)

        # Build feature array in the exact order used during training
        feature_array = np.array([[features[name] for name in self.feature_names]])

        # Scale features using the same scaler from training
        scaled_features = self.scaler.transform(feature_array)

        # Get model prediction
        predicted_price = float(self.model.predict(scaled_features)[0])

        # Ensure prediction is positive (price can't be negative)
        return max(predicted_price, 1.0)


# =============================================================================
# AGENT 2: Fairness Agent
# =============================================================================
# Responsible for: Comparing asking price with predicted fair value
# Generates the fair price range (±5%) and classifies the deal as
# Underpriced, Fairly Priced, or Overpriced.
# =============================================================================

class FairnessAgent:
    """Compares asking price with fair value and classifies the deal."""

    def analyze(self, predicted_price: float, asking_price: float) -> dict:
        """
        Compare asking price against the fair price range.
        
        Fair range = predicted_price ± 5%
        - Below range → Underpriced (potential good deal)
        - Within range → Fairly Priced
        - Above range → Overpriced (buyer should negotiate)
        """
        # Calculate fair price range (±5% of predicted)
        fair_lower = round(predicted_price * 0.95, 2)
        fair_upper = round(predicted_price * 1.05, 2)

        # Calculate price difference
        price_diff = asking_price - predicted_price
        price_diff_percent = round((price_diff / predicted_price) * 100, 2)

        # Classify the deal
        if asking_price > fair_upper:
            status = "Overpriced"
            negotiation_gap = round(asking_price - predicted_price, 2)
        elif asking_price < fair_lower:
            status = "Underpriced"
            negotiation_gap = 0.0
        else:
            status = "Fairly Priced"
            negotiation_gap = 0.0

        return {
            "fair_range": {"lower": fair_lower, "upper": fair_upper},
            "status": status,
            "negotiation_gap": negotiation_gap,
            "price_difference_percent": price_diff_percent,
        }


# =============================================================================
# AGENT 3: Location Intelligence Agent
# =============================================================================
# Responsible for: Analyzing location-based features and generating
# human-readable insights about the property's location quality.
# =============================================================================

class LocationIntelligenceAgent:
    """Generates location insights from MRT distance and convenience data."""

    def analyze(self, data: PropertyInput) -> str:
        """
        Generate a human-readable location insight based on:
        - Distance to nearest MRT station
        - Number of convenience stores
        - Geographic coordinates
        """
        insights = []

        # ---- Transport Access Analysis ----
        if data.distance_to_mrt <= 300:
            transport = "excellent transport access (within walking distance to MRT)"
        elif data.distance_to_mrt <= 500:
            transport = "very good transport access (close to MRT station)"
        elif data.distance_to_mrt <= 1000:
            transport = "good transport access (moderate distance to MRT)"
        elif data.distance_to_mrt <= 3000:
            transport = "limited transport access (far from MRT station)"
        else:
            transport = "poor transport access (very far from MRT station)"
        insights.append(transport)

        # ---- Convenience Analysis ----
        if data.convenience_stores >= 8:
            convenience = "exceptional nearby convenience (many stores within reach)"
        elif data.convenience_stores >= 5:
            convenience = "good nearby convenience"
        elif data.convenience_stores >= 2:
            convenience = "moderate nearby convenience"
        else:
            convenience = "limited nearby convenience (few stores)"
        insights.append(convenience)

        # ---- House Age Analysis ----
        if data.house_age <= 5:
            age_text = "The property is relatively new"
        elif data.house_age <= 15:
            age_text = "The property is in good condition age-wise"
        elif data.house_age <= 25:
            age_text = "The property is moderately aged"
        else:
            age_text = "The property is relatively old and may need renovation"
        insights.append(age_text)

        return f"The property has {insights[0]} and {insights[1]}. {insights[2]}."


# =============================================================================
# AGENT 4: Comparable Property Agent
# =============================================================================
# Responsible for: Finding similar properties from the historical dataset
# Uses Euclidean distance on scaled features (house age, MRT distance,
# convenience stores, latitude, longitude) to find nearest neighbors.
# =============================================================================

class ComparablePropertyAgent:
    """Finds similar properties using feature-based distance."""

    def __init__(self, dataset: pd.DataFrame):
        self.dataset = dataset
        # Features used for similarity comparison
        self.comparison_features = [
            "house_age",
            "distance_to_mrt",
            "convenience_stores",
            "latitude",
            "longitude",
        ]
        # Pre-compute scaled features for fast lookup
        self.comparison_scaler = StandardScaler()
        self.scaled_data = self.comparison_scaler.fit_transform(
            self.dataset[self.comparison_features].values
        )

    def find_similar(self, data: PropertyInput, n: int = 5) -> List[dict]:
        """
        Find the n most similar properties using Euclidean distance.
        
        Process:
        1. Extract comparison features from input
        2. Scale using the same scaler fitted on the dataset
        3. Compute Euclidean distance to all properties
        4. Return the n nearest neighbors
        """
        # Build query vector
        query = np.array([[
            data.house_age,
            data.distance_to_mrt,
            data.convenience_stores,
            data.latitude,
            data.longitude,
        ]])

        # Scale query using the dataset scaler
        query_scaled = self.comparison_scaler.transform(query)

        # Compute Euclidean distance to all properties
        distances = np.sqrt(np.sum((self.scaled_data - query_scaled) ** 2, axis=1))

        # Get indices of n nearest neighbors
        nearest_indices = np.argsort(distances)[:n]

        # Build result list
        similar = []
        for idx in nearest_indices:
            row = self.dataset.iloc[idx]
            similar.append({
                "house_age": round(float(row["house_age"]), 1),
                "distance_to_mrt": round(float(row["distance_to_mrt"]), 1),
                "convenience_stores": int(row["convenience_stores"]),
                "latitude": round(float(row["latitude"]), 5),
                "longitude": round(float(row["longitude"]), 5),
                "actual_price": round(float(row["price_per_unit_area"]), 1),
            })

        return similar


# =============================================================================
# AGENT 5: Negotiation Agent
# =============================================================================
# Responsible for: Calculating deal score and generating buyer advice.
# The deal score (0–100) reflects how good the deal is for the buyer.
# =============================================================================

class NegotiationAgent:
    """Calculates deal score and generates negotiation advice."""

    def analyze(
        self,
        data: PropertyInput,
        predicted_price: float,
        asking_price: float,
        status: str,
        price_diff_percent: float,
    ) -> dict:
        """
        Calculate deal score and generate advice.
        
        Deal Score Logic:
        - Start from a base of 80
        - Subtract points for overpricing (higher overprice = lower score)
        - Subtract points for high MRT distance
        - Subtract points for very old houses  
        - Add points for underpricing (good deal)
        - Add points for good convenience
        - Clamp between 0 and 100
        """
        score = 80.0  # Base score

        # ---- Price Factor (most important) ----
        # Underpriced → bonus, Overpriced → penalty
        if price_diff_percent <= -10:
            score += 15  # Significantly underpriced = great deal
        elif price_diff_percent <= -5:
            score += 10  # Moderately underpriced
        elif price_diff_percent <= 0:
            score += 5   # Slightly underpriced
        elif price_diff_percent <= 5:
            score -= 5   # Slightly overpriced
        elif price_diff_percent <= 10:
            score -= 15  # Moderately overpriced
        elif price_diff_percent <= 20:
            score -= 25  # Significantly overpriced
        else:
            score -= 35  # Extremely overpriced

        # ---- MRT Distance Factor ----
        if data.distance_to_mrt <= 500:
            score += 5   # Great transit access
        elif data.distance_to_mrt <= 1000:
            score += 2
        elif data.distance_to_mrt > 3000:
            score -= 5   # Poor transit access

        # ---- House Age Factor ----
        if data.house_age <= 10:
            score += 3   # Newer house
        elif data.house_age > 30:
            score -= 5   # Very old house

        # ---- Convenience Factor ----
        if data.convenience_stores >= 7:
            score += 3   # Many stores nearby
        elif data.convenience_stores <= 1:
            score -= 3   # Few stores nearby

        # Clamp to 0–100 range
        score = max(0, min(100, int(round(score))))

        # ---- Generate Advice ----
        if status == "Underpriced":
            if price_diff_percent <= -10:
                suggestion = (
                    f"This property appears significantly underpriced at {abs(price_diff_percent):.1f}% "
                    f"below the AI-estimated fair value. This could be an excellent deal, but verify "
                    f"property condition and documentation carefully before purchasing."
                )
            else:
                suggestion = (
                    f"The asking price is {abs(price_diff_percent):.1f}% below the AI-estimated fair value. "
                    f"This may be a good deal, but verify documents and property condition."
                )
        elif status == "Overpriced":
            negotiate_to = round(predicted_price * 1.02, 1)  # Suggest 2% above fair value
            suggestion = (
                f"The asking price is {price_diff_percent:.1f}% higher than the AI-estimated fair value. "
                f"Based on the property age, MRT distance, and nearby convenience score, "
                f"the buyer should negotiate. Consider offering around {negotiate_to:.1f} per unit area "
                f"(closer to the AI fair value of {predicted_price:.1f})."
            )
        else:
            suggestion = (
                f"The property is within the expected fair market range "
                f"({abs(price_diff_percent):.1f}% from AI estimate). "
                f"The asking price appears reasonable based on comparable properties and location factors."
            )

        return {
            "deal_score": score,
            "suggestion": suggestion,
        }


# ── Initialize Agents ──────────────────────────────────────────────────────
valuation_agent = ValuationAgent(model, scaler, feature_names)
fairness_agent = FairnessAgent()
location_agent = LocationIntelligenceAgent()
comparable_agent = ComparablePropertyAgent(dataset)
negotiation_agent = NegotiationAgent()

print("🤖 All 5 agents initialized")


# ── Helper: Get Top Factors ─────────────────────────────────────────────────

# Human-readable names for features
FEATURE_DISPLAY_NAMES = {
    "transaction_date": "Transaction Date",
    "house_age": "House Age",
    "distance_to_mrt": "Distance to Nearest MRT Station",
    "convenience_stores": "Number of Convenience Stores",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "house_age_category": "House Age Category",
    "mrt_distance_category": "MRT Distance Category",
    "convenience_score": "Convenience Score",
    "transport_accessibility": "Transport Accessibility",
    "urban_convenience_score": "Urban Convenience Score",
    "location_cluster": "Location Cluster",
}


def get_top_factors(n: int = 5) -> List[str]:
    """Get the top n most important features by importance score."""
    importance = model_comparison.get("feature_importance", {})
    sorted_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)
    return [FEATURE_DISPLAY_NAMES.get(f, f) for f, _ in sorted_features[:n]]


# ── API Endpoints ───────────────────────────────────────────────────────────

@app.get("/health")
async def health_check():
    """Health check endpoint — verifies the API is running and artifacts loaded."""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "dataset_size": len(dataset),
        "best_model": model_comparison.get("best_model", "Unknown"),
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict_property(data: PropertyInput):
    """
    Full property analysis endpoint.
    
    Runs all 5 agents sequentially:
    1. Valuation Agent → predicted price
    2. Fairness Agent → deal classification
    3. Location Agent → location insights
    4. Comparable Agent → similar properties
    5. Negotiation Agent → deal score + advice
    """
    try:
        # ── Agent 1: Valuation ──
        predicted_price = valuation_agent.predict(data)
        predicted_price = round(predicted_price, 2)

        # ── Agent 2: Fairness ──
        fairness = fairness_agent.analyze(predicted_price, data.asking_price)

        # ── Agent 3: Location Intelligence ──
        location_insight = location_agent.analyze(data)

        # ── Agent 4: Comparable Properties ──
        similar_raw = comparable_agent.find_similar(data, n=5)
        similar_properties = [SimilarProperty(**prop) for prop in similar_raw]

        # ── Agent 5: Negotiation ──
        negotiation = negotiation_agent.analyze(
            data=data,
            predicted_price=predicted_price,
            asking_price=data.asking_price,
            status=fairness["status"],
            price_diff_percent=fairness["price_difference_percent"],
        )

        # ── Compile Response ──
        return PredictionResponse(
            predicted_price=predicted_price,
            fair_range=fairness["fair_range"],
            status=fairness["status"],
            deal_score=negotiation["deal_score"],
            negotiation_gap=fairness["negotiation_gap"],
            price_difference_percent=fairness["price_difference_percent"],
            top_factors=get_top_factors(5),
            feature_importance=model_comparison.get("feature_importance", {}),
            location_insight=location_insight,
            suggestion=negotiation["suggestion"],
            similar_properties=similar_properties,
            agent_explanations={
                "valuation_agent": f"Predicted fair unit price: {predicted_price:.2f}",
                "fairness_agent": f"Deal status: {fairness['status']} ({fairness['price_difference_percent']:+.1f}%)",
                "location_agent": location_insight,
                "comparable_agent": f"Found {len(similar_properties)} similar properties",
                "negotiation_agent": f"Deal score: {negotiation['deal_score']}/100",
            },
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/metrics")
async def get_metrics():
    """
    Returns model comparison metrics.
    
    Includes:
    - Best model name
    - Per-model MAE, RMSE, R² scores
    - Actual vs Predicted values for chart plotting
    """
    # Build comparison table (exclude non-model keys)
    exclude_keys = {"best_model", "feature_importance", "actual_vs_predicted"}
    comparison_table = {
        name: metrics
        for name, metrics in model_comparison.items()
        if name not in exclude_keys
    }

    best_name = model_comparison.get("best_model", "Unknown")
    best_metrics = model_comparison.get(best_name, {})

    return {
        "best_model": best_name,
        "best_mae": best_metrics.get("mae", 0),
        "best_rmse": best_metrics.get("rmse", 0),
        "best_r2": best_metrics.get("r2", 0),
        "model_comparison": comparison_table,
        "actual_vs_predicted": model_comparison.get("actual_vs_predicted", {}),
    }


@app.get("/feature-importance")
async def get_feature_importance():
    """Returns feature importance values from the best model."""
    raw_importance = model_comparison.get("feature_importance", {})

    # Sort by importance (descending)
    sorted_importance = dict(
        sorted(raw_importance.items(), key=lambda x: x[1], reverse=True)
    )

    # Add human-readable names
    display_importance = [
        {
            "feature": key,
            "display_name": FEATURE_DISPLAY_NAMES.get(key, key),
            "importance": value,
        }
        for key, value in sorted_importance.items()
    ]

    return {
        "best_model": model_comparison.get("best_model", "Unknown"),
        "feature_importance": display_importance,
    }


# ── Run Server ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("\n🚀 Starting FairEstate AI server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
