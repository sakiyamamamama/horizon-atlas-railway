"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = getUserProfile;
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
async function getUserProfile(accessToken) {
    const headers = {
        Authorization: `Bearer ${accessToken}`
    };
    // ① ユーザー情報取得
    const userRes = await fetch('https://discord.com/api/users/@me', { headers });
    if (!userRes.ok)
        return JSON.stringify({ "error": 'Invalid response from Discord (User)' });
    const userData = await userRes.json();
    // ② ギルド所属チェック
    const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', { headers });
    if (!guildsRes.ok)
        return JSON.stringify({ "error": 'Invalid response from Discord (Guilds)' });
    const guildsData = await guildsRes.json();
    const GUILD_ID = '1022421169770594315';
    const isMember = guildsData.some(guild => guild.id === GUILD_ID);
    if (!isMember) {
        return {
            user_id: userData.id,
            name: userData.username,
            picture: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`,
            profile: false,
            given_name: ""
        };
    }
    // ③ メンバー詳細情報取得
    const memberRes = await fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, { headers });
    if (!memberRes.ok)
        return JSON.stringify({ "error": 'Invalid response from Discord (Member Info)' });
    const memberData = await memberRes.json();
    // ④ ロール情報取得
    const roleres = await getRole();
    const roleInfo = await JSON.parse(roleres);
    // ⑤ ロールチェックして結果を返す
    const roles = memberData.roles || [];
    let given_name = '体験入部';
    if (!roleInfo.develop || !roleInfo.basic) {
        return {
            user_id: userData.id,
            name: memberData.nick,
            picture: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`,
            profile: true,
            given_name
        };
    }
    if (roles.includes(roleInfo.develop.id)) {
        given_name = '発展班';
    }
    else if (roles.includes(roleInfo.basic.id)) {
        given_name = '基礎班';
    }
    return {
        user_id: userData.id,
        name: memberData.nick,
        picture: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`,
        profile: true,
        given_name
    };
}
