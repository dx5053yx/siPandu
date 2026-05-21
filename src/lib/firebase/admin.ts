import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function getPrivateKey(): string | undefined {
  return process.env.FIREBASE_PRIVATE_KEY?.replaceAll('\\n', '\n');
}

function initAdmin() {
  if (getApps().length > 0) return;

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: getPrivateKey(),
  };

  initializeApp({ credential: cert(serviceAccount) });
}

export function getAdminDb() {
  initAdmin();
  return getFirestore();
}

export function getAdminAuth() {
  initAdmin();
  return getAuth();
}
