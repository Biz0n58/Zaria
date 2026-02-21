"use client";

import Link from "next/link";
import { useLang } from "@/components/lang/LanguageProvider";
import { useAuth } from "@/components/auth/AuthProvider";
import styles from "./navbar.module.css";

export default function Navbar() {
  const { lang, toggleLang } = useLang();
  const { isAuthenticated, logout } = useAuth();

  const labels =
    lang === "ar"
      ? {
          home: "الرئيسية",
          products: "المنتجات",
          dashboard: "لوحة الموظفين",
          login: "تسجيل الدخول",
          logout: "تسجيل الخروج",
          toggle: "English",
        }
      : {
          home: "Home",
          products: "Products",
          dashboard: "Employee Dashboard",
          login: "Login",
          logout: "Logout",
          toggle: "العربية",
        };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>ZARIA</Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.link}>{labels.home}</Link>
          <Link href="/products" className={styles.link}>{labels.products}</Link>
          <Link href="/dashboard" className={styles.link}>{labels.dashboard}</Link>

          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className={styles.link}>
              {labels.logout}
            </button>
          ) : (
            <Link href="/login" className={styles.link}>{labels.login}</Link>
          )}

          <button type="button" onClick={toggleLang} className={styles.langButton}>
            {labels.toggle}
          </button>
        </nav>
      </div>
    </header>
  );
}
