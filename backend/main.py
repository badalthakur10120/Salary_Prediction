from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
import os

# CREATE FASTAPI APP

app = FastAPI(
    title="Salary Prediction API",
    description="Machine Learning API for Salary Prediction",
    version="1.0.0"
)

# CORS

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# LOAD TRAINED MODEL

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.abspath(
    os.path.join(
        BASE_DIR,
        "..",
        "model",
        "salary_prediction_model.joblib"
    )
)

model = joblib.load(MODEL_PATH)

# API KEY

API_KEY = os.getenv("API_KEY", "salary-ai-2026-demo-key")

# HOME ENDPOINT

@app.get("/")
def home():
    return {
        "message": "Salary Prediction API is running!",
        "status": "success"
    }

# PREDICTION ENDPOINT

@app.post("/predict")
def predict_salary(
    data: dict,
    x_api_key: str = Header(default=None)
):

    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )

    input_data = pd.DataFrame([data])

    prediction = model.predict(input_data)[0]

    predicted_salary = round(float(prediction), 2)

    if predicted_salary < 83520.03:
        salary_band = "Low"
    elif predicted_salary <= 140000:
        salary_band = "Medium"
    else:
        salary_band = "High"

    return {
        "predicted_salary": predicted_salary,
        "salary_band": salary_band,
        "model": "Random Forest Regressor",
        "api_status": "success"
    }