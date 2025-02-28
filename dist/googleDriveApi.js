"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
exports.getFileContent = getFileContent;
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function authorize() {
    const client_secret = process.env.google_client_secret;
    const client_id = process.env.google_client_id;
    const redirect_url = process.env.local_url;
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_url);
    oAuth2Client.setCredentials({
        access_token: process.env.google_access_token,
        refresh_token: process.env.google_refresh_token,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        token_type: "Bearer",
        expiry_date: 1740651642121
    });
    return oAuth2Client;
}
function parseCSV(csv) {
    const lines = csv.split("\r\n").filter(line => line.trim() !== ""); // 空行を除去
    const headers = lines[0].split(","); // 1行目をヘッダーとして取得
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",");
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index] ? values[index].trim() : "";
        });
        result.push(obj);
    }
    return result;
}
async function getFileContent(auth, fileId) {
    const drive = googleapis_1.google.drive({ version: "v3", auth });
    const res = await drive.files.export({
        fileId: fileId,
        mimeType: "text/csv", // CSV形式のファイルを想定
    }, { responseType: "stream" });
    return new Promise((resolve, reject) => {
        const chunks = [];
        res.data.on("data", (chunk) => {
            chunks.push(chunk);
        });
        res.data.on("end", () => {
            const buffer = Buffer.concat(chunks);
            const content = buffer.toString("utf-8"); // UTF-8でデコード
            resolve(JSON.stringify(parseCSV(content)));
        });
        res.data.on("error", (err) => {
            reject(err);
        });
    });
}
