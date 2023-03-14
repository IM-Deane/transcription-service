"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRoute = exports.apiRoutes = exports.helloRoutes = void 0;
const hello_1 = __importDefault(require("./hello"));
exports.helloRoutes = hello_1.default;
const api_1 = __importDefault(require("./api"));
exports.apiRoutes = api_1.default;
const health_1 = __importDefault(require("./health"));
exports.healthRoute = health_1.default;
