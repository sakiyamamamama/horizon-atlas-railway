"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleDriveApi_1 = require("./googleDriveApi");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
    res.send("Hello, Railway with TypeScript!");
});
app.get("/getDrivefile/:fileId", async (req, res) => {
    const fileId = req.params.fileId;
    const auth = await (0, googleDriveApi_1.authorize)();
    const fileContent = JSON.parse(await (0, googleDriveApi_1.getFileContent)(auth, fileId));
    res.json(fileContent);
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
