import admin from "firebase-admin"
import axios from "axios"
import dotenv from "dotenv"

dotenv.config()

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT!);

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
}

async function getDiscordAccessToken(code:string,redirectUrl:string) {
    try {
        const params = new URLSearchParams();
        params.append("client_id", process.env.DISCORD_CLIENT_ID!);
        params.append("client_secret", process.env.DISCORD_CLIENT_SECRET!);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", redirectUrl);
    
        const res = await axios.post("https://discord.com/api/oauth2/token", params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
    
        return res.data;
      } catch (error: any) {
        console.error("Error getting Discord access token:", error.response?.data || error.message);
        throw error;
      }
}

type DiscordUser = {
    id: string;              
    username: string;          
    discriminator: string;    
    avatar: string | null;    
    bot?: boolean;            
    system?: boolean;         
    mfa_enabled?: boolean;     
    banner?: string | null;   
    accent_color?: number | null; 
    locale?: string;           
    verified?: boolean;       
    email?: string | null;     
    flags?: number;            
    premium_type?: number;     
    public_flags?: number;    
};

async function getDiscordUser(accessToken:string) {
    const res = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data:DiscordUser = res.data
    return data;
}

async function createFirebaseToken(discordUser:DiscordUser) {
    const uid = `discord:${discordUser.id}`;
    // const additionalClaims = {
    //   discord_username: discordUser.username,
    //   discord_avatar: discordUser.avatar,
    // };
    const photoUrl = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
    const firebaseToken = await admin.auth().createCustomToken(uid)
    return {firebaseToken, username:discordUser.username,avatar:photoUrl}
}

export {getDiscordAccessToken, getDiscordUser, createFirebaseToken}