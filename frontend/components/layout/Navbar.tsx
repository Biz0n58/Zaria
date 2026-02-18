"use client";

import Link from "next/link";
import { useLang } from "../lang/LanguageProvider";
import styles from "./navbar.module.css";

export default function Navbar() {
  const { lang, toggleLang } = useLang();

  const labels =
    lang === "ar"
      ? { home: "الرئيسية", products: "المنتجات", cart: "السلة", toggle: "English" }
      : { home: "Home", products: "Products", cart: "Cart", toggle: "العربية" };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          ZARIA
        </Link>

        <nav className={styles.nav}>
          <Link href="/" className={styles.link}>
            {labels.home}
          </Link>

          <Link href="/products" className={styles.link}>
            {labels.products}
          </Link>

          <Link href="/cart" className={styles.link}>
            {labels.cart}
          </Link>

          <button
            type="button"
            onClick={toggleLang}
            className={styles.langButton}
          >
            {labels.toggle}
          </button>
        </nav>
      </div>
    </header>
  );
}
