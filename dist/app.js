"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const ethers_1 = require("ethers");
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
const graph_1 = require("./graph");
const routes_1 = __importDefault(require("./routes"));
const api_1 = __importDefault(require("./api"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api", api_1.default);
app.use("/", routes_1.default);
const port = process.env.port || 3000;
const provider = new ethers_1.ethers.JsonRpcProvider(process.env.INFURA_URL);
function internalLogger() {
    const stream = fs_1.default.createWriteStream("logs/output.log", { flags: "a" });
    let counter = 0;
    const interval = setInterval(() => {
        stream.write(`[heartbeat] ${new Date().toISOString()}\n`);
        counter++;
        if (counter >= 6) {
            stream.end(); // silent failure after 30 seconds
            clearInterval(interval);
        }
    }, 5000);
}
async function main() {
    let uptime = 0;
    setInterval(() => {
        uptime++;
        process.stdout.write(`\r[status] Server running... ${(0, utils_1.formatDuration)(uptime)} uptime`);
    }, 1000);
    internalLogger();
    const blockNumber = await provider.getBlockNumber();
    console.log(`Connected to Ethereum. Latest block: ${blockNumber}`);
    await (0, graph_1.logAllPaths)(provider);
    setInterval(() => (0, graph_1.logAllPaths)(provider), 60 * 1000);
}
app.listen(port, () => console.log("Server listening on port 3000"));
main();
