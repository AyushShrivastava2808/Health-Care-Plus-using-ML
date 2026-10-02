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

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)


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


TESTING_DATA_PATH = os.path.join(
    BASE_DIR,
    "dataset",
    "Testing.csv"
)


# ==========================================
# 3. Load Trained Model
# ==========================================

print(
    "Loading Random Forest Model..."
)


model = joblib.load(
    MODEL_PATH
)


print(
    "Model Loaded Successfully!"
)


# ==========================================
# 4. Load Training Dataset
# ==========================================

training_data = pd.read_csv(
    TRAINING_DATA_PATH
)


# Remove unwanted columns

training_data = training_data.loc[
    :,
    ~training_data.columns.str.contains(
        "^Unnamed"
    )
]


# ==========================================
# 5. Get All Symptoms
# ==========================================

SYMPTOMS = [

    column

    for column in training_data.columns

    if column != "prognosis"

]


print(
    f"Total Symptoms Loaded: {len(SYMPTOMS)}"
)


# ==========================================
# 6. Calculate Model Accuracy
# ==========================================

model_accuracy = None


try:

    testing_data = pd.read_csv(
        TESTING_DATA_PATH
    )


    testing_data = testing_data.loc[
        :,
        ~testing_data.columns.str.contains(
            "^Unnamed"
        )
    ]


    X_test = testing_data.drop(
        "prognosis",
        axis=1
    )


    y_test = testing_data[
        "prognosis"
    ]


    y_pred = model.predict(
        X_test
    )


    from sklearn.metrics import accuracy_score


    model_accuracy = round(

        accuracy_score(
            y_test,
            y_pred
        ) * 100,

        2

    )


    print(
        f"Model Test Accuracy: "
        f"{model_accuracy}%"
    )


except Exception as e:

    print(
        "Could not calculate model accuracy:"
    )

    print(
        str(e)
    )


# ==========================================
# 7. Disease Information
# ==========================================

DISEASE_INFORMATION = {

    "Fungal infection": {

        "description":
            "A fungal infection is caused by fungi that can affect the skin or other parts of the body.",

        "precautions":
            "Maintain good hygiene, keep affected areas clean and dry, and avoid sharing personal items.",

        "recommended_specialist":
            "Dermatologist"

    },


    "Allergy": {

        "description":
            "An allergy occurs when the immune system reacts to a substance that is normally harmless.",

        "precautions":
            "Avoid known allergens and seek medical advice if symptoms are severe or persistent.",

        "recommended_specialist":
            "Allergist / Immunologist"

    },


    "GERD": {

        "description":
            "GERD is a digestive condition in which stomach contents frequently flow back into the esophagus.",

        "precautions":
            "Avoid heavy meals, identify trigger foods, and avoid lying down immediately after eating.",

        "recommended_specialist":
            "Gastroenterologist"

    },


    "Chronic cholestasis": {

        "description":
            "Chronic cholestasis involves reduced or blocked bile flow and may require medical evaluation.",

        "precautions":
            "Avoid alcohol, maintain a balanced diet, and consult a healthcare professional for persistent symptoms.",

        "recommended_specialist":
            "Gastroenterologist / Hepatologist"

    },


    "Drug Reaction": {

        "description":
            "A drug reaction is an unwanted response that may occur after taking a medication.",

        "precautions":
            "Do not stop prescribed medicines without medical advice and inform your doctor about any suspected reaction.",

        "recommended_specialist":
            "General Physician / Allergist"

    },


    "Peptic ulcer disease": {

        "description":
            "Peptic ulcer disease involves open sores developing in the lining of the stomach or upper intestine.",

        "precautions":
            "Avoid unnecessary NSAID use, smoking, and alcohol, and consult a doctor for persistent abdominal symptoms.",

        "recommended_specialist":
            "Gastroenterologist"

    },


    "AIDS": {

        "description":
            "AIDS is an advanced stage of HIV infection that significantly affects the immune system.",

        "precautions":
            "Seek appropriate medical care and follow prescribed treatment and prevention guidance.",

        "recommended_specialist":
            "Infectious Disease Specialist"

    },


    "Diabetes": {

        "description":
            "Diabetes is a chronic condition involving elevated blood glucose levels.",

        "precautions":
            "Monitor blood glucose as advised, maintain a healthy lifestyle, and follow prescribed treatment.",

        "recommended_specialist":
            "Endocrinologist"

    },


    "Hypertension": {

        "description":
            "Hypertension is persistently elevated blood pressure that may increase the risk of cardiovascular complications.",

        "precautions":
            "Monitor blood pressure, reduce excess salt intake, stay physically active, and follow medical advice.",

        "recommended_specialist":
            "Cardiologist / General Physician"

    },


    "Migraine": {

        "description":
            "Migraine is a neurological condition that can cause recurring headaches and other symptoms.",

        "precautions":
            "Identify personal triggers, maintain regular sleep, stay hydrated, and seek medical advice for recurrent headaches.",

        "recommended_specialist":
            "Neurologist"

    },


    "Bronchial Asthma": {

        "description":
            "Bronchial asthma is a condition in which the airways become inflamed and narrowed, potentially causing breathing difficulties.",

        "precautions":
            "Avoid known triggers, follow prescribed inhaler treatment, and seek urgent medical attention for severe breathing difficulty.",

        "recommended_specialist":
            "Pulmonologist"

    },


    "Pneumonia": {

        "description":
            "Pneumonia is an infection that can cause inflammation in the air sacs of the lungs.",

        "precautions":
            "Rest adequately, stay hydrated, and seek medical evaluation for persistent fever or breathing difficulties.",

        "recommended_specialist":
            "Pulmonologist"

    },


    "Common Cold": {

        "description":
            "The common cold is a viral upper respiratory infection that commonly causes congestion, cough, and sore throat.",

        "precautions":
            "Rest, stay hydrated, and maintain good hand hygiene.",

        "recommended_specialist":
            "General Physician"

    },


    "Dengue": {

        "description":
            "Dengue is a mosquito-borne viral infection that can cause fever, headache, body pain, and other symptoms.",

        "precautions":
            "Stay hydrated and seek medical evaluation for persistent high fever, bleeding, or severe symptoms.",

        "recommended_specialist":
            "General Physician / Infectious Disease Specialist"

    },


    "Typhoid": {

        "description":
            "Typhoid fever is a bacterial infection that can cause prolonged fever and digestive symptoms.",

        "precautions":
            "Maintain hydration and hygiene and seek medical treatment if symptoms persist.",

        "recommended_specialist":
            "General Physician / Infectious Disease Specialist"

    }

}


# ==========================================
# 8. Default Disease Information
# ==========================================

DEFAULT_INFORMATION = {

    "description":
        "The predicted condition is based on the symptoms selected and the machine learning model's prediction.",

    "precautions":
        "This result is for informational purposes only. Consult a qualified healthcare professional for proper evaluation.",

    "recommended_specialist":
        "General Physician"

}


# ==========================================
# 9. Home Route
# ==========================================

@app.route(
    "/",
    methods=["GET"]
)

def home():

    return jsonify({

        "message":
            "Symptom Checker API is running successfully!",

        "status":
            "success",

        "model_accuracy":
            model_accuracy

    })


# ==========================================
# 10. Get All Symptoms
# ==========================================

@app.route(
    "/symptoms",
    methods=["GET"]
)

def get_symptoms():

    return jsonify({

        "symptoms":
            SYMPTOMS,

        "count":
            len(SYMPTOMS)

    })


# ==========================================
# 11. Disease Prediction API
# ==========================================

@app.route(
    "/predict",
    methods=["POST"]
)

def predict():

    try:

        # ==================================
        # Get Request Data
        # ==================================

        data = request.get_json()


        if not data:

            return jsonify({

                "status":
                    "error",

                "message":
                    "No data provided."

            }), 400


        # ==================================
        # Get Selected Symptoms
        # ==================================

        selected_symptoms = data.get(
            "symptoms",
            []
        )


        if not selected_symptoms:

            return jsonify({

                "status":
                    "error",

                "message":
                    "Please select at least one symptom."

            }), 400


        # ==================================
        # Create Input Feature Vector
        # ==================================

        input_data = pd.DataFrame(

            0,

            index=[0],

            columns=SYMPTOMS

        )


        # ==================================
        # Set Selected Symptoms = 1
        # ==================================

        valid_symptoms = []


        for symptom in selected_symptoms:

            if symptom in SYMPTOMS:

                input_data.loc[
                    0,
                    symptom
                ] = 1

                valid_symptoms.append(
                    symptom
                )


        # ==================================
        # Validate Valid Symptoms
        # ==================================

        if not valid_symptoms:

            return jsonify({

                "status":
                    "error",

                "message":
                    "No valid symptoms were selected."

            }), 400


        # ==================================
        # Make Prediction
        # ==================================

        prediction = model.predict(
            input_data
        )[0]


        # ==================================
        # Get Prediction Probabilities
        # ==================================

        probabilities = model.predict_proba(
            input_data
        )[0]


        # ==================================
        # Get Class Names
        # ==================================

        class_names = model.classes_


        # ==================================
        # Combine Disease + Probability
        # ==================================

        probability_data = list(

            zip(

                class_names,

                probabilities

            )

        )


        # ==================================
        # Sort Predictions
        # ==================================

        probability_data.sort(

            key=lambda x: x[1],

            reverse=True

        )


        # ==================================
        # Top Prediction Probability
        # ==================================

        top_probability = (

            probability_data[0][1]

        )


        prediction_confidence = round(

            top_probability * 100,

            2

        )


        # ==================================
        # Top 3 Predictions
        # ==================================

        top_predictions = []


        for disease, probability in (

            probability_data[:3]

        ):

            top_predictions.append({

                "disease":
                    disease,

                "probability":
                    round(

                        probability * 100,

                        2

                    )

            })


        # ==================================
        # Get Disease Information
        # ==================================

        disease_information = (

            DISEASE_INFORMATION.get(

                prediction,

                DEFAULT_INFORMATION

            )

        )


        # ==================================
        # Return Final Response
        # ==================================

        return jsonify({

            "status":
                "success",

            "predicted_disease":
                prediction,

            "confidence":
                prediction_confidence,

            "model_accuracy":
                model_accuracy,

            "top_predictions":
                top_predictions,

            "selected_symptoms":
                valid_symptoms,

            "disease_information":
                disease_information,

            "disclaimer":

                "This tool is for educational and informational purposes only. It is not a substitute for professional medical diagnosis, treatment, or advice."

        })


    except Exception as e:

        print(
            "Prediction Error:",
            str(e)
        )


        return jsonify({

            "status":
                "error",

            "message":
                str(e)

        }), 500


# ==========================================
# 12. Run Flask Application
# ==========================================

if __name__ == "__main__":

    app.run(

        debug=True,

        host="127.0.0.1",

        port=5000

    )
