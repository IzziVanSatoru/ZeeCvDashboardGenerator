
import { createClient } from "@supabase/supabase-js";

// Inisialisasi client Supabase dari .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * 🔹 Simpan resume hasil AI ke Supabase
 * @param {string} userId - ID user dari Firebase
 * @param {string} resumeContent - Konten resume hasil AI
 */
export async function saveResume(userId, resumeContent) {
  const { data, error } = await supabase
    .from("resumes")
    .insert([
      {
        user_id: userId,
        content: resumeContent,
        created_at: new Date(),
      },
    ]);

  if (error) throw error;
  return data;
}

/**
 * 🔹 Ambil semua resume milik user
 */
export async function getUserResumes(userId) {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
