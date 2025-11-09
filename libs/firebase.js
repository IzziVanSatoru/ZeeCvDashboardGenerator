import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// 🔹 Konfigurasi Firebase dari .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 🔹 Inisialisasi Firebase hanya sekali
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// ✅ Buat instance Auth
export const auth = getAuth(app);

// ✅ Provider Google untuk login
const provider = new GoogleAuthProvider();

// ✅ Function login Google (popup version)
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const token = await user.getIdToken();
  return { user, token };
};

// ✅ Export default untuk fleksibilitas
export default app;
