import { minima } from "../rules/minima";

export function evaluateFlight(
    category: keyof typeof minima,
    visibility: number,
    ceiling: number | null
) {

    const reasons: string[] = [];

    const limits = minima[category];

    if (visibility < limits.visibility) {
        reasons.push(
            `Visibility below minimum (${visibility}SM)`
        );
    }

    if (
        ceiling !== null &&
        ceiling < limits.ceiling
    ) {
        reasons.push(
            `Ceiling below minimum (${ceiling}ft)`
        );
    }

    return {
        go: reasons.length === 0,
        reasons
    };
}