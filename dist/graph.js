"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAllPaths = logAllPaths;
const graphology_1 = require("graphology");
const constant_1 = require("./constant");
const utils_1 = require("./utils");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const TOKENS = Object.keys(constant_1.chainlinkFeeds);
const LOG_PATH = path_1.default.join(__dirname, "../logs/swap_routes.json");
async function buildGraph(provider) {
    const tokenPairs = [
        ["ETH", "USDC", 0.003], ["USDC", "DAI", 0.001], ["ETH", "DAI", 0.004],
        ["ETH", "LINK", 0.003], ["LINK", "DAI", 0.002], ["ETH", "WBTC", 0.002],
        ["WBTC", "DAI", 0.003], ["UNI", "DAI", 0.002], ["ETH", "UNI", 0.003]
    ];
    const graph = new graphology_1.DirectedGraph();
    for (const token of TOKENS)
        graph.addNode(token);
    for (const [from, to, fee] of tokenPairs) {
        const rate = await (0, utils_1.getLiveRate)(from, to, provider);
        if (rate && rate > 0) {
            graph.addEdge(from, to, { weight: -Math.log(rate * (1 - fee)) });
        }
    }
    return graph;
}
function findBestSwapPath(graph, fromToken, toToken, amount) {
    const tokens = graph.nodes();
    const distances = {};
    const predecessors = {};
    tokens.forEach((token) => {
        distances[token] = Infinity;
        predecessors[token] = null;
    });
    distances[fromToken] = 0;
    for (let i = 0; i < tokens.length - 1; i++) {
        for (const edge of graph.edges()) {
            const from = graph.source(edge);
            const to = graph.target(edge);
            const weight = graph.getEdgeAttribute(edge, 'weight');
            if (distances[from] + weight < distances[to]) {
                distances[to] = distances[from] + weight;
                predecessors[to] = from;
            }
        }
    }
    const path = [];
    let current = toToken;
    while (current) {
        path.unshift(current);
        current = predecessors[current];
    }
    if (path[0] !== fromToken) {
        return { path: [], amount: 0 };
    }
    const outputAmount = amount * Math.exp(-distances[toToken]);
    return { path, amount: outputAmount };
}
async function logAllPaths(provider) {
    const g = await buildGraph(provider);
    const entries = [];
    const timestamp = new Date().toISOString();
    for (const from of TOKENS) {
        for (const to of TOKENS) {
            if (from === to)
                continue;
            const { path, amount } = findBestSwapPath(g, from, to, 1);
            if (path.length > 1) {
                entries.push({ timestamp, from, to, path, output: Number(amount.toFixed(6)) });
            }
        }
    }
    let previous = [];
    if (fs_1.default.existsSync(LOG_PATH)) {
        try {
            previous = JSON.parse(fs_1.default.readFileSync(LOG_PATH, "utf-8"));
        }
        catch (e) {
            console.error("[ERROR] Failed to parse existing swap_routes.json:", e.message);
        }
    }
    previous.push(...entries);
    fs_1.default.writeFileSync(LOG_PATH, JSON.stringify(previous, null, 2));
    console.log(`[INFO] Logged ${entries.length} swap paths at ${timestamp}`);
}
