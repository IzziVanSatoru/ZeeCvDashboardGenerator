"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, loginWithGoogle } from "@/libs/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // 🔹 Cek user login (langsung dari Firebase client)
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Simpan cookie session (tanpa token Firebase)
        document.cookie = "session=true; path=/;";
        router.push("/dashboard");
      }
    });
    return () => unsub();
  }, [router]);

  const handleLogin = async () => {
    try {
      const { user } = await loginWithGoogle();
      console.log("✅ Login success:", user.email);

      // Simpan session cookie
      document.cookie = "session=true; path=/;";

      // Redirect ke dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("❌ Login failed:", err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <h1 className="text-3xl font-bold mb-6">🔥 ZeeDashboard Cv Generator Ai
        Chat gpt 4o mini
      </h1>
      <button
        onClick={handleLogin}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-lg"
      >
        Sign in with Google
      </button>
    </div>
  );
}
