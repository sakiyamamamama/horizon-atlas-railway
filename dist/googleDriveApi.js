"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = authorize;
exports.getFileContent = getFileContent;
const googleapis_1 = require("googleapis");
async function authorize() {
    const client_secret = process.env.google_client_secret;
    const client_id = process.env.google_client_id;
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, "http://localhost:3000");
    oAuth2Client.setCredentials({
        access_token: process.env.access_token,
        refresh_token: process.env.refresh_token,
        scope: "https://www.googleapis.com/auth/drive.readonly",
        token_type: "Bearer",
        expiry_date: 1740651642121
    });
    return oAuth2Client;
}
async function getFileContent(auth, fileId) {
    const drive = googleapis_1.google.drive({ version: "v3", auth });
    const res = await drive.files.export({
        fileId: fileId,
        mimeType: "text/csv", // CSV形式のファイルを想定
    }, { responseType: "stream" });
    return new Promise((resolve, reject) => {
        let data = "";
        res.data.on("data", (chunk) => {
            data += chunk.toString();
        });
        res.data.on("end", () => {
            console.log("ファイルの中身を取得しました");
            resolve(data);
        });
        res.data.on("error", (err) => {
            console.error("データの取得に失敗しました", err);
            reject(err);
        });
    });
}
