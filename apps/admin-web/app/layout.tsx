import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zaria Admin Dashboard",
  description: "Admin dashboard for Zaria store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
