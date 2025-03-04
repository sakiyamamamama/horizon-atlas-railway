import express from "express";
import { authorize, getFileContent, getUserData } from "./googleDriveApi";
import * as cor from "cors";
import { getRole } from "./DiscordApi";

const app = express();
const PORT = process.env.PORT || 3000;

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
  res.send("Hello, Railway with TypeScript!");
});

app.get("/getDrivefile/:fileId", async(req, res) => {
  const fileId = req.params.fileId; 
  const auth = await authorize();
  const fileContent = JSON.parse(await getFileContent(auth,fileId))
  res.json(fileContent)
});

app.get("/getDrivefile/:fileId/userName/:nameColumn/:userName",async(req,res)=>{
  const fileId = req.params.fileId;
  const auth = await authorize();
  const fileContent = await getFileContent(auth,fileId);
  const userName = req.params.userName;
  const nameColumn = req.params.nameColumn;
  const userData = await getUserData(userName,nameColumn,fileContent);
  res.json(userData)
})

app.get("/getDiscordRole",async(req,res)=>{
  const roleData = await getRole();
  res.json(JSON.parse(roleData));
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

