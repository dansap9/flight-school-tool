const button =
    document.getElementById("checkBtn");

const results =
    document.getElementById("results");

const loading =
    document.getElementById("loading");

button.addEventListener(
    "click",
    async () => {

        const airport =
            document
                .getElementById("airport")
                .value
                .trim()
                .toUpperCase();

        const category =
            document
                .getElementById("category")
                .value;

        loading.innerHTML =
            "<p>Checking weather...</p>";

        results.innerHTML = "";

        try {

            const API_URL = "https://flight-school-tool-api.onrender.com";

            const response = await fetch(
                `${API_URL}/api/check-flight?airport=${encodeURIComponent(airport)}&category=${encodeURIComponent(category)}`
            );

            const data =
                await response.json();

            loading.innerHTML = "";

            const forecastGo =
                data.forecast.length === 0;

            const currentGo =
                data.current.go;

            const visibilityMinimums = {
                white: 6,
                green: 5,
                yellow: 3
            };

            const ceilingMinimums = {
                white: 3000,
                green: 2500,
                yellow: 1500
            };

            const lowestVisibility =
                Math.min(
                    ...data.taf.periods
                        .map(p => p.visibility)
                        .filter(v => v !== undefined)
                );

            const ceilings =
                data.taf.periods
                    .map(p => p.ceiling)
                    .filter(c =>
                        c !== undefined &&
                        c !== null
                    );

            const lowestCeiling =
                ceilings.length > 0
                    ? Math.min(...ceilings)
                    : "No Ceiling";

            results.innerHTML = `

                <div class="section briefing-card">

                    <div class="status ${
                        forecastGo
                            ? "go"
                            : "nogo"
                    }">

                        ${
                            forecastGo
                                ? "GO ✅"
                                : "NO-GO ❌"
                        }

                    </div>

                    <p>
                        <strong>Airport:</strong>
                        ${airport}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${category.toUpperCase()}
                    </p>

                    <hr>

                    <p>
                        <strong>Current Conditions:</strong>
                        ${
                            currentGo
                                ? "GO ✅"
                                : "NO-GO ❌"
                        }
                    </p>

                    <p>
                        <strong>Forecast:</strong>
                        ${
                            forecastGo
                                ? "GO ✅"
                                : "NO-GO ❌"
                        }
                    </p>

                    <h3>
                        Worst Forecast Conditions
                    </h3>

                    <p>
                        <strong>Lowest Visibility:</strong>
                        ${lowestVisibility} SM
                    </p>

                    <p>
                        <strong>Lowest Ceiling:</strong>
                        ${
                            typeof lowestCeiling === "number"
                                ? `${lowestCeiling} ft`
                                : lowestCeiling
                        }
                    </p>

                    <h3>
                        Required Minimums
                    </h3>

                    <p>
                        Visibility ≥
                        ${visibilityMinimums[category]} SM
                    </p>

                    <p>
                        Ceiling ≥
                        ${ceilingMinimums[category]} ft
                    </p>

                    ${
                        !forecastGo
                        ? `
                        <div class="warning-box">

                            <strong>
                                Why is this a NO-GO?
                            </strong>

                            <ul>

                                ${
                                    data.forecast
                                        .flatMap(
                                            item =>
                                                item.reasons
                                        )
                                        .map(
                                            reason =>
                                                `<li>${reason}</li>`
                                        )
                                        .join("")
                                }

                            </ul>

                        </div>
                        `
                        : `
                        <div class="success-box">

                            Forecast conditions remain
                            above minimum requirements.

                        </div>
                        `
                    }

                </div>


                <div class="section">

                    <h2>
                        Current METAR
                    </h2>

                    <p>
                        <strong>Wind:</strong>
                        ${data.metar.windDirection ?? "-"}°
                        at
                        ${data.metar.windSpeed ?? "-"} kt
                    </p>

                    <p>
                        <strong>Visibility:</strong>
                        ${data.metar.visibility} SM
                    </p>

                    <p>
                        <strong>Ceiling:</strong>
                        ${
                            data.metar.ceiling
                                ? `${data.metar.ceiling} ft`
                                : "No ceiling detected"
                        }
                    </p>

                </div>


                <div class="section">

                    <h2>
                        Forecast TAF
                    </h2>

                    ${
                        data.taf.periods
                            .map(period => `

                            <div class="taf-period">

                                <h3>
                                ${
                                    period.day
                                        ? `${period.day} ${String(period.hour).padStart(2, "0")}${String(period.minute).padStart(2, "0")}Z`
                                        : "Initial Forecast"
                                }
                                </h3>

                                <p>
                                    <strong>Wind:</strong>
                                    ${period.windDirection ?? "-"}°
                                    at
                                    ${period.windSpeed ?? "-"} kt
                                </p>

                                <p>
                                    <strong>Visibility:</strong>
                                    ${period.visibility ?? "-"} SM
                                </p>

                                <p>
                                    <strong>Ceiling:</strong>
                                    ${
                                        period.ceiling
                                            ? `${period.ceiling} ft`
                                            : "No ceiling forecast"
                                    }
                                </p>

                                ${
                                    period.weather.length > 0
                                    ? `
                                    <p>
                                        <strong>Weather:</strong>
                                        ${period.weather.join(", ")}
                                    </p>
                                    `
                                    : ""
                                }

                            </div>

                        `)
                            .join("")
                    }

                </div>

            `;

        } catch (error) {

            console.error(error);

            loading.innerHTML = "";

            results.innerHTML = `
                <div class="section">

                    Error retrieving weather.

                </div>
            `;

        }

    }
);