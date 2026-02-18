"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "ar" | "en";

type LangContextValue = {
  lang: Lang;
  dir: "rtl" | "ltr";
  toggleLang: () => void;
  setLang: (lang: Lang) => void;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");

  useEffect(() => {
    const saved = window.localStorage.getItem("zaria_lang") as Lang | null;
    if (saved === "ar" || saved === "en") setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("zaria_lang", lang);
  }, [lang]);

  const value = useMemo<LangContextValue>(() => {
    return {
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      toggleLang: () => setLang((p) => (p === "ar" ? "en" : "ar")),
      setLang,
    };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LanguageProvider />");
  return ctx;
}
