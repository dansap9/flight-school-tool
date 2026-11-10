import { TafPeriod } from "../parser/taf";
import { minima } from "../rules/minima";

export function evaluateForecast(
    category: keyof typeof minima,
    periods: TafPeriod[]
) {

    const limits =
        minima[category];

    const failures = [];

    for (const period of periods) {

        const reasons: string[] = [];

        if (
            period.visibility !== undefined &&
            period.visibility < limits.visibility
        ) {

            reasons.push(
                `Visibility ${period.visibility} SM (minimum ${limits.visibility} SM)`
            );

        }

        if (
            period.ceiling !== null &&
            period.ceiling !== undefined &&
            period.ceiling < limits.ceiling
        ) {

            reasons.push(
                `Ceiling ${period.ceiling} ft (minimum ${limits.ceiling} ft)`
            );

        }

        if (reasons.length > 0) {

            failures.push({
                period,
                reasons
            });

        }

    }

    return failures;
}