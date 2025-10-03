"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDuration = formatDuration;
exports.getLiveRate = getLiveRate;
const constant_1 = require("./constant");
const ethers_1 = require("ethers");
function formatDuration(seconds) {
    const d = Math.floor(seconds / 86400), h = Math.floor((seconds % 86400) / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
    return `${d > 0 ? `${d}d ` : ""}${h > 0 ? `${h}h ` : ""}${m > 0 ? `${m}m ` : ""}${s > 0 ? `${s}s ` : ""}`.trim();
}
async function getLivePrice(symbol, provider) {
    try {
        const feed = constant_1.chainlinkFeeds[symbol];
        const abi = ["function latestAnswer() view returns (int256)"];
        const contract = new ethers_1.ethers.Contract(feed.address, abi, provider);
        const raw = await contract.latestAnswer();
        return Number(raw) / 10 ** feed.decimals;
    }
    catch (err) {
        console.error(`[ERROR] ${symbol} price fetch failed: ${err.message}`);
        return null;
    }
}
async function getLiveRate(from, to, provider) {
    const p1 = await getLivePrice(from, provider);
    const p2 = await getLivePrice(to, provider);
    if (!p1 || !p2)
        return null;
    return p2 / p1;
}
