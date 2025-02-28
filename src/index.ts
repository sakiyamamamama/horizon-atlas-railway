import express from "express";
import { authorize, getFileContent } from "./googleDriveApi";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, Railway with TypeScript!");
});

app.get("/getDrivefile/:fileId", async(req, res) => {
  const fileId = req.params.fileId; 
  const auth = await authorize();
  const fileContent = await getFileContent(auth,fileId)
  res.json({content:fileContent})
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

