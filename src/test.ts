import Scraper from "./scraper/scraper";

import {
    parseMetar,
    translateMetar
} from "./parser/metar";

import {
    parseTaf,
    translateTaf
} from "./parser/taf";

import {
    evaluateFlight
} from "./evaluator/goNoGo";

import {
    evaluateForecast
} from "./evaluator/evaluateForecast";

async function main() {

    const studentCategory = "white";

    const scraper = new Scraper(3);

    await scraper.init();

    const result =
        await scraper.getAerodromeReports({
            aerodromeCodes: "CYQM",
            reports: new Set([
                "METAR",
                "TAF"
            ])
        });

    const metar =
        result.reports.find(
            r => r.type === "METAR"
        );

    const taf =
        result.reports.find(
            r => r.type === "TAF"
        );

    if (!metar || !taf) {

        throw new Error(
            "METAR or TAF missing"
        );

    }

    const parsedMetar =
        parseMetar(metar.data);

    const parsedTaf =
        parseTaf(taf.data);

    console.log(
        "================================"
    );

    console.log(
        "FLIGHT STUDENT WEATHER CHECK"
    );

    console.log(
        "================================\n"
    );

    console.log(
        `Student Category: ${studentCategory.toUpperCase()}`
    );

    console.log(
        `Airport: ${parsedMetar.airport}\n`
    );

    console.log(
        translateMetar(parsedMetar)
    );

    console.log(
        translateTaf(parsedTaf)
    );

    const currentDecision =
        evaluateFlight(
            studentCategory as any,
            parsedMetar.visibility,
            parsedMetar.ceiling
        );

    const forecastFailures =
        evaluateForecast(
            studentCategory as any,
            parsedTaf.periods
        );

    console.log("\nCURRENT CONDITIONS");

    if (currentDecision.go) {

        console.log("GO ✅");

    } else {

        console.log("NO-GO ❌");

        currentDecision.reasons.forEach(
            reason => console.log(reason)
        );

    }

    console.log("\nFORECAST ANALYSIS");

    if (
        forecastFailures.length === 0
    ) {

        console.log(
            "Forecast is GO ✅"
        );

    } else {

        console.log(
            "Forecast is NO-GO ❌"
        );

        forecastFailures.forEach(
            failure => {

                if (
                    failure.period.day !== undefined &&
                    failure.period.hour !== undefined &&
                    failure.period.minute !== undefined
                ) {

                    console.log(
                        `\n${failure.period.day} ${failure.period.hour
                            .toString()
                            .padStart(2, "0")}${failure.period.minute
                            .toString()
                            .padStart(2, "0")}Z`
                    );

                } else {

                    console.log(
                        "\nInitial Forecast"
                    );

                }

                failure.reasons.forEach(
                    reason =>
                        console.log(
                            ` - ${reason}`
                        )
                );

            }
        );

    }

    await scraper.close();
}

main().catch(console.error);