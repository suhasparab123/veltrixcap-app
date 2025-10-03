"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const apiRouter = (0, express_1.Router)();
const LOG_PATH = path_1.default.join(__dirname, "../logs/swap_routes.json");
function readRoutes() {
    try {
        const content = fs_1.default.readFileSync(LOG_PATH, "utf-8");
        const allEntries = JSON.parse(content);
        // Only return entries from the latest timestamp
        const latestTimestamp = allEntries.reduce((acc, cur) => acc > cur.timestamp ? acc : cur.timestamp, "");
        return allEntries.filter(e => e.timestamp === latestTimestamp);
    }
    catch (err) {
        console.error("[ERROR] Failed to read or parse swap_routes.json");
        return [];
    }
}
// GET /api/routes
apiRouter.get("/routes", (req, res) => {
    const latestRoutes = readRoutes();
    res.json(latestRoutes);
});
// GET /api/routes/:from/:to
apiRouter.get("/routes/:from/:to", (req, res) => {
    const { from, to } = req.params;
    const latestRoutes = readRoutes();
    const match = latestRoutes.find(r => r.from.toUpperCase() === from.toUpperCase() &&
        r.to.toUpperCase() === to.toUpperCase());
    if (match) {
        res.json(match);
    }
    else {
        res.status(404).json({ error: "No route found for this token pair" });
    }
});
exports.default = apiRouter;
