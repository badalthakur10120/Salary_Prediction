import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# ============================================
# STEP 7: MODEL EVALUATION
# ============================================

# Load dataset
df = pd.read_csv("data/Salary_Data.csv")

# Remove missing values
df = df.dropna().copy()

# Clean categorical data
df["Education Level"] = df["Education Level"].str.strip()

education_mapping = {
    "Bachelor's Degree": "Bachelor's",
    "Master's Degree": "Master's",
    "phD": "PhD"
}

df["Education Level"] = df["Education Level"].replace(
    education_mapping
)

df["Gender"] = df["Gender"].str.strip()
df["Job Title"] = df["Job Title"].str.strip()

# Remove duplicate rows
df = df.drop_duplicates().copy()


# ============================================
# FEATURES AND TARGET
# ============================================

features = [
    "Age",
    "Gender",
    "Education Level",
    "Job Title",
    "Years of Experience"
]

target = "Salary"

X = df[features]
y = df[target]


# ============================================
# TRAIN / TEST SPLIT
# ============================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)


# ============================================
# PREPROCESSING
# ============================================

numerical_features = [
    "Age",
    "Years of Experience"
]

categorical_features = [
    "Gender",
    "Education Level",
    "Job Title"
]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "num",
            StandardScaler(),
            numerical_features
        ),
        (
            "cat",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features
        )
    ]
)


# ============================================
# MODELS
# ============================================

linear_model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("model", LinearRegression())
    ]
)

random_forest_model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        (
            "model",
            RandomForestRegressor(
                n_estimators=300,
                random_state=42,
                n_jobs=-1
            )
        )
    ]
)


# ============================================
# TRAIN MODELS
# ============================================

print("Training Linear Regression...")
linear_model.fit(X_train, y_train)

print("Training Random Forest...")
random_forest_model.fit(X_train, y_train)


# ============================================
# PREDICTIONS
# ============================================

linear_predictions = linear_model.predict(X_test)

random_forest_predictions = random_forest_model.predict(X_test)


# ============================================
# EVALUATION FUNCTION
# ============================================

def evaluate_model(name, actual, predicted):

    mae = mean_absolute_error(
        actual,
        predicted
    )

    rmse = mean_squared_error(
        actual,
        predicted
    ) ** 0.5

    r2 = r2_score(
        actual,
        predicted
    )

    print(f"\n===== {name} =====")
    print(f"MAE  : ₹{mae:,.2f}")
    print(f"RMSE : ₹{rmse:,.2f}")
    print(f"R²   : {r2:.4f}")

    return mae, rmse, r2


# ============================================
# EVALUATE
# ============================================

linear_results = evaluate_model(
    "LINEAR REGRESSION",
    y_test,
    linear_predictions
)

random_forest_results = evaluate_model(
    "RANDOM FOREST",
    y_test,
    random_forest_predictions
)


# ============================================
# ACTUAL VS PREDICTED
# ============================================

plt.figure(figsize=(10, 6))

plt.scatter(
    y_test,
    random_forest_predictions,
    alpha=0.6
)

plt.xlabel("Actual Salary")
plt.ylabel("Predicted Salary")

plt.title(
    "Random Forest - Actual vs Predicted Salary"
)

plt.tight_layout()
plt.show()


# ============================================
# RESIDUAL PLOT
# ============================================

residuals = (
    y_test - random_forest_predictions
)

plt.figure(figsize=(10, 6))

plt.scatter(
    random_forest_predictions,
    residuals,
    alpha=0.6
)

plt.axhline(
    y=0,
    linestyle="--"
)

plt.xlabel("Predicted Salary")
plt.ylabel("Prediction Error")

plt.title(
    "Random Forest - Prediction Error"
)

plt.tight_layout()
plt.show()


# ============================================
# MODEL COMPARISON
# ============================================

models = [
    "Linear Regression",
    "Random Forest"
]

r2_scores = [
    linear_results[2],
    random_forest_results[2]
]

plt.figure(figsize=(9, 6))

plt.bar(
    models,
    r2_scores
)

plt.ylabel("R² Score")
plt.title("Model Performance Comparison")

plt.ylim(0, 1)

plt.tight_layout()
plt.show()


# ============================================
# SAVE RESULTS
# ============================================

results = pd.DataFrame({
    "Model": [
        "Linear Regression",
        "Random Forest"
    ],
    "MAE": [
        linear_results[0],
        random_forest_results[0]
    ],
    "RMSE": [
        linear_results[1],
        random_forest_results[1]
    ],
    "R2": [
        linear_results[2],
        random_forest_results[2]
    ]
})

results.to_csv(
    "model_results.csv",
    index=False
)

print("\n===== MODEL RESULTS SAVED =====")
print(results)

print("\n===== STEP 7 COMPLETED =====")
# ==========================================
# STEP 8: FEATURE IMPORTANCE
# ==========================================

print("\n--- STEP 8: FEATURE IMPORTANCE ---")

# Get the preprocessing part of the Random Forest pipeline
rf_preprocessor = random_forest_model.named_steps["preprocessor"]

# Get the trained Random Forest model
rf_model = random_forest_model.named_steps["model"]

# Get feature names after One-Hot Encoding
feature_names = rf_preprocessor.get_feature_names_out()

# Get Random Forest feature importance
importances = rf_model.feature_importances_

# Create DataFrame
feature_importance_df = pd.DataFrame({
    "Feature": feature_names,
    "Importance": importances
})

# Sort from highest to lowest
feature_importance_df = feature_importance_df.sort_values(
    by="Importance",
    ascending=False
)

# Display top 20 features
print("\nTop 20 Important Features:")
print(feature_importance_df.head(20).to_string(index=False))


# ==========================================
# PLOT TOP 15 FEATURES
# ==========================================

top_features = feature_importance_df.head(15).sort_values(
    by="Importance"
)

plt.figure(figsize=(10, 7))

plt.barh(
    top_features["Feature"],
    top_features["Importance"]
)

plt.xlabel("Importance")
plt.ylabel("Feature")
plt.title("Top 15 Features - Random Forest")
plt.tight_layout()

plt.show()


# ==========================================
# SAVE FEATURE IMPORTANCE
# ==========================================

feature_importance_df.to_csv(
    "feature_importance.csv",
    index=False
)

print("\nFeature importance saved as: feature_importance.csv")
# ==========================================
# STEP 9: SALARY BANDS + CONFUSION MATRIX
# ==========================================

print("\n--- STEP 9: SALARY BANDS + CONFUSION MATRIX ---")

from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns


# ==========================================
# 1. CREATE SALARY BAND THRESHOLDS
# ==========================================

low_threshold = y_train.quantile(0.33)
high_threshold = y_train.quantile(0.67)

print("\nSalary Band Thresholds:")
print(f"Low Salary:    Below ₹{low_threshold:,.2f}")
print(f"Medium Salary: ₹{low_threshold:,.2f} - ₹{high_threshold:,.2f}")
print(f"High Salary:   Above ₹{high_threshold:,.2f}")


# ==========================================
# 2. FUNCTION TO CONVERT SALARY INTO BANDS
# ==========================================

def salary_band(salary):
    if salary < low_threshold:
        return "Low"
    elif salary < high_threshold:
        return "Medium"
    else:
        return "High"

# ==========================================
# 3. ACTUAL AND PREDICTED SALARY BANDS
# ==========================================

# Get Random Forest predictions
rf_predictions = random_forest_model.predict(X_test)

actual_bands = y_test.apply(salary_band)

predicted_bands = pd.Series(
    rf_predictions,
    index=y_test.index
).apply(salary_band)
# ==========================================
# 4. DISPLAY BAND COUNTS
# ==========================================

print("\nActual Salary Band Distribution:")
print(actual_bands.value_counts())

print("\nPredicted Salary Band Distribution:")
print(predicted_bands.value_counts())


# ==========================================
# 5. CONFUSION MATRIX
# ==========================================

labels = ["Low", "Medium", "High"]

cm = confusion_matrix(
    actual_bands,
    predicted_bands,
    labels=labels
)

print("\nConfusion Matrix:")
print(cm)


# ==========================================
# 6. CONFUSION MATRIX VISUALIZATION
# ==========================================

plt.figure(figsize=(8, 6))

sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    xticklabels=labels,
    yticklabels=labels,
    cmap="Blues"
)

plt.xlabel("Predicted Salary Band")
plt.ylabel("Actual Salary Band")
plt.title("Salary Band Confusion Matrix")

plt.tight_layout()
plt.show()


# ==========================================
# 7. CLASSIFICATION REPORT
# ==========================================

print("\nClassification Report:")

print(
    classification_report(
        actual_bands,
        predicted_bands,
        labels=labels,
        zero_division=0
    )
)


# ==========================================
# 8. BAND CLASSIFICATION ACCURACY
# ==========================================

band_accuracy = (actual_bands == predicted_bands).mean()

print(f"\nSalary Band Accuracy: {band_accuracy:.4f}")
print(f"Salary Band Accuracy: {band_accuracy * 100:.2f}%")
# ==========================================
# STEP 10: SAVE TRAINED MODEL
# ==========================================

import os
import joblib

print("\n--- STEP 10: SAVING TRAINED MODEL ---")

# Create model directory inside the project
os.makedirs("model", exist_ok=True)

# Save the complete Random Forest pipeline
model_path = "model/salary_prediction_model.joblib"

joblib.dump(
    random_forest_model,
    model_path
)

print("\nModel successfully saved!")
print(f"Location: {model_path}")