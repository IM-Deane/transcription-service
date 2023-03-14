import express from "express";
import bodyParser from "body-parser";
import cors, { CorsOptions } from "cors";
import compression from "compression";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

import { helloRoutes, apiRoutes, healthRoute } from "./routes";

const app = express();

const allowedOrigins = ["https://auvid-jikrsvljq-im-deane.vercel.app"];

if (process.env.NODE_ENV === "production") {
	allowedOrigins.push("https://auvid.vercel.app");
} else {
	allowedOrigins.push("http://localhost:3000");
}
const corsOptions: CorsOptions = {
	origin: allowedOrigins,
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
