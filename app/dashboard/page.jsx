"use client";
import { useState, useEffect } from "react";

export default function DashboardPage() {
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

  // === LOCAL CACHE ===
  useEffect(() => {
    const cached = localStorage.getItem("ai_cv_memory");
    if (cached) {
      setRecommendations(JSON.parse(cached));
    }
  }, []);

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

      const kontakHTML = `
        <div class="contact-info" style="text-align:center; font-size:14px; color:#374151; margin-bottom:20px;">
          <p><strong>Telepon:</strong> ${formData.telepon || "-"} | 
          <strong>Email:</strong> ${formData.email || "-"} | 
          <strong>LinkedIn:</strong> ${formData.linkedin || "-"}</p>
        </div>
      `;

      const contextMemory = recommendations.join("\n");

      const prompt = `
Kamu adalah AI pembuat CV profesional yang selalu menampilkan hasil rapi, elegan, dan tidak berlebihan.

Instruksi:
- Gunakan <h1> hanya untuk Nama.
- Setelah <h1>, tampilkan Informasi Kontak dalam 1 baris saja (tanpa duplikat).
- Gunakan <h3> untuk setiap bagian: Profil, Pendidikan, Pengalaman, Keahlian, Sertifikat, Proyek, Referensi.
- Gunakan <p> untuk deskripsi isi tiap bagian.
- Hindari label seperti "Informasi Kontak:" atau pengulangan data.
- Bahasa formal dan profesional.

Berdasarkan memori hasil sebelumnya:
${contextMemory}

Data pengguna:
${JSON.stringify(formData, null, 2)}
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
                "Kamu adalah AI pembuat Curriculum Vitae profesional dengan layout estetis seperti dokumen HRD resmi.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status} - Gagal memuat.`);

      const data = await res.json();
      let result = data?.choices?.[0]?.message?.content || "";
      result = result.replace(/```html|```/g, "").trim();

      // Hapus kontak ganda sebelum menambah baru
      result = result.replace(
        /<div class="contact-info"[\s\S]*?<\/div>/gi,
        ""
      );

      // Sisipkan hanya satu kontak setelah nama
      result = result.replace(/(<h1[^>]*>.*?<\/h1>)/i, `$1${kontakHTML}`);

      setGeneratedCV(result);
      saveToCache(result);
    } catch (error) {
      console.error("❌ Error Generate:", error);
      setGeneratedCV(`<p class='text-red-600'>${error.message}</p>`);
    } finally {
      setLoading(false);
    }
  };

  // === DOWNLOAD PDF ===
  const handleDownloadPDF = () => {
    const cvElement = document.getElementById("cv-preview-content");
    if (!cvElement) return alert("CV belum tersedia untuk diunduh.");

    const content = `
      <html>
        <head>
          <meta charset="UTF-8"/>
          <title>${formData.nama || "CV"} - Download</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body {
              font-family: 'Calibri', sans-serif;
              color: #111827;
              line-height: 1.6;
              background: white;
            }
            h1 {
              text-align: center;
              font-size: 28px;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .contact-info {
              text-align: center;
              color: #374151;
              margin-bottom: 18px;
              font-size: 14px;
            }
            h3 {
              border-bottom: 1px solid #d1d5db;
              color: #1e3a8a;
              font-size: 17px;
              margin-top: 18px;
              padding-bottom: 4px;
            }
            p {
              font-size: 14px;
              margin: 4px 0;
            }
            footer, .no-print { display: none !important; }
          </style>
        </head>
        <body>${cvElement.innerHTML}</body>
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
      win.document.title = "";
      win.focus();
      win.print();
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        CV Generator (RAG Interactive)
      </h1>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-7xl">
        {/* === FORM === */}
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Data Diri</h2>

          {["nama", "telepon", "email", "linkedin"].map((key) => (
            <input
              key={key}
              type={key === "email" ? "email" : "text"}
              placeholder={key.replace(/^\w/, (c) => c.toUpperCase())}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 text-sm focus:ring-2 focus:ring-blue-500"
              value={formData[key]}
              onChange={(e) =>
                setFormData({ ...formData, [key]: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, [field]: e.target.value })
              }
            />
          ))}

          <div className="flex flex-col sm:flex-row justify-between mt-6 gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Generating..." : "Generate CV"}
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
            >
              Download CV (PDF)
            </button>
          </div>
        </div>

        {/* === PREVIEW === */}
        <div className="bg-white shadow-2xl border border-gray-200 rounded-2xl p-6 font-sans text-gray-900 overflow-y-auto max-h-[85vh]">
          <div id="cv-preview">
            {generatedCV ? (
              <div
                id="cv-preview-content"
                dangerouslySetInnerHTML={{ __html: generatedCV }}
                className="text-[15px] leading-relaxed"
              />
            ) : (
              <p className="text-gray-500 text-center italic">
                CV akan muncul di sini setelah klik{" "}
                <b className="text-blue-600">Generate CV</b>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
