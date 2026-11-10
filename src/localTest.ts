// src/localTest.ts

import { checkFlight } from "./checkFlight";

async function main() {

    const result =
        await checkFlight(
            "CYQM",
            "white"
        );

    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );
}

main().catch(console.error);