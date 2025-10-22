// Import the Firebase Admin SDK
import * as admin from 'firebase-admin';

// Variable to hold the initialized Firebase app instance
// (prevents multiple initializations)
let firebaseApp: admin.app.App | null = null;

/**
 * Initializes Firebase Admin SDK using credentials from environment variable.
 * This function ensures Firebase is initialized only once.
 */
export function initializeFirebase() {
  // If Firebase is already initialized, return the existing instance
  if (firebaseApp) {
    return firebaseApp;
  }

  // Read the Firebase service account JSON string from environment variables
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  // If no service account is found, throw an error
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
  }

  // Parse the JSON string into an object
  const serviceAccount = JSON.parse(serviceAccountJson);

  // Initialize the Firebase Admin SDK with credentials and database URL
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });

  console.log('Firebase initialized successfully');
  return firebaseApp;
}

/**
 * Returns a reference to the Firebase Realtime Database.
 * Automatically initializes Firebase if it hasn't been initialized yet.
 */
export function getDatabase() {
  // Initialize Firebase if it hasn't been initialized yet
  if (!firebaseApp) {
    initializeFirebase();
  }

  // Return the database instance
  return admin.database();
}
