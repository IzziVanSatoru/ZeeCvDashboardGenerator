/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Aktifkan React Compiler (React Forget)
  reactCompiler: true,

  // ✅ Aktifkan experimental agar firebase-admin bisa dipakai di server components
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },

  // ✅ Konfirmasi penggunaan Turbopack (optional tapi disarankan)
  turbopack: {},

  // ✅ Tambahkan fallback untuk html2pdf.js (agar tidak error saat build di Vercel)
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      "html2pdf.js": "html2pdf.js",
    });
    return config;
  },
};

export default nextConfig;