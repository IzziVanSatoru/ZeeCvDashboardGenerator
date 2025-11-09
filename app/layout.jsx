import "../styles/App.css";
import Footer from "../components/Footer";

export const metadata = {
  title: "ZeeDashboardSkiw",
  description: "AI Resume Builder Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
