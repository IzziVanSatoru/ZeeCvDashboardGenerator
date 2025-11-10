"use client";
export const dynamic = "force-dynamic"; // ✅ Fix build error di Vercel

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function DashboardContent() {
  const [formData, setFormData] = useState({
    nama: "",
    telepon: "",
    email: "",
    linkedin: "",
    profil: "",
    pendidikan: "",
    pengalaman: "",
    keahlian: "",
    sertifikat: "",
    proyek: "",
    referensi: "",
  });

  const [generatedCV, setGeneratedCV] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [editedContent, setEditedContent] = useState("");
  const [history, setHistory] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // === LOGOUT FEATURE ===
  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah anda ingin keluar?");
    if (confirmLogout) {
      const confirmFinal = prompt('Ketik "For real" untuk keluar atau "Nah ah" untuk batal:');
      if (confirmFinal?.toLowerCase() === "for real") {
        alert("👋 Anda telah keluar.");
        router.push("/");
      } else {
        alert("👍 Oke, Anda tetap di sini.");
      }
    }
  };

  // === LOAD CV DARI LINK ===
  useEffect(() => {
    const sharedCV = searchParams.get("cv");
    if (sharedCV) {
      try {
        const decoded = decodeURIComponent(atob(sharedCV));
        setGeneratedCV(decoded);
        setEditedContent(decoded);
        alert("📄 CV dari link berhasil dimuat!");
      } catch {
        console.error("Gagal decode CV dari link.");
      }
    }
  }, [searchParams]);

  // === RESET LOCAL STORAGE SAAT REFRESH ===
  useEffect(() => {
    localStorage.removeItem("ai_cv_memory");
    const saved = localStorage.getItem("manual_saved_cv_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // === SIMPAN KE CACHE (FEEDBACK MEMORY AI) ===
  const saveToCache = (text) => {
    const newCache = [...recommendations, text].slice(-5);
    setRecommendations(newCache);
    localStorage.setItem("ai_cv_memory", JSON.stringify(newCache));
  };

  // === GENERATE CV ===
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_KEY;
      if (!apiKey) throw new Error("API key tidak ditemukan di .env.local");

      const filledFormData = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, v?.trim() || ""])
      );

      const kontakHTML =
        `
        <div class="contact-info" style="text-align:center; font-size:14px; color:#374151; margin-bottom:20px;">
          ${[
            filledFormData.telepon && `<span>Telepon: ${filledFormData.telepon}</span>`,
            filledFormData.email && `<span>Email: ${filledFormData.email}</span>`,
            filledFormData.linkedin && `<span>LinkedIn: ${filledFormData.linkedin}</span>`,
          ].filter(Boolean).join(" | ")}
        </div>
      ` || "";

      const contextMemory = recommendations.join("\n");

      const prompt = `
Kamu adalah AI pembuat CV profesional, hasilnya rapi, elegan, tidak berlebihan.

Instruksi:
- Gunakan <h1> hanya untuk Nama.
- Setelah <h1>, tampilkan kontak (Telepon | Email | LinkedIn) hanya satu baris, tanpa duplikat.
- Gunakan <h3> untuk judul bagian (Profil, Pendidikan, Pengalaman, dll).
- Gunakan <p> untuk isi setiap bagian.
- Jangan tampilkan bagian kosong.
- Bahasa formal dan profesional.

Data pengguna:
${JSON.stringify(filledFormData, null, 2)}

Memori AI sebelumnya:
${contextMemory}
`;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Kamu adalah AI pembuat Curriculum Vitae profesional dan tidak menduplikasi bagian kontak.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status} - Gagal memuat.`);

      const data = await res.json();
      let result = data?.choices?.[0]?.message?.content || "";
      result = result.replace(/```html|```/g, "").trim();

      // 🔧 Bersihkan duplikasi kontak
      result = result
        .replace(/Informasi Kontak:|Kontak:/gi, "")
        .replace(/<div class="contact-info"[\s\S]*?<\/div>/gi, "")
        .replace(/<p>.*?(Telepon|Email|LinkedIn).*?<\/p>/gi, "");

      // Sisipkan kontak yang benar setelah nama
      result = result.replace(/(<h1[^>]*>.*?<\/h1>)/i, `$1${kontakHTML}`);

      setGeneratedCV(result);
      setEditedContent(result);
      saveToCache(result);
    } catch (error) {
      console.error("❌ Error Generate:", error);
      setGeneratedCV(`<p class='text-red-600'>${error.message}</p>`);
    } finally {
      setLoading(false);
    }
  };

  // === DOWNLOAD PDF MANUAL (LEBIH RAPIH DAN PROFESIONAL) ===
  const handleDownloadPDF = () => {
    const cvElement = document.getElementById("cv-preview-content");
    if (!cvElement) return alert("CV belum tersedia untuk diunduh.");

    const content = `
      <html>
        <head>
          <meta charset="UTF-8"/>
          <title>${formData.nama || "CV"}</title>
          <style>
            @page { size: A4 portrait; margin: 18mm; }
            body {
              font-family: 'Calibri', 'Segoe UI', sans-serif;
              background: #fff; color: #111827;
              display: flex; flex-direction: column; align-items: center;
            }
            h1 { text-align:center; font-size:26px; margin-bottom:4px; color:#1f2937; }
            h1::after {
              content:""; display:block; width:90px; height:2.5px; background:#2563eb;
              margin:8px auto 16px; border-radius:6px;
            }
            .contact-info { text-align:center; font-size:13px; color:#374151; margin-bottom:18px; }
            h3 {
              color:#1d4ed8; font-size:17px; font-weight:600;
              border-bottom:2px solid #93c5fd; margin-top:20px; margin-bottom:6px;
              padding-bottom:3px; text-transform:uppercase;
            }
            p { font-size:13.5px; margin:4px 0; color:#1f2937; text-align:justify; }
            #cv-wrapper { width:85%; max-width:680px; margin:0 auto; }
            footer, .no-print { display:none !important; }
          </style>
        </head>
        <body><div id="cv-wrapper">${cvElement.innerHTML}</div></body>
      </html>
    `;

    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      const win = iframe.contentWindow;
      win.focus();
      win.print();
    };
  };

  // === MANUAL SAVE ===
  const handleManualSave = () => {
    if (!editedContent) return alert("Tidak ada CV yang bisa disimpan.");
    const newHistory = [
      { id: Date.now(), content: editedContent, date: new Date().toLocaleString() },
      ...history,
    ].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem("manual_saved_cv_history", JSON.stringify(newHistory));
    alert("✅ CV berhasil disimpan ke history lokal.");
  };

  // === HAPUS RIWAYAT ===
  const handleClearHistory = () => {
    localStorage.removeItem("manual_saved_cv_history");
    setHistory([]);
    alert("🗑️ Semua riwayat manual berhasil dihapus.");
  };

  // === LOAD HISTORY / SHARE ===
  const handleUseHistory = (item) => {
    setGeneratedCV(item.content);
    setEditedContent(item.content);
    alert("✅ CV dari history berhasil dimuat.");
  };
  const handleShareLink = (item) => {
    const link = `${window.location.origin}/dashboard?cv=${btoa(
      encodeURIComponent(item.content)
    )}`;
    navigator.clipboard.writeText(link);
    alert("🔗 Link share berhasil disalin:\n" + link);
  };

  // === UI ===
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4 relative">
      <button
        onClick={handleLogout}
        className="absolute top-4 right-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md"
      >
        Logout
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        Dashboard CV Generator Interaktif V2.0
      </h1>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-7xl">
        {/* FORM INPUT */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Data Diri</h2>

          {["nama", "telepon", "email", "linkedin"].map((key) => (
            <input
              key={key}
              type={key === "email" ? "email" : "text"}
              placeholder={key.replace(/^\w/, (c) => c.toUpperCase())}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-sm focus:ring-2 focus:ring-blue-500"
              value={formData[key]}
              onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
            />
          ))}

          <h2 className="text-xl font-semibold text-blue-800 mt-6 mb-3">
            Informasi Tambahan
          </h2>

          {[
            "profil",
            "pendidikan",
            "pengalaman",
            "keahlian",
            "sertifikat",
            "proyek",
            "referensi",
          ].map((field) => (
            <textarea
              key={field}
              placeholder={field.replace(/^\w/, (c) => c.toUpperCase())}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 h-24 text-sm focus:ring-2 focus:ring-blue-500"
              value={formData[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            />
          ))}

          <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              {loading ? "Menghasilkan..." : "Generate CV"}
            </button>
            <button
              onClick={handleManualSave}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Simpan Manual
            </button>
            <button
              onClick={handleClearHistory}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Hapus Semua Save
            </button>
          </div>
        </div>

        {/* PREVIEW CV */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Hasil CV</h2>

          <div
            id="cv-preview-content"
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            spellCheck={true}
            className={`border border-gray-200 rounded-lg p-4 min-h-[400px] prose max-w-none bg-white cursor-text ${
              isEditing ? "outline outline-2 outline-blue-400" : ""
            }`}
            dangerouslySetInnerHTML={{ __html: generatedCV }}
            onInput={(e) => setEditedContent(e.currentTarget.innerHTML)}
          />

          <div className="flex flex-col sm:flex-row justify-between mt-4 gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto"
            >
              {isEditing ? "Selesai Edit" : "Edit CV"}
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto"
            >
              Download CV
            </button>
          </div>

          {history.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Riwayat CV Tersimpan
              </h3>
              <div className="grid md:grid-cols-1 gap-3">
                {history.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-3 border border-gray-300 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-gray-500">{item.date}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUseHistory(item)}
                          className="text-blue-600 text-xs font-semibold hover:underline"
                        >
                          Gunakan
                        </button>
                        <button
                          onClick={() => handleShareLink(item)}
                          className="text-green-600 text-xs font-semibold hover:underline"
                        >
                          Share Link
                        </button>
                      </div>
                    </div>
                    <div
                      className="text-sm text-gray-800 line-clamp-4"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Memuat dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}