import type { ReactNode } from "react";
import { LanguageProvider } from "@/components/lang/LanguageProvider";
import Navbar from "@/components/layout/Navbar";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <Navbar />
      {children}
    </LanguageProvider>
  );
}
