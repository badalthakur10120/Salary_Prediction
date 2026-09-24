// ===============================
// API CONFIGURATION
// ===============================

const API_URL =
    "https://five-contracts-org-aims.trycloudflare.com";
const API_KEY = "salary-ai-2026-demo-key";


// ===============================
// DOM ELEMENTS
// ===============================

const ageInput = document.getElementById("age");
const genderInput = document.getElementById("gender");
const educationInput = document.getElementById("education");
const jobTitleInput = document.getElementById("jobTitle");
const experienceInput = document.getElementById("experience");

const predictButton = document.getElementById("predictButton");

const salaryElement = document.getElementById("salary");
const salaryBandElement = document.getElementById("salaryBand");
const modelElement = document.getElementById("model");
const predictionTimeElement = document.getElementById("predictionTime");
const inputSummaryElement = document.getElementById("inputSummary");
const explanationList = document.getElementById("explanationList");
const highestSalaryElement =
   document.getElementById("highestSalary");

const commonBandElement =
   document.getElementById("commonBand");

const predictionCountElement =
    document.getElementById("predictionCount");

const averageSalaryElement =
    document.getElementById("averageSalary");

const historyBody =
    document.getElementById("historyBody");

const clearHistoryButton =
    document.getElementById("clearHistoryButton");

const bandChartCanvas =
    document.getElementById("bandChart");

let bandChart;


// ===============================
// LOCAL STORAGE
// ===============================

const HISTORY_KEY = "salaryHistory";


// ===============================
// SAVE PREDICTION
// ===============================

function savePrediction(prediction) {

    const history =
        JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

    history.unshift(prediction);

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );
}


// ===============================
// UPDATE PREDICTION DISTRIBUTION
// ===============================

function updateBandChart() {

    const history =
        JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

    let low = 0;
    let medium = 0;
    let high = 0;

    history.forEach(item => {

        if (item.salaryBand === "Low") {
            low++;
        }

        else if (item.salaryBand === "Medium") {
            medium++;
        }

        else if (item.salaryBand === "High") {
            high++;
        }

    });


    if (bandChart) {
        bandChart.destroy();
    }


    bandChart = new Chart(
        bandChartCanvas,
        {
            type: "doughnut",

            data: {
                labels: [
                    "Low",
                    "Medium",
                    "High"
                ],

                datasets: [
                    {
                        data: [
                            low,
                            medium,
                            high
                        ]
                    }
                ]
            },

            options: {
                responsive: true,

                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        }
    );
}


// ===============================
// LOAD HISTORY
// ===============================

function loadHistory() {

   const history =
      JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

   historyBody.innerHTML = "";

   let totalSalary = 0;

   history.forEach(item => {

      totalSalary += Number(item.salary);

      const row = document.createElement("tr");

      row.innerHTML = `
         <td>${item.timestamp || "-"}</td>

         <td>${item.age}</td>

         <td>${item.gender}</td>

         <td>${item.education}</td>

         <td>${item.jobTitle}</td>

         <td>${item.experience} years</td>

         <td>
            ₹${Number(item.salary).toLocaleString("en-IN")}
         </td>

         <td>
            <span class="history-band ${getHistoryBandClass(item.salaryBand)}">
               ${item.salaryBand}
            </span>
         </td>

         <td>${item.model || "Random Forest"}</td>

         <td>${item.predictionTime || "-"} sec</td>
      `;

      historyBody.appendChild(row);
   });

   predictionCountElement.textContent = history.length;
   /* Highest predicted salary */

if (history.length > 0) {

   const highestSalary = Math.max(
      ...history.map(item => Number(item.salary))
   );

   highestSalaryElement.textContent =
      "₹" +
      Math.round(highestSalary).toLocaleString("en-IN");

} else {

   highestSalaryElement.textContent = "₹0";
}


/* Most common salary band */

if (history.length > 0) {

   const bandCounts = {
      Low: 0,
      Medium: 0,
      High: 0
   };

   history.forEach(item => {

      if (bandCounts[item.salaryBand] !== undefined) {
         bandCounts[item.salaryBand]++;
      }

   });

   const mostCommonBand =
      Object.keys(bandCounts).reduce((a, b) =>
         bandCounts[a] >= bandCounts[b] ? a : b
      );

   commonBandElement.textContent =
      mostCommonBand;

} else {

   commonBandElement.textContent = "-";
}

   if (history.length > 0) {

      const average =
         totalSalary / history.length;

      averageSalaryElement.textContent =
         "₹" +
         Math.round(average).toLocaleString("en-IN");

   } else {

      averageSalaryElement.textContent = "₹0";
   }

   updateBandChart();
}
function getHistoryBandClass(band) {

   if (band === "Low") {
      return "history-low";
   }

   if (band === "Medium") {
      return "history-medium";
   }

   if (band === "High") {
      return "history-high";
   }

   return "";
}

// ===============================
// CLEAR HISTORY
// ===============================

clearHistoryButton.addEventListener(
    "click",
    function () {

        localStorage.removeItem(HISTORY_KEY);

        loadHistory();

    }
);


// ===============================
// PREDICT SALARY
// ===============================

predictButton.addEventListener(
    "click",
    async function () {

        const age =
            Number(ageInput.value);

        const gender =
            genderInput.value;

        const education =
            educationInput.value;

        const jobTitle =
            jobTitleInput.value.trim();

        const experience =
            Number(experienceInput.value);


        // ===============================
// INPUT VALIDATION
// ===============================

if (
    !Number.isFinite(age) ||
    age < 21 ||
    age > 62
) {

    alert(
        "Please enter an age between 21 and 62."
    );

    ageInput.focus();

    return;
}


if (!jobTitle) {

    alert(
        "Please enter a job title."
    );

    jobTitleInput.focus();

    return;
}


if (
    !Number.isFinite(experience) ||
    experience < 0 ||
    experience > 34
) {

    alert(
        "Please enter experience between 0 and 34 years."
    );

    experienceInput.focus();

    return;
}


// Experience should not exceed age minus 18
if (experience > age - 18) {

    alert(
        "Years of experience cannot be greater than your age minus 18."
    );

    experienceInput.focus();

    return;
}


        // ===============================
        // BUTTON STATE
        // ===============================

        predictButton.disabled = true;

        predictButton.textContent =
            "Predicting...";


        const startTime =
            performance.now();


        try {

            // ===============================
            // API REQUEST
            // ===============================

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "x-api-key":
                                API_KEY
                        },

                        body: JSON.stringify(
                            {
                                Age: age,

                                Gender: gender,

                                Education_Level:
                                    education,

                                Job_Title:
                                    jobTitle,

                                Years_of_Experience:
                                    experience
                            }
                        )
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `API Error: ${response.status}`
                );

            }


            const data =
                await response.json();


            // ===============================
            // PREDICTION TIME
            // ===============================

            const endTime =
                performance.now();

            const predictionTime =
                ((endTime - startTime) / 1000)
                    .toFixed(2);


            // ===============================
            // DISPLAY SALARY
            // ===============================

            salaryElement.textContent =
                "₹" +
                Number(
                    data.predicted_salary
                ).toLocaleString("en-IN", {
                    maximumFractionDigits: 0
                });


            // ===============================
            // DYNAMIC SALARY BADGE
            // ===============================

            salaryBandElement.textContent =
                data.salary_band;

            salaryBandElement.className =
                "salary-badge";


            if (
                data.salary_band === "Low"
            ) {

                salaryBandElement.classList.add(
                    "salary-low"
                );

            }

            else if (
                data.salary_band === "Medium"
            ) {

                salaryBandElement.classList.add(
                    "salary-medium"
                );

            }

            else if (
                data.salary_band === "High"
            ) {

                salaryBandElement.classList.add(
                    "salary-high"
                );

            }


            // ===============================
            // MODEL
            // ===============================

            modelElement.textContent =
                data.model;


            // ===============================
            // PREDICTION TIME
            // ===============================

            predictionTimeElement.textContent =
                predictionTime +
                " seconds";


            // ===============================
            // INPUT SUMMARY
            // ===============================

            inputSummaryElement.innerHTML = `
                <strong>Age:</strong> ${age}<br>
                <strong>Gender:</strong> ${gender}<br>
                <strong>Education:</strong> ${education}<br>
                <strong>Job Title:</strong> ${jobTitle}<br>
                <strong>Experience:</strong> ${experience} years
            `;
            let experienceExplanation = "";

if (experience >= 10) {
   experienceExplanation = "High years of experience strongly influenced the predicted salary.";
} else if (experience >= 5) {
   experienceExplanation = "Your years of experience contributed significantly to the prediction.";
} else {
   experienceExplanation = "The relatively early career experience level was considered in the prediction.";
}

let educationExplanation = "";

if (education === "PhD") {
   educationExplanation = "PhD-level education was included as an important qualification feature.";
} else if (education === "Master's") {
   educationExplanation = "A Master's degree was included as an advanced qualification feature.";
} else if (education === "Bachelor's") {
   educationExplanation = "A Bachelor's degree was included as the education feature.";
} else {
   educationExplanation = "High School education level was included in the model input.";
}

explanationList.innerHTML = `
   <li>${experienceExplanation}</li>
   <li>${educationExplanation}</li>
   <li>The ${jobTitle} job role was considered by the Random Forest model.</li>
   <li>Age and other supplied employee attributes were also considered.</li>
   <li>The prediction was generated using the Random Forest regression model.</li>
`;


            // ===============================
            // SAVE HISTORY
            // ===============================

            savePrediction({

                age: age,

                gender: gender,

                education: education,

                jobTitle: jobTitle,

                experience: experience,

                salary:
                    data.predicted_salary,

                salaryBand:
                    data.salary_band,

                model:
                    data.model,

                predictionTime:
                    predictionTime,

                timestamp:
                    new Date().toLocaleString(
                        "en-IN"
                    )

            });


            // ===============================
            // REFRESH HISTORY
            // ===============================

            loadHistory();


        }

        catch (error) {

            console.error(
                "Prediction error:",
                error
            );


            alert(
                "Unable to connect to the Salary Prediction API.\n\n" +
                "Please make sure your Google Colab API and Cloudflare tunnel are running."
            );

        }

        finally {

            predictButton.disabled =
                false;

            predictButton.textContent =
                "Predict Salary";

        }

    }
);


// ===============================
// MODEL PERFORMANCE CHARTS
// ===============================

new Chart(
    document.getElementById("maeChart"),
    {
        type: "bar",

        data: {
            labels: [
                "Linear Regression",
                "Random Forest"
            ],

            datasets: [
                {
                    label: "MAE",

                    data: [
                        16375.45,
                        10188.47
                    ]
                }
            ]
        },

        options: {
            responsive: true,

            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    }
);


new Chart(
    document.getElementById("rmseChart"),
    {
        type: "bar",

        data: {
            labels: [
                "Linear Regression",
                "Random Forest"
            ],

            datasets: [
                {
                    label: "RMSE",

                    data: [
                        22445.93,
                        16525.38
                    ]
                }
            ]
        },

        options: {
            responsive: true,

            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    }
);


new Chart(
    document.getElementById("r2Chart"),
    {
        type: "bar",

        data: {
            labels: [
                "Linear Regression",
                "Random Forest"
            ],

            datasets: [
                {
                    label: "R² Score",

                    data: [
                        0.8231,
                        0.9041
                    ]
                }
            ]
        },

        options: {
            responsive: true,

            scales: {
                y: {
                    beginAtZero: true,

                    max: 1
                }
            }
        }
    }
);


// ===============================
// FEATURE IMPORTANCE
// ===============================

new Chart(
    document.getElementById("featureChart"),
    {
        type: "bar",

        data: {
            labels: [
                "Years Experience",
                "Age",
                "Data Scientist",
                "Data Analyst",
                "Software Engineer",
                "Product Manager",
                "Full Stack Engineer",
                "Bachelor's",
                "PhD",
                "Master's",
                "Senior Software Engineer",
                "Software Engineer Manager"
            ],

            datasets: [
                {
                    label: "Feature Importance",

                    data: [
                        0.745216,
                        0.069411,
                        0.023056,
                        0.020881,
                        0.018112,
                        0.013362,
                        0.009684,
                        0.008461,
                        0.006792,
                        0.006154,
                        0.006139,
                        0.005871
                    ]
                }
            ]
        },

        options: {

            indexAxis: "y",

            responsive: true,

            scales: {
                x: {
                    beginAtZero: true
                }
            }
        }
    }
);

// ===============================
// API STATUS CHECK
// ===============================

async function checkAPIStatus() {

    const apiStatus =
        document.getElementById("apiStatus");

    if (!apiStatus) {
        return;
    }

    try {

        const response =
            await fetch(
                API_URL.replace("/predict", "/"),
                {
                    method: "GET"
                }
            );

        if (response.ok) {

            apiStatus.textContent =
                "🟢 API Connected";

            apiStatus.className =
                "api-status api-connected";

        } else {

            throw new Error("API Offline");

        }

    } catch (error) {

        apiStatus.textContent =
            "🔴 API Offline";

        apiStatus.className =
            "api-status api-offline";
    }
}

checkAPIStatus();


// ===============================
// LOAD SAVED HISTORY
// ===============================

loadHistory();