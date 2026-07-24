from flask import Flask, request, jsonify
from flask_cors import CORS

import os
import pandas as pd
import joblib


# ==========================================
# 1. Initialize Flask Application
# ==========================================

app = Flask(__name__)
CORS(app)


# ==========================================
# 2. Project Paths
# ==========================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "random_forest_model.pkl"
)

TRAINING_DATA_PATH = os.path.join(
    BASE_DIR,
    "dataset",
    "Training.csv"
)


# ==========================================
# 3. Load Model
# ==========================================

print("Loading Random Forest Model...")

model = joblib.load(MODEL_PATH)

print("Model Loaded Successfully!")


# ==========================================
# 4. Load Training Dataset
#    Used to get symptom feature names
# ==========================================

training_data = pd.read_csv(TRAINING_DATA_PATH)

# Remove unwanted unnamed columns
training_data = training_data.loc[
    :,
    ~training_data.columns.str.contains("^Unnamed")
]


# Get all 132 symptom features
SYMPTOMS = [
    column
    for column in training_data.columns
    if column != "prognosis"
]


# ==========================================
# 5. Home Route
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Symptom Checker API is running successfully!",
        "status": "success"
    })


# ==========================================
# 6. Get All Symptoms
# ==========================================

@app.route("/symptoms", methods=["GET"])
def get_symptoms():

    return jsonify({
        "symptoms": SYMPTOMS,
        "count": len(SYMPTOMS)
    })


# ==========================================
# 7. Disease Prediction API
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # Get JSON data from frontend
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No data provided"
            }), 400


        # Get selected symptoms
        selected_symptoms = data.get(
            "symptoms",
            []
        )


        # Validate symptoms
        if not selected_symptoms:

            return jsonify({
                "error": "Please select at least one symptom."
            }), 400


        # ==================================
        # Create feature vector
        # ==================================

        input_data = pd.DataFrame(
            0,
            index=[0],
            columns=SYMPTOMS
        )


        # Set selected symptoms to 1
        for symptom in selected_symptoms:

            if symptom in SYMPTOMS:

                input_data.loc[
                    0,
                    symptom
                ] = 1


        # ==================================
        # Make Prediction
        # ==================================

        prediction = model.predict(
            input_data
        )[0]


        # ==================================
        # Get Prediction Probability
        # ==================================

        probabilities = model.predict_proba(
            input_data
        )[0]


        # Get highest probability
        confidence = max(
            probabilities
        )


        # Convert to percentage
        confidence_percentage = round(
            confidence * 100,
            2
        )


        # ==================================
        # Get Top 3 Predictions
        # ==================================

        class_names = model.classes_

        probability_data = list(
            zip(
                class_names,
                probabilities
            )
        )


        # Sort by probability
        probability_data.sort(
            key=lambda x: x[1],
            reverse=True
        )


        top_predictions = []

        for disease, probability in probability_data[:3]:

            top_predictions.append({
                "disease": disease,
                "probability": round(
                    probability * 100,
                    2
                )
            })


        # ==================================
        # Return Response
        # ==================================

        return jsonify({

            "status": "success",

            "predicted_disease": prediction,

            "confidence": confidence_percentage,

            "top_predictions": top_predictions,

            "selected_symptoms": selected_symptoms,

            "disclaimer":
                "This tool is for educational/"
                "informational purposes and is not "
                "a substitute for professional "
                "medical diagnosis."

        })


    except Exception as e:

        return jsonify({

            "status": "error",

            "message": str(e)

        }), 500


# ==========================================
# 8. Run Application
# ==========================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )