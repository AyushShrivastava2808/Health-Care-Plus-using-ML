// ==========================================
// API Configuration
// ==========================================

const API_URL = "http://127.0.0.1:5000";


// ==========================================
// DOM Elements
// ==========================================

const symptomsList =
    document.getElementById("symptomsList");

const selectedSymptomsContainer =
    document.getElementById("selectedSymptoms");

const symptomSearch =
    document.getElementById("symptomSearch");

const predictButton =
    document.getElementById("predictButton");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const resultsSection =
    document.getElementById("resultsSection");


// ==========================================
// Store Selected Symptoms
// ==========================================

let allSymptoms = [];

let selectedSymptoms = new Set();


// ==========================================
// Load Symptoms From Backend
// ==========================================

async function loadSymptoms() {

    try {

        symptomsList.innerHTML =
            "<p>Loading symptoms...</p>";

        const response =
            await fetch(`${API_URL}/symptoms`);

        if (!response.ok) {

            throw new Error(
                "Failed to load symptoms."
            );

        }

        const data =
            await response.json();

        // Safe check
        allSymptoms =
            Array.isArray(data.symptoms)
                ? data.symptoms
                : [];

        displaySymptoms(
            allSymptoms
        );

    } catch (error) {

        console.error(
            "Symptoms Loading Error:",
            error
        );

        symptomsList.innerHTML =
            `
            <p class="error-message">
                Unable to load symptoms.
                Please make sure the Flask
                backend is running.
            </p>
            `;

    }

}


// ==========================================
// Display Symptoms
// ==========================================

function displaySymptoms(
    symptoms
) {

    symptomsList.innerHTML =
        "";

    if (
        !Array.isArray(symptoms) ||
        symptoms.length === 0
    ) {

        symptomsList.innerHTML =
            `
            <p>
                No symptoms found.
            </p>
            `;

        return;

    }

    symptoms.forEach(
        symptom => {

            const symptomItem =
                document.createElement(
                    "div"
                );

            symptomItem.className =
                "symptom-item";

            symptomItem.textContent =
                formatSymptomName(
                    symptom
                );

            symptomItem.dataset.symptom =
                symptom;


            // Mark selected symptoms

            if (
                selectedSymptoms.has(
                    symptom
                )
            ) {

                symptomItem.classList.add(
                    "selected"
                );

            }


            // Click event

            symptomItem.addEventListener(
                "click",
                () => {

                    toggleSymptom(
                        symptom
                    );

                }
            );


            symptomsList.appendChild(
                symptomItem
            );

        }
    );

}


// ==========================================
// Format Symptom Name
// ==========================================

function formatSymptomName(
    symptom
) {

    if (
        !symptom
    ) {

        return "";

    }

    return String(symptom)

        .replace(
            /_/g,
            " "
        )

        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


// ==========================================
// Toggle Symptom
// ==========================================

function toggleSymptom(
    symptom
) {

    if (
        selectedSymptoms.has(
            symptom
        )
    ) {

        selectedSymptoms.delete(
            symptom
        );

    } else {

        selectedSymptoms.add(
            symptom
        );

    }

    updateSelectedSymptoms();

    displaySymptoms(
        getFilteredSymptoms()
    );

}


// ==========================================
// Update Selected Symptoms UI
// ==========================================

function updateSelectedSymptoms() {

    selectedSymptomsContainer.innerHTML =
        "";

    if (
        selectedSymptoms.size === 0
    ) {

        selectedSymptomsContainer.innerHTML =
            `
            <p class="empty-message">
                No symptoms selected yet.
            </p>
            `;

        return;

    }

    selectedSymptoms.forEach(
        symptom => {

            const tag =
                document.createElement(
                    "span"
                );

            tag.className =
                "selected-tag";

            tag.textContent =
                `${formatSymptomName(
                    symptom
                )} ✕`;


            tag.addEventListener(
                "click",
                () => {

                    toggleSymptom(
                        symptom
                    );

                }
            );


            selectedSymptomsContainer
                .appendChild(
                    tag
                );

        }
    );

}


// ==========================================
// Search Symptoms
// ==========================================

symptomSearch.addEventListener(
    "input",
    () => {

        const filteredSymptoms =
            getFilteredSymptoms();

        displaySymptoms(
            filteredSymptoms
        );

    }
);


// ==========================================
// Filter Symptoms
// ==========================================

function getFilteredSymptoms() {

    const searchText =
        symptomSearch.value
            .toLowerCase()
            .trim();


    if (
        searchText === ""
    ) {

        return allSymptoms;

    }


    return allSymptoms.filter(
        symptom =>

            symptom
                .toLowerCase()
                .includes(
                    searchText
                )

    );

}


// ==========================================
// Predict Disease
// ==========================================

predictButton.addEventListener(
    "click",
    predictDisease
);


async function predictDisease() {

    // Clear previous error

    hideError();


    // Validate selection

    if (
        selectedSymptoms.size === 0
    ) {

        showError(
            "Please select at least one symptom."
        );

        return;

    }


    // Show loading

    setLoading(
        true
    );


    try {

        const response =
            await fetch(
                `${API_URL}/predict`,
                {

                    method:
                        "POST",

                    headers:
                        {
                            "Content-Type":
                                "application/json"
                        },

                    body:
                        JSON.stringify({

                            symptoms:
                                Array.from(
                                    selectedSymptoms
                                )

                        })

                }
            );


        // Try to read JSON safely

        let data = {};

        try {

            data =
                await response.json();

        } catch {

            data = {};

        }


        // Backend error

        if (
            !response.ok
        ) {

            throw new Error(

                data.message
                ||
                data.error
                ||
                "Prediction failed."

            );

        }


        // Check if backend returned data

        if (
            !data
        ) {

            throw new Error(
                "Backend returned an empty response."
            );

        }


        // Display prediction

        displayResults(
            data
        );


    } catch (error) {

        console.error(
            "Prediction Error:",
            error
        );


        showError(

            error.message
            ||
            "Unable to connect to the backend."

        );

    } finally {

        setLoading(
            false
        );

    }

}


// ==========================================
// Display Prediction Results
// ==========================================

function displayResults(
    data
) {

    // ======================================
    // Main Prediction
    // ======================================

    const predictedDisease =
        data.predicted_disease
        ||
        data.prediction
        ||
        "Unknown Condition";


    document.getElementById(
        "predictedDisease"
    ).textContent =

        formatDiseaseName(
            predictedDisease
        );


    // ======================================
    // Confidence
    // ======================================

    const confidenceValue =
        data.confidence
        ??
        0;


    document.getElementById(
        "confidence"
    ).textContent =

        `${confidenceValue}%`;


    // ======================================
    // Disease Information
    // ======================================

    /*
        IMPORTANT FIX:

        Backend may sometimes return:
        data.disease_information = undefined

        So we use a fallback object.
    */

    const information =
        data.disease_information
        ||
        data.disease_info
        ||
        {};


    // Description

    document.getElementById(
        "description"
    ).textContent =

        information.description
        ||
        "No detailed information is available for this condition.";


    // Precautions

    document.getElementById(
        "precautions"
    ).textContent =

        information.precautions
        ||
        "Please consult a qualified healthcare professional for appropriate medical advice.";


    // Specialist

    document.getElementById(
        "specialist"
    ).textContent =

        information.recommended_specialist
        ||
        information.specialist
        ||
        "General Physician";


    // ======================================
    // Disclaimer
    // ======================================

    document.getElementById(
        "disclaimer"
    ).textContent =

        data.disclaimer
        ||
        "This tool is for educational/informational purposes and is not a substitute for professional medical diagnosis.";


    // ======================================
    // Top 3 Predictions
    // ======================================

    const topPredictions =
        document.getElementById(
            "topPredictions"
        );


    topPredictions.innerHTML =
        "";


    const predictions =
        Array.isArray(
            data.top_predictions
        )
            ? data.top_predictions
            : [];


    if (
        predictions.length === 0
    ) {

        topPredictions.innerHTML =
            `
            <p>
                No additional predictions available.
            </p>
            `;

    } else {

        predictions.forEach(
            (
                prediction,
                index
            ) => {


                const predictionItem =
                    document.createElement(
                        "div"
                    );


                predictionItem.className =
                    "prediction-item";


                const disease =
                    prediction.disease
                    ||
                    prediction.condition
                    ||
                    "Unknown Condition";


                const probability =
                    prediction.probability
                    ??
                    prediction.confidence
                    ??
                    0;


                predictionItem.innerHTML =

                    `
                    <span>

                        ${index + 1}.
                        ${formatDiseaseName(
                            disease
                        )}

                    </span>

                    <strong>

                        ${probability}%

                    </strong>
                    `;


                topPredictions.appendChild(
                    predictionItem
                );

            }
        );

    }


    // ======================================
    // Show Results
    // ======================================

    resultsSection.classList.remove(
        "hidden"
    );


    // ======================================
    // Scroll to Results
    // ======================================

    resultsSection.scrollIntoView({

        behavior:
            "smooth",

        block:
            "start"

    });

}


// ==========================================
// Format Disease Name
// ==========================================

function formatDiseaseName(
    disease
) {

    if (
        !disease
    ) {

        return "Unknown Condition";

    }

    return String(disease)

        .replace(
            /_/g,
            " "
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

}


// ==========================================
// Loading State
// ==========================================

function setLoading(
    isLoading
) {

    if (
        isLoading
    ) {

        loading.classList.remove(
            "hidden"
        );

        predictButton.disabled =
            true;

        predictButton.textContent =
            "Analyzing Symptoms...";

    } else {

        loading.classList.add(
            "hidden"
        );

        predictButton.disabled =
            false;

        predictButton.textContent =
            "🩺 Check Possible Condition";

    }

}


// ==========================================
// Show Error
// ==========================================

function showError(
    message
) {

    errorMessage.textContent =
        message;


    errorMessage.classList.remove(
        "hidden"
    );

}


// ==========================================
// Hide Error
// ==========================================

function hideError() {

    errorMessage.classList.add(
        "hidden"
    );

    errorMessage.textContent =
        "";

}


// ==========================================
// Initialize Application
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSymptoms();

        updateSelectedSymptoms();

    }
);