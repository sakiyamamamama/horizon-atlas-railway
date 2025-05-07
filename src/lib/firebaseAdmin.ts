import admin from "firebase-admin"
import dotenv from "dotenv"
import { getUserProfile } from "./getDiscordProfile";

dotenv.config()

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT!);

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

async function createFirebaseToken(accessToken:string) {
    const profile = await getUserProfile(accessToken,db)
    if(typeof profile==="string"){
        return profile
    }else{
        const firebaseToken = await admin.auth().createCustomToken(profile.user_id)
        return {firebaseToken,profile}
    }
}

export {createFirebaseToken}