import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;

// Local system par serviceAccountKey.json available ho to use karo
const localKeyPath = path.join(__dirname, "serviceAccountKey.json");

if (fs.existsSync(localKeyPath)) {
    serviceAccount = JSON.parse(
        fs.readFileSync(localKeyPath, "utf8")
    );
} else {
    // Render / production ke liye environment variables
    serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
            ?.replace(/\\n/g, "\n")
    };
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

export { admin, db };
