"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDiscordAccessToken = getDiscordAccessToken;
exports.getDiscordUser = getDiscordUser;
exports.createFirebaseToken = createFirebaseToken;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
}
async function getDiscordAccessToken(code, redirectUrl) {
    try {
        console.log("code", code);
        console.log("redirect", redirectUrl);
        const params = new URLSearchParams();
        params.append("client_id", process.env.DISCORD_CLIENT_ID);
        params.append("client_secret", process.env.DISCORD_CLIENT_SECRET);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", redirectUrl);
        const res = await axios_1.default.post("https://discord.com/api/oauth2/token", params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return res.data;
    }
    catch (error) {
        console.error("Error getting Discord access token:", error.response?.data || error.message);
        throw error;
    }
}
async function getDiscordUser(accessToken) {
    const res = await axios_1.default.get("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = res.data;
    return data;
}
async function createFirebaseToken(discordUser) {
    const uid = `discord:${discordUser.id}`;
    const additionalClaims = {
        discord_username: discordUser.username,
        discord_avatar: discordUser.avatar,
    };
    return await firebase_admin_1.default.auth().createCustomToken(uid, additionalClaims);
}
