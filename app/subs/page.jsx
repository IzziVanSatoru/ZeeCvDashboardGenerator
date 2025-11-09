export default function SubsPage() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md w-full bg-white/70 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          💳 Subscription Feature
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Halaman fitur <span className="font-semibold text-blue-600 dark:text-blue-400">Upgrade Plan</span> sedang dalam pengembangan.
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          Silakan kembangkan sendiri integrasi Stripe dan akses Premium Tools nanti di sini 🚀
        </p>
      </div>
    </section>
  );
}
