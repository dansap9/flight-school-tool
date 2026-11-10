export interface ParsedMetar {
    airport: string;
    visibility: number;
    ceiling: number | null;
    windDirection?: number;
    windSpeed?: number;
    raw: string;
}

export function parseMetar(
    raw: string
): ParsedMetar {

    const airport =
        raw.match(/\b([A-Z]{4})\b/)?.[1] ?? "";

    const visibility =
        parseInt(
            raw.match(/(\d+)SM/)?.[1] ?? "0"
        );

    const windMatch =
        raw.match(/(\d{3})(\d{2})KT/);

    const cloudLayers =
        [...raw.matchAll(/(BKN|OVC)(\d{3})/g)];

    const ceiling =
        cloudLayers.length > 0
            ? Math.min(
                ...cloudLayers.map(
                    c => parseInt(c[2]) * 100
                )
            )
            : null;

    return {
        airport,
        visibility,
        ceiling,

        windDirection:
            windMatch
                ? parseInt(windMatch[1])
                : undefined,

        windSpeed:
            windMatch
                ? parseInt(windMatch[2])
                : undefined,

        raw
    };
}

export function translateMetar(
    metar: ParsedMetar
) {

    let text =
`Airport: ${metar.airport}

`;

    if (
        metar.windDirection &&
        metar.windSpeed
    ) {

        text +=
`Wind:
${metar.windDirection}° at ${metar.windSpeed} kt

`;

    }

    text +=
`Visibility:
${metar.visibility} SM

`;

    text +=
`Ceiling:
${metar.ceiling ?? "No ceiling detected"} ft

`;

    return text;
}