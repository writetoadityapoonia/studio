
import admin from 'firebase-admin';

// To prevent initialization errors in different environments,
// we check if the app is already initialized.
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('The FIREBASE_PRIVATE_KEY environment variable is not set.');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key must have its newline characters correctly escaped.
        // The replace call below ensures that the string is parsed correctly.
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    // Throwing the error here will prevent the app from starting
    // without a proper Firebase connection, which is safer.
    throw new Error(`Failed to initialize Firebase Admin SDK. Please check your service account credentials and the server logs for more details. Original error: ${error.message}`);
  }
}

// These are now exported after the initialization is guaranteed to have happened or thrown.
export const db = admin.firestore();
export const auth = admin.auth();
