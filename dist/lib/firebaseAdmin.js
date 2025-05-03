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
const getDiscordProfile_1 = require("./getDiscordProfile");
dotenv_1.default.config();
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
}
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
async function createFirebaseToken(accessToken) {
    const profile = await (0, getDiscordProfile_1.getUserProfile)(accessToken);
    if (typeof profile === "string") {
    }
    else {
        const firebaseToken = await firebase_admin_1.default.auth().createCustomToken(profile.user_id);
        return { firebaseToken, profile };
    }
}
