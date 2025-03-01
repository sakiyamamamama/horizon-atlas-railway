"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRole = getRole;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function getRole() {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const guildId = '1022421169770594315';
    const guildInfoUrl = `https://discord.com/api/guilds/${guildId}/roles`;
    const guildRequestOptions = {
        headers: {
            'Authorization': `Bot ${BOT_TOKEN}`
        }
    };
    const res = await fetch(guildInfoUrl, guildRequestOptions);
    // Discord API のレスポンスがエラーの場合の処理
    if (!res.ok) {
        return JSON.stringify({ error: `Failed to fetch roles: ${res.status} ${res.statusText}` });
    }
    const guildInfo = await res.json();
    const basic_group = guildInfo.find(item => item.name === "基礎班");
    const dev_group = guildInfo.find(item => item.name === "発展班");
    if (!basic_group || !dev_group) {
        return JSON.stringify({ error: "Required roles not found" });
    }
    const data = {
        basic: {
            id: basic_group.id,
            name: basic_group.name
        },
        develop: {
            id: dev_group.id,
            name: dev_group.name
        }
    };
    return JSON.stringify(data);
}
;
