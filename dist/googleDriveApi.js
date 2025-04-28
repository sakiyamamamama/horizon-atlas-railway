"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
exports.getFileContent = getFileContent;
exports.getSheet = getSheet;
exports.parseCSVtoJSON = parseCSVtoJSON;
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
function parseCSVtoJSON(csv) {
    const lines = csv.split("\r\n").filter(line => line.trim() !== "");
    const headers = lines[0].split(",");
    const result = lines.slice(1).map(line => {
        const values = splitCSVLine(line);
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = (values[index] || "").trim();
        });
        return obj;
    });
    return result;
}
// CSVの各行を正しく分割する（カンマを含むフィールドやダブルクオート対応）
function splitCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
            inQuotes = !inQuotes;
        }
        else if (char === ',' && !inQuotes) {
            result.push(current);
            current = "";
        }
        else {
            current += char;
        }
    }
    result.push(current);
    return result;
}
async function getFileContent(auth, fileId) {
    const drive = googleapis_1.google.drive({ version: "v3", auth });
    const res = await drive.files.export({
        fileId: fileId,
        mimeType: "text/csv",
    }, { responseType: "stream" });
    let csvData = "";
    for await (const chunk of res.data) {
        csvData += chunk.toString(); // ストリームのチャンクを文字列に変換してどんどん追加
    }
    const parsedData = parseCSVtoJSON(csvData);
    return parsedData;
}
async function getSheet(auth, fileId, sheetName) {
    const sheets = googleapis_1.google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId: fileId,
        range: sheetName,
    });
    if (res.data.values) {
        const [header, ...rows] = res.data.values;
        const parsed = rows.map(row => {
            const obj = {};
            header.forEach((key, index) => {
                obj[key] = row[index] || "";
            });
            return obj;
        });
        return parsed;
    }
    return [];
}
