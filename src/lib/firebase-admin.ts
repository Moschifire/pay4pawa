import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        // We manually build the object using the individual variables
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!privateKey) {
            throw new Error("FIREBASE_PRIVATE_KEY is missing from environment variables");
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // This replace function is crucial for Windows/Next.js to handle newlines correctly
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });

        console.log("✅ Firebase Admin initialized successfully");
    } catch (error: any) {
        console.error("❌ Firebase Admin Error:", error.message);
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();