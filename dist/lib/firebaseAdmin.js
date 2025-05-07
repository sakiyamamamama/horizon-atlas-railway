"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFirebaseToken = createFirebaseToken;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
const getDiscordProfile_1 = require("./getDiscordProfile");
dotenv_1.default.config();
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT);
if (!firebase_admin_1.default.apps.length) {
    firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
}
const db = firebase_admin_1.default.firestore();
async function createFirebaseToken(accessToken) {
    const profile = await (0, getDiscordProfile_1.getUserProfile)(accessToken, db);
    if (typeof profile === "string") {
        return profile;
    }
    else {
        const firebaseToken = await firebase_admin_1.default.auth().createCustomToken(profile.user_id);
        return { firebaseToken, profile };
    }
}
