import admin from 'firebase-admin';

// Ensure the app is only initialized once
if (!admin.apps.length) {
  try {
    // Check if the required environment variables are set
    if (
      !process.env.FIREBASE_PROJECT_ID ||
      !process.env.FIREBASE_CLIENT_EMAIL ||
      !process.env.FIREBASE_PRIVATE_KEY
    ) {
      throw new Error('Firebase environment variables are not set. Please check your .env file.');
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must be formatted correctly in the .env file.
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error);
    // Throwing the error here will prevent the app from starting
    // without a proper Firebase connection, which is safer.
    throw new Error(`Failed to initialize Firebase Admin SDK. Please check your service account credentials and the server logs for more details. Original error: ${error.message}`);
  }
}

// These are now exported after the initialization is guaranteed to have happened or thrown.
export const db = admin.firestore();
export const auth = admin.auth();
