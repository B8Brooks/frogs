import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

export const metadata = {
  title: "Eat the Frog",
  description: "Your personal frog-eating coach. Tackle your biggest tasks first.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2d4a3a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
