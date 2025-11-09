/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  experimental: {
    serverComponentsExternalPackages: ["firebase-admin"],
  },

  // ✅ Tambahkan ini supaya Turbopack tahu bahwa kamu sadar pakai Turbopack
  turbopack: {},

  // ✅ Tambahkan fallback webpack (jika Turbopack belum support lib tertentu)
  webpack: (config) => {
    if (!config.externals) config.externals = [];
    config.externals.push({
      "html2pdf.js": "html2pdf.js",
    });
    return config;
  },
};

export default nextConfig;
