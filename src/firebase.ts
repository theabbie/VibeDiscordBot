import * as admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });

  console.log('Firebase initialized successfully');
  return firebaseApp;
}

export function getDatabase() {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.database();
}
