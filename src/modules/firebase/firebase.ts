import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load Firebase environment variables
dotenv.config();

const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Replace literal \n with actual newlines
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

// Throw error if any required env variable is missing
if (
    !firebaseConfig.privateKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.clientEmail
) {
    throw new Error('Missing Firebase environment variables');
}

// Initialize Firebase Admin
export const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    storageBucket: firebaseConfig.storageBucket,
});
