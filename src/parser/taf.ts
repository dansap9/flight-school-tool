import { weatherTerms } from "./weatherTerms";

export interface TafPeriod {
    from: string;
    day?: number;
    hour?: number;
    minute?: number;

    windDirection?: number;
    windSpeed?: number;

    visibility?: number;

    ceiling?: number | null;

    weather: string[];

    raw: string;
}

export interface ParsedTaf {
    airport: string;
    periods: TafPeriod[];
    raw: string;
}

function parsePeriod(text: string): TafPeriod {

    const fmMatch =
        text.match(/^(\d{2})(\d{2})(\d{2})/);

    const day =
        fmMatch
            ? parseInt(fmMatch[1])
            : undefined;

    const hour =
        fmMatch
            ? parseInt(fmMatch[2])
            : undefined;

    const minute =
        fmMatch
            ? parseInt(fmMatch[3])
            : undefined;

    const windMatch =
        text.match(/(\d{3})(\d{2})KT/);

    const visibilityMatch =
        text.match(/(\d+)SM/);

    const cloudLayers =
        [...text.matchAll(/(BKN|OVC)(\d{3})/g)];

    const ceiling =
        cloudLayers.length > 0
            ? Math.min(
                ...cloudLayers.map(
                    layer => parseInt(layer[2]) * 100
                )
            )
            : null;

    const weather: string[] = [];

    // Handle common TAF weather explicitly
    if (text.includes("SHRASN")) {
        weather.push("Rain and Snow Showers");
    }

    if (text.includes("BR")) {
        weather.push("Mist");
    }

    // Add all remaining matches
    Object.entries(weatherTerms)
        .forEach(([code, meaning]) => {

            if (
                text.includes(code) &&
                !weather.includes(meaning)
            ) {
                weather.push(meaning);
            }

        });

    return {
        from: fmMatch?.[0] ?? "Initial Forecast",

        day,
        hour,
        minute,

        windDirection:
            windMatch
                ? parseInt(windMatch[1])
                : undefined,

        windSpeed:
            windMatch
                ? parseInt(windMatch[2])
                : undefined,

        visibility:
            text.includes("P6SM")
                ? 6
                : parseInt(
                    visibilityMatch?.[1] ?? "0"
                ),

        ceiling,

        weather,

        raw: text
    };
}

export function parseTaf(raw: string): ParsedTaf {

    const airport =
        raw.match(/^TAF\s+([A-Z]{4})/)?.[1] ?? "";

    const sections =
        raw
            .split("FM")
            .map(section => section.trim())
            .filter(Boolean);

    const periods =
        sections.map(parsePeriod);

    return {
        airport,
        periods,
        raw
    };
}

function formatTime(period: TafPeriod) {

    if (
        period.day === undefined ||
        period.hour === undefined ||
        period.minute === undefined
    ) {
        return "Initial Forecast";
    }

    return `${period.day} ${period.hour
        .toString()
        .padStart(2, "0")}${period.minute
        .toString()
        .padStart(2, "0")}Z`;
}

export function translateTaf(
    taf: ParsedTaf
) {

    let text = `Airport: ${taf.airport}\n\n`;

    taf.periods.forEach(period => {

        text +=
            `Valid From: ${formatTime(period)}\n`;

        text +=
            `--------------------------------\n`;

        if (period.windDirection) {

            text +=
                `Wind: ${period.windDirection}° at ${period.windSpeed} kt\n`;

        }

        if (period.visibility) {

            text +=
                `Visibility: ${period.visibility} SM\n`;

        }

        if (period.ceiling !== null) {

            text +=
                `Ceiling: ${period.ceiling} ft\n`;

        } else {

            text +=
                `Ceiling: No ceiling forecast\n`;

        }

        if (period.weather.length > 0) {

            text +=
                `Weather: ${period.weather.join(", ")}\n`;

        }

        text += "\n";
    });

    return text;
}