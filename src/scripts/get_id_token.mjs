import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const email = process.env.TEST_EMAIL;
const password = process.env.TEST_PASSWORD;

if (!email || !password) {
  console.error("Falta TEST_EMAIL o TEST_PASSWORD en variables de entorno.");
  process.exit(1);
}

// ⚠️ Pon aquí TU firebaseConfig del proyecto (Firebase Console -> Project settings -> General -> Your apps -> Firebase SDK snippet)
const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const cred = await signInWithEmailAndPassword(auth, email, password);
const token = await cred.user.getIdToken(true);

console.log(token);
