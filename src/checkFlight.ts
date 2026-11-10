import Scraper from "./scraper/scraper";
import { parseMetar } from "./parser/metar";
import { parseTaf } from "./parser/taf";
import { evaluateFlight } from "./evaluator/goNoGo";
import { evaluateForecast } from "./evaluator/evaluateForecast";

export async function checkFlight(
    airport: string,
    category: "white" | "green" | "yellow"
) {

    const scraper = new Scraper(3);

    await scraper.init();

    const result =
        await scraper.getAerodromeReports({
            aerodromeCodes: airport,
            reports: new Set([
                "METAR",
                "TAF"
            ])
        });

    await scraper.close();

    const metar =
        result.reports.find(
            r => r.type === "METAR"
        );

    const taf =
        result.reports.find(
            r => r.type === "TAF"
        );

    if (!metar || !taf) {
        throw new Error("METAR or TAF missing");
    }

    const parsedMetar =
        parseMetar(metar.data);

    const parsedTaf =
        parseTaf(taf.data);

    return {
        airport,
        category,
        current:
            evaluateFlight(
                category,
                parsedMetar.visibility,
                parsedMetar.ceiling
            ),
        forecast:
            evaluateForecast(
                category,
                parsedTaf.periods
            ),
        metar: parsedMetar,
        taf: parsedTaf
    };
}