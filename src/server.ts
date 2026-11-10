import express from "express";
import cors from "cors";

import { checkFlight } from "./checkFlight";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
    res.json({
        status: "ok"
    });
});

app.get("/api/check-flight", async (req, res) => {

    try {

        const airport =
            String(req.query.airport || "")
                .toUpperCase();

        const category =
            String(req.query.category || "white")
                .toLowerCase();

        const result =
            await checkFlight(
                airport,
                category as any
            );

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Unable to retrieve weather"
        });

    }

});

app.listen(
    3000,
    () =>
        console.log(
            "Server listening on port 3000"
        )
);