import { google, Auth } from "googleapis";
import dotenv from "dotenv";
import { sheets } from "googleapis/build/src/apis/sheets";
dotenv.config(); 

async function authorize(): Promise<Auth.OAuth2Client> {
    const client_secret = process.env.google_client_secret;
    const client_id = process.env.google_client_id;
    const redirect_url = process.env.local_url;
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

function parseCSVtoJSON(csv: string) {
  const lines = csv.split("\r\n").filter(line => line.trim() !== "");
  const headers = lines[0].split(",");
  
  const result = lines.slice(1).map(line => {
    const values = splitCSVLine(line);
    const obj: { [key: string]: string } = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = (values[index] || "").trim();
    });
    return obj;
  });
  
  return result;
}

// CSVの各行を正しく分割する（カンマを含むフィールドやダブルクオート対応）
function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function getFileContent(auth: Auth.OAuth2Client, fileId: string) {
  const drive = google.drive({ version: "v3", auth });

  const res = await drive.files.export(
      {
      fileId: fileId,
      mimeType: "text/csv", 
      },
      { responseType: "stream" }
  );

  let csvData = "";
  for await (const chunk of res.data) {
    csvData += chunk.toString(); // ストリームのチャンクを文字列に変換してどんどん追加
  }
  const parsedData = parseCSVtoJSON(csvData)

  return parsedData
}

async function getSheet(auth: Auth.OAuth2Client, fileId: string, sheetName:string) {
  const sheets = google.sheets({version: "v4",auth})
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId:fileId,
    range: sheetName,
  })
  if(res.data.values){
    const [header, ...rows] = res.data.values
    const parsed = rows.map(row => {
      const obj: Record<string, string> = {};
      header.forEach((key, index) => {
        obj[key] = row[index] || "";
      });
      return obj;
    });
    return parsed
  }
}
  

export { authorize, getFileContent,getSheet,parseCSVtoJSON };
