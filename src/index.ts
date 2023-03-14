import express from "express";
import bodyParser from "body-parser";
import cors, { CorsOptions } from "cors";
import compression from "compression";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

import { helloRoutes, apiRoutes, healthRoute } from "./routes";

const app = express();

// TODO: Add allowed origins to env
const allowedOrigins = [process.env.PROD_ORIGIN, process.env.STAGING_ORIGIN];

if (process.env.NODE_ENV === "production") {
	allowedOrigins.push(process.env.PROD_ORIGIN);
}

const corsOptions: CorsOptions = {
	origin: "*",
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression()); // compress responses to enable server-sent events

app.use("/", helloRoutes);
app.use("/api", apiRoutes);
app.use("/health", healthRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Upload Events service listening on PORT:${PORT}`);
});
