import { google, Auth } from "googleapis";
import dotenv from "dotenv";

async function authorize(): Promise<Auth.OAuth2Client> {
    dotenv.config(); 
    const client_secret = process.env.google_client_secret;
    const client_id = process.env.google_client_id;
    const redirect_url = process.env.redirect_url;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_url);
    console.log(client_id)
    console.log(client_secret)

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
  

export { authorize, getFileContent };
