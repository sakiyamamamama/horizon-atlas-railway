import axios from "axios"

export async function getDiscordAccessToken(code:string,redirectUrl:string) {
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
    
        return {data:res.data,error:null,message:"successfully"};
      } catch (error: any) {
        console.error("Error getting Discord access token:", error.response?.data || error.message);
        return {data:null,error,message:"Discord accessTokenの取得に失敗しました"}
      }
}