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


        const response = await fetch(
            `${API_URL}/symptoms`
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load symptoms."
            );

        }


        const data =
            await response.json();


        allSymptoms =
            data.symptoms;


        displaySymptoms(
            allSymptoms
        );


    } catch (error) {

        console.error(
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

    return symptom

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


        const data =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(

                data.message
                ||
                "Prediction failed."

            );

        }


        // Display prediction

        displayResults(
            data
        );


    } catch (error) {

        console.error(
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

    document.getElementById(
        "predictedDisease"
    ).textContent =

        formatDiseaseName(
            data.predicted_disease
        );


    // ======================================
    // Confidence
    // ======================================

    document.getElementById(
        "confidence"
    ).textContent =

        `${data.confidence}%`;


    // ======================================
    // Disease Information
    // ======================================

    const information =
        data.disease_information;


    document.getElementById(
        "description"
    ).textContent =

        information.description;


    document.getElementById(
        "precautions"
    ).textContent =

        information.precautions;


    document.getElementById(
        "specialist"
    ).textContent =

        information.recommended_specialist;


    // ======================================
    // Disclaimer
    // ======================================

    document.getElementById(
        "disclaimer"
    ).textContent =

        data.disclaimer;


    // ======================================
    // Top 3 Predictions
    // ======================================

    const topPredictions =
        document.getElementById(
            "topPredictions"
        );


    topPredictions.innerHTML =
        "";


    data.top_predictions.forEach(
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


            predictionItem.innerHTML =

                `
                <span>

                    ${index + 1}.
                    ${formatDiseaseName(
                        prediction.disease
                    )}

                </span>

                <strong>

                    ${prediction.probability}%

                </strong>
                `;


            topPredictions.appendChild(
                predictionItem
            );

        }
    );


    // ======================================
    // Show Results
    // ======================================

    resultsSection.classList.remove(
        "hidden"
    );


    // Scroll to Results

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

    return disease
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