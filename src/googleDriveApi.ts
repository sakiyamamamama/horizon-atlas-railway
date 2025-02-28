import { google, Auth } from "googleapis";
import dotenv from "dotenv";
dotenv.config(); 

async function authorize(): Promise<Auth.OAuth2Client> {
    const client_secret = process.env.google_client_secret;
    const client_id = process.env.google_client_id;
    const redirect_url = process.env.redirect_url;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_url);

    oAuth2Client.setCredentials({
            access_token:process.env.google_access_token,
            refresh_token:process.env.google_refresh_token,
            scope:"https://www.googleapis.com/auth/drive.readonly",
            token_type:"Bearer",
            expiry_date:1740651642121
    });

    return oAuth2Client; 
}

async function getFileContent(auth: Auth.OAuth2Client, fileId: string): Promise<string> {
    const drive = google.drive({ version: "v3", auth });
  
    const res = await drive.files.export(
        {
        fileId: fileId,
        mimeType: "text/csv", // CSV形式のファイルを想定
        },
        { responseType: "stream" }
    );
  
    return new Promise<string>((resolve, reject) => {
        const chunks: Buffer[] = [];
        res.data.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
        });

        res.data.on("end", () => {
            const buffer = Buffer.concat(chunks);
            const content = buffer.toString("utf-8"); // UTF-8でデコード
            resolve(content);
            });
        
            res.data.on("error", (err: any) => {
            reject(err);
            });
        });
  }
  

export { authorize, getFileContent };
