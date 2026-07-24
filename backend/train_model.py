import os
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


# ==============================
# 1. Load Dataset
# ==============================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TRAIN_PATH = os.path.join(BASE_DIR, "dataset", "Training.csv")
TEST_PATH = os.path.join(BASE_DIR, "dataset", "Testing.csv")

train_data = pd.read_csv(TRAIN_PATH)
test_data = pd.read_csv(TEST_PATH)


# ==============================
# 2. Clean Dataset
# ==============================

# Remove unnecessary unnamed columns
train_data = train_data.loc[:, ~train_data.columns.str.contains("^Unnamed")]
test_data = test_data.loc[:, ~test_data.columns.str.contains("^Unnamed")]


# ==============================
# 3. Separate Features and Target
# ==============================

X_train = train_data.drop("prognosis", axis=1)
y_train = train_data["prognosis"]

X_test = test_data.drop("prognosis", axis=1)
y_test = test_data["prognosis"]


# ==============================
# 4. Create Random Forest Model
# ==============================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    max_depth=None,
    n_jobs=-1
)


# ==============================
# 5. Train Model
# ==============================

print("Training Random Forest Model...")

model.fit(X_train, y_train)

print("Model Training Completed!")


# ==============================
# 6. Make Predictions
# ==============================

y_pred = model.predict(X_test)


# ==============================
# 7. Evaluate Model
# ==============================

accuracy = accuracy_score(y_test, y_pred)

print("\n===================================")
print("MODEL EVALUATION")
print("===================================")

print(f"Accuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# ==============================
# 8. Save Trained Model
# ==============================

MODEL_DIR = os.path.join(BASE_DIR, "model")

os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODEL_DIR, "random_forest_model.pkl")

joblib.dump(model, MODEL_PATH)

print("\n===================================")
print(f"Model saved successfully at:")
print(MODEL_PATH)
print("===================================")