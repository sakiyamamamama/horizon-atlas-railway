import express from "express";
import { authorize, getFileContent, getSheet } from "./googleDriveApi";
import * as cor from "cors";
import { getRole, getUserProfile } from "./DiscordApi";
import { createFirebaseToken } from "./lib/firebaseAdmin";
import { getDiscordAccessToken } from "./lib/getDiscordAccessToken";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const allowedOrigins = [process.env.FRONTEND_URL2, process.env.FRONTEND_URL, process.env.local_url];

app.use(cor.default({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // 許可
    } else {
      callback(new Error("Not allowed by CORS")); 
    }
  },
  credentials: true 
}));

app.get("/", (req, res) => {
  res.send("Hello, Railway!");
});

app.get("/getDrivefile/:fileId", async(req, res) => {
  const fileId = req.params.fileId; 
  const auth = await authorize();
  const parsedData = await getFileContent(auth,fileId)
  res.json(parsedData)
});

app.get("/getDriveSheet/fileId/:fileId/sheetName/:sheetName/studentNumber/:studentNumber",async(req,res)=>{
  const studentNumber = req.params.studentNumber;
  const fileId = req.params.fileId;
  const sheetName = req.params.sheetName;
  const auth = await authorize();
  const data = await getSheet(auth,fileId,sheetName);
  const target = data.find((item)=>item["学籍番号"]===studentNumber)
  if(!target){
    const empData:Record<string, string> = Object.fromEntries(
      Object.keys(data[0]).map((key) => [key, ""])
    );
    res.status(200).json(empData)
  }else{
    res.status(200).json(target)
  }
})

app.get("/getDriveSheet/fileId/:fileId/sheetName/:sheetName",async(req,res)=>{
  const fileId = req.params.fileId;
  const sheetName = req.params.sheetName;
  const auth = await authorize();
  const data = await getSheet(auth,fileId,sheetName)
  res.json(data)
})

app.get("/getDriveSheet/getStudentNumber/name/:name",async(req,res)=>{
  const name = req.params.name;
  const auth = await authorize();
  const fileId = "1TBsqURXWNBDKShdhjxITi2d87udMhuXeAQ0j82G-eww"
  const sheetName = "部員名簿";
  const data = await getSheet(auth,fileId,sheetName)
  const target = data.find((item)=>item["氏名"] === name)
  if(target){
    res.json(target)
  }else{
    res.json(null)
  }
})

app.get("/getDiscordRole",async(req,res)=>{
  const roleData = await getRole();
  res.json(JSON.parse(roleData));
})

app.post("/getUserProfile",async(req,res)=>{
  const { accessToken } = req.body;
  const userProfile = await getUserProfile(accessToken);
  res.json(JSON.parse(userProfile))
})

app.post("/auth/discord", async (req, res) => {
  const { code,redirectUrl } = req.body;
  if(!code){
    console.error("codeを取得できませんでした")
    res.status(500).json({error:"codeを取得できませんでした"})
  }
  if(!redirectUrl){
    console.error("redirect urlを取得できませんでした")
    res.status(500).json({error:"リダイレクトURLを取得できませんでした"})
  }

  if(code && redirectUrl){
    try {
      const tokenData = await getDiscordAccessToken(code,redirectUrl);
      if(tokenData.error){
        console.error(tokenData.message)
        res.status(500).json({error:tokenData.message})
      }
      if(tokenData.data){
        const firebaseToken = await createFirebaseToken(tokenData.data.access_token);
        if(typeof firebaseToken==="string"){
          console.error(firebaseToken)
          res.status(500).json({error:firebaseToken})
        }else{
          res.status(200).json(firebaseToken);
        }
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "認証エラー" });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
