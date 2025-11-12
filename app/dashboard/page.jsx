"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DOMPurify from "dompurify"; 

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

  useEffect(() => {
    localStorage.removeItem("ai_cv_memory");
    const saved = localStorage.getItem("manual_saved_cv_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToCache = (text) => {
    const newCache = [...recommendations, text].slice(-5);
    setRecommendations(newCache);
    localStorage.setItem("ai_cv_memory", JSON.stringify(newCache));
  };

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
...
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
      result = result
        .replace(/Informasi Kontak:|Kontak:/gi, "")
        .replace(/<div class="contact-info"[\s\S]*?<\/div>/gi, "")
        .replace(/<p>.*?(Telepon|Email|LinkedIn).*?<\/p>/gi, "");
      result = result.replace(/(<h1[^>]*>.*?<\/h1>)/i, `$1${kontakHTML}`);

      // ✅ Sanitasi hasil AI
      const safeResult = DOMPurify.sanitize(result);

      setGeneratedCV(safeResult);
      setEditedContent(safeResult);
      saveToCache(safeResult);
    } catch (error) {
      console.error("❌ Error Generate:", error);
      setGeneratedCV(`<p class='text-red-600'>${error.message}</p>`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const cvElement = document.getElementById("cv-preview-content");
    if (!cvElement) return alert("CV belum tersedia untuk diunduh.");

    const content = `
      <html><head><meta charset="UTF-8"/><title>${formData.nama || "CV"}</title>
      <style>@page{size:A4 portrait;margin:18mm;}body{font-family:'Calibri','Segoe UI',sans-serif;}</style>
      </head><body>${cvElement.innerHTML}</body></html>`;
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

  const handleClearHistory = () => {
    localStorage.removeItem("manual_saved_cv_history");
    setHistory([]);
    alert("🗑️ Semua riwayat manual berhasil dihapus.");
  };

  const handleUseHistory = (item) => {
    const safeContent = DOMPurify.sanitize(item.content); // ✅ Sanitize
    setGeneratedCV(safeContent);
    setEditedContent(safeContent);
    alert("✅ CV dari history berhasil dimuat.");
  };

  const handleShareLink = (item) => {
    const link = `${window.location.origin}/dashboard?cv=${btoa(
      encodeURIComponent(item.content)
    )}`;
    navigator.clipboard.writeText(link);
    alert("🔗 Link share berhasil disalin:\n" + link);
  };

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
        {/* ... form tetap sama ... */}

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
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(generatedCV), // ✅ Sanitasi output
            }}
            onInput={(e) => setEditedContent(e.currentTarget.innerHTML)}
          />

          {/* History ditampilkan aman */}
          {history.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Riwayat CV Tersimpan
              </h3>
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
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(item.content),
                    }}
                  />
                </div>
              ))}
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