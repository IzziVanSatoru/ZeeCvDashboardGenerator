export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-600 dark:text-gray-300 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between">
        <h2 className="text-lg font-semibold tracking-wide">
          <span className="text-blue-600 dark:text-blue-400">Zee</span>DashboardSkiw
        </h2>

        <div className="flex space-x-4 mt-3 sm:mt-0">
          <a href="#" className="hover:text-blue-600 transition">Privacy</a>
          <a href="#" className="hover:text-blue-600 transition">Terms</a>
          <a href="#" className="hover:text-blue-600 transition">Support</a>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 text-center py-4 text-sm">
        © {new Date().getFullYear()} ZeeDashboardSkiw — All Rights Reserved.
      </div>
    </footer>
  );
}
