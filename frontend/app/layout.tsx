import "./globals.css";
import { LanguageProvider } from "@/components/lang/LanguageProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Navbar from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
