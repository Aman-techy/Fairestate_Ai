"""
=============================================================================
FairEstate AI — Model Training Pipeline
=============================================================================
This script trains and evaluates multiple ML models on the Real Estate 
Valuation dataset, selects the best model, and saves all artifacts needed 
for the prediction API.

Models Trained:
  1. Linear Regression
  2. Random Forest Regressor
  3. Gradient Boosting Regressor
  4. XGBoost Regressor

Evaluation Metrics:
  - MAE  (Mean Absolute Error)
  - RMSE (Root Mean Squared Error)
  - R²   (Coefficient of Determination)

Best model is selected by lowest RMSE.

Outputs:
  - model.pkl            → Best trained model
  - scaler.pkl           → StandardScaler for input features
  - feature_names.pkl    → Ordered list of feature names
  - model_comparison.pkl → Metrics for all models
  - dataset.pkl          → Processed dataset for similar-property lookup
=============================================================================
"""

import os
import warnings
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Try importing XGBoost — it's optional
try:
    from xgboost import XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False
    print("⚠️  XGBoost not installed. Skipping XGBoost model.")

warnings.filterwarnings("ignore")

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "Real estate valuation data set.xlsx")

# ── 1. Load Dataset ─────────────────────────────────────────────────────────
print("📂 Loading dataset...")
df = pd.read_excel(DATASET_PATH)

# Rename columns to clean, short names for easier use
df.columns = [
    "no",                    # Row number (will be dropped)
    "transaction_date",      # X1 — transaction date as decimal year
    "house_age",             # X2 — age of the house in years
    "distance_to_mrt",       # X3 — distance to nearest MRT station (meters)
    "convenience_stores",    # X4 — number of convenience stores nearby
    "latitude",              # X5 — geographic latitude
    "longitude",             # X6 — geographic longitude
    "price_per_unit_area",   # Y  — house price of unit area (TARGET)
]

# Drop the row-number column — it carries no predictive signal
df = df.drop(columns=["no"])

print(f"   ✅ Loaded {len(df)} records, {df.shape[1]} columns")
print(f"   ✅ No missing values: {df.isnull().sum().sum() == 0}")

# ── 2. Feature Engineering ──────────────────────────────────────────────────
print("\n🔧 Engineering features...")

# ---- Feature 1: House Age Category ----
# Categorize houses as New / Medium / Old to capture non-linear age effects
# New (≤10 years) = 0, Medium (10-25 years) = 1, Old (>25 years) = 2
def categorize_house_age(age):
    """Classify house age into buckets: New, Medium, Old."""
    if age <= 10:
        return 0  # New
    elif age <= 25:
        return 1  # Medium
    else:
        return 2  # Old

df["house_age_category"] = df["house_age"].apply(categorize_house_age)
print("   ✅ house_age_category: New(0) / Medium(1) / Old(2)")

# ---- Feature 2: MRT Distance Category ----
# Bucket MRT distance into accessibility tiers
# Very Near (≤500m) = 0, Near (≤1000m) = 1, Far (≤3000m) = 2, Very Far (>3000m) = 3
def categorize_mrt_distance(dist):
    """Classify MRT distance into accessibility tiers."""
    if dist <= 500:
        return 0  # Very Near
    elif dist <= 1000:
        return 1  # Near
    elif dist <= 3000:
        return 2  # Far
    else:
        return 3  # Very Far

df["mrt_distance_category"] = df["distance_to_mrt"].apply(categorize_mrt_distance)
print("   ✅ mrt_distance_category: VeryNear(0) / Near(1) / Far(2) / VeryFar(3)")

# ---- Feature 3: Convenience Score ----
# Normalize store count to 0–1 range. More stores → higher convenience.
# Max in dataset is 10, so we divide by 10.
df["convenience_score"] = df["convenience_stores"] / 10.0
print("   ✅ convenience_score: stores/10 (0.0 to 1.0)")

# ---- Feature 4: Transport Accessibility Score ----
# Inverse distance metric: closer to MRT → higher score.
# Formula: 1 / (1 + distance/1000) gives a smooth decay from ~1 to ~0.
df["transport_accessibility"] = 1.0 / (1.0 + df["distance_to_mrt"] / 1000.0)
print("   ✅ transport_accessibility: 1/(1+dist/1000)")

# ---- Feature 5: Urban Convenience Score ----
# Composite score combining transport access and nearby stores.
# Properties with both good transit AND many stores score highest.
df["urban_convenience_score"] = df["convenience_score"] * df["transport_accessibility"]
print("   ✅ urban_convenience_score: convenience × transport")

# ---- Feature 6: Location Cluster Signal ----
# Latitude × Longitude interaction captures geographic location patterns.
# Different neighborhoods have distinct lat*lon products.
df["location_cluster"] = df["latitude"] * df["longitude"]
print("   ✅ location_cluster: lat × lon interaction")

# ── 3. Prepare Features and Target ──────────────────────────────────────────
print("\n📊 Preparing features...")

# Define feature columns (all engineered + raw features, excluding target)
FEATURE_COLUMNS = [
    "transaction_date",
    "house_age",
    "distance_to_mrt",
    "convenience_stores",
    "latitude",
    "longitude",
    "house_age_category",
    "mrt_distance_category",
    "convenience_score",
    "transport_accessibility",
    "urban_convenience_score",
    "location_cluster",
]

TARGET_COLUMN = "price_per_unit_area"

X = df[FEATURE_COLUMNS].values
y = df[TARGET_COLUMN].values

print(f"   Features: {len(FEATURE_COLUMNS)} columns")
print(f"   Target: {TARGET_COLUMN}")

# ── 4. Train-Test Split ─────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
print(f"\n🔀 Split: {len(X_train)} train / {len(X_test)} test")

# ── 5. Feature Scaling ──────────────────────────────────────────────────────
# StandardScaler normalizes features to zero mean and unit variance.
# This is important for Linear Regression and distance-based calculations.
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
print("📏 Features scaled with StandardScaler")

# ── 6. Train Multiple Models ────────────────────────────────────────────────
print("\n🤖 Training models...\n")

# Dictionary to hold all models we want to compare
models = {
    "Linear Regression": LinearRegression(),
    "Random Forest": RandomForestRegressor(
        n_estimators=200,    # 200 trees for stable predictions
        max_depth=15,        # Prevent overfitting
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,           # Use all CPU cores
    ),
    "Gradient Boosting": GradientBoostingRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
    ),
}

# Add XGBoost if available
if HAS_XGBOOST:
    models["XGBoost"] = XGBRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        min_child_weight=2,
        random_state=42,
        verbosity=0,
    )

# ── 7. Evaluate All Models ──────────────────────────────────────────────────
results = {}

for name, model in models.items():
    print(f"   Training {name}...")
    
    # Train the model
    model.fit(X_train_scaled, y_train)
    
    # Predict on test set
    y_pred = model.predict(X_test_scaled)
    
    # Calculate metrics
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    results[name] = {
        "model": model,
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2": round(r2, 4),
        "predictions": y_pred,
    }
    
    print(f"      MAE: {mae:.4f}  |  RMSE: {rmse:.4f}  |  R²: {r2:.4f}")

# ── 8. Select Best Model ────────────────────────────────────────────────────
# Best model = lowest RMSE (most accurate predictions)
best_name = min(results, key=lambda k: results[k]["rmse"])
best_model = results[best_name]["model"]

print(f"\n🏆 Best Model: {best_name}")
print(f"   MAE:  {results[best_name]['mae']}")
print(f"   RMSE: {results[best_name]['rmse']}")
print(f"   R²:   {results[best_name]['r2']}")

# ── 9. Extract Feature Importance ───────────────────────────────────────────
# Tree-based models provide feature_importances_ attribute.
# Linear Regression uses coefficient magnitudes as proxy.
if hasattr(best_model, "feature_importances_"):
    importances = best_model.feature_importances_
elif hasattr(best_model, "coef_"):
    importances = np.abs(best_model.coef_)
    importances = importances / importances.sum()  # Normalize to sum to 1
else:
    importances = np.ones(len(FEATURE_COLUMNS)) / len(FEATURE_COLUMNS)

# Print feature importance ranking
print("\n📊 Feature Importance:")
sorted_indices = np.argsort(importances)[::-1]
for i in sorted_indices:
    bar = "█" * int(importances[i] * 40)
    print(f"   {FEATURE_COLUMNS[i]:30s} {importances[i]:.4f}  {bar}")

# ── 10. Save All Artifacts ──────────────────────────────────────────────────
print("\n💾 Saving artifacts...")

# Save the best trained model
joblib.dump(best_model, os.path.join(BASE_DIR, "model.pkl"))
print("   ✅ model.pkl")

# Save the scaler for input transformation
joblib.dump(scaler, os.path.join(BASE_DIR, "scaler.pkl"))
print("   ✅ scaler.pkl")

# Save feature names for consistent input ordering
joblib.dump(FEATURE_COLUMNS, os.path.join(BASE_DIR, "feature_names.pkl"))
print("   ✅ feature_names.pkl")

# Save model comparison metrics (without the heavy model objects)
model_comparison = {
    name: {
        "mae": info["mae"],
        "rmse": info["rmse"],
        "r2": info["r2"],
    }
    for name, info in results.items()
}
model_comparison["best_model"] = best_name
model_comparison["feature_importance"] = {
    FEATURE_COLUMNS[i]: round(float(importances[i]), 6)
    for i in range(len(FEATURE_COLUMNS))
}

# Save actual vs predicted for charts
model_comparison["actual_vs_predicted"] = {
    "actual": y_test.tolist(),
    "predicted": results[best_name]["predictions"].tolist(),
}

joblib.dump(model_comparison, os.path.join(BASE_DIR, "model_comparison.pkl"))
print("   ✅ model_comparison.pkl")

# Save the processed dataset for similar-property lookup
joblib.dump(df, os.path.join(BASE_DIR, "dataset.pkl"))
print("   ✅ dataset.pkl")

print("\n✅ Training complete! All artifacts saved.")
print(f"   Best model: {best_name} (RMSE: {results[best_name]['rmse']}, R²: {results[best_name]['r2']})")
