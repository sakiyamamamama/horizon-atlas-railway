"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleDriveApi_1 = require("./googleDriveApi");
const cor = __importStar(require("cors"));
const DiscordApi_1 = require("./DiscordApi");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use(express_1.default.json());
const allowedOrigins = [process.env.FRONTEND_URL2, process.env.FRONTEND_URL, process.env.local_url];
app.use(cor.default({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // 許可
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.get("/", (req, res) => {
    res.send("Hello, Railway!");
});
app.get("/getDrivefile/:fileId", async (req, res) => {
    const fileId = req.params.fileId;
    const auth = await (0, googleDriveApi_1.authorize)();
    const parsedData = await (0, googleDriveApi_1.getFileContent)(auth, fileId);
    res.json(parsedData);
});
app.get("/getDriveSheet/fileId/:fileId/sheetName/:sheetName", async (req, res) => {
    const fileId = req.params.fileId;
    const sheetName = req.params.sheetName;
    const auth = await (0, googleDriveApi_1.authorize)();
    const data = await (0, googleDriveApi_1.getSheet)(auth, fileId, sheetName);
    res.json(data);
});
app.get("/getDriveSheet/getStudentNumber/name/:name", async (req, res) => {
    const name = req.params.name;
    const auth = await (0, googleDriveApi_1.authorize)();
    const fileId = "1TBsqURXWNBDKShdhjxITi2d87udMhuXeAQ0j82G-eww";
    const sheetName = "部員名簿";
    const data = await (0, googleDriveApi_1.getSheet)(auth, fileId, sheetName);
    const target = data?.find((item) => item["氏名"] === name);
    if (target) {
        res.json(target);
    }
    else {
        res.json(null);
    }
});
app.get("/getDiscordRole", async (req, res) => {
    const roleData = await (0, DiscordApi_1.getRole)();
    res.json(JSON.parse(roleData));
});
app.post("/getUserProfile", async (req, res) => {
    const { accessToken } = req.body;
    const userProfile = await (0, DiscordApi_1.getUserProfile)(accessToken);
    res.json(JSON.parse(userProfile));
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
