 /** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // ganti experimental key lama dengan yang baru
  serverExternalPackages: ["firebase-admin"],

  // Turbopack aware
  turbopack: {},

  // fallback webpack (jika perlu)
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      "html2pdf.js": "html2pdf.js",
    });
    return config;
  },
};

export default nextConfig;