"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const routes_1 = require("./routes");
const app = (0, express_1.default)();
// middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, compression_1.default)()); // compress responses to enable server-sent events
app.use((0, helmet_1.default)());
// routes
app.use("/", routes_1.helloRoutes);
app.use("/api", routes_1.apiRoutes);
app.use("/health", routes_1.healthRoute);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Upload Events service listening on ${PORT}`);
});
