"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscordAccessToken = getDiscordAccessToken;
const axios_1 = __importDefault(require("axios"));
async function getDiscordAccessToken(code, redirectUrl) {
    try {
        const params = new URLSearchParams();
        params.append("client_id", process.env.DISCORD_CLIENT_ID);
        params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", redirectUrl);
        const res = await axios_1.default.post("https://discord.com/api/oauth2/token", params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return { data: res.data, error: null, message: "successfully" };
    }
    catch (error) {
        console.error("Error getting Discord access token:", error.response?.data || error.message);
        return { data: null, error, message: "Discord accessTokenの取得に失敗しました" };
    }
}
