"use client";

import Link from "next/link";
import { useLang } from "@/components/lang/LanguageProvider";
import styles from "./home.module.css";

export default function HomePage() {
  const { lang } = useLang();

  const content =
    lang === "ar"
      ? {
          title: "جمالك… بلمسة فاخرة",
          subtitle:
            "اختاري منتجات مكياج مختارة بعناية — جودة عالية وتجربة تسوّق راقية.",
          shopNow: "تسوّق الآن",
          featured: "منتجات مختارة",
          browse: "جميع المنتجات",
          cta: "جاهزة لرفع مستوى إطلالتك؟",
          start: "ابدأي التسوّق",
          products: [
            { name: "فاونديشن فاخر", desc: "تغطية مخملية تدوم طويلاً", price: "25 BHD" },
            { name: "أحمر شفاه مخملي", desc: "لون غني وثبات عالي", price: "12 BHD" },
            { name: "هايلايتر متوهج", desc: "إشراقة طبيعية ناعمة", price: "18 BHD" },
          ],
        }
      : {
          title: "Your Beauty, Elevated.",
          subtitle:
            "Discover premium makeup curated for confidence and elegance.",
          shopNow: "Shop Now",
          featured: "Featured Products",
          browse: "Browse All Products",
          cta: "Ready to Elevate Your Routine?",
          start: "Start Shopping",
          products: [
            { name: "Luxury Foundation", desc: "Velvet matte finish", price: "25 BHD" },
            { name: "Velvet Lipstick", desc: "Rich long-lasting color", price: "12 BHD" },
            { name: "Glow Highlighter", desc: "Soft radiant glow", price: "18 BHD" },
          ],
        };

  return (
    <main className={styles.main}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>{content.title}</h1>
          <p className={styles.heroSubtitle}>{content.subtitle}</p>

          <Link href="/products" className={styles.primaryButton}>
            {content.shopNow}
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className={styles.featured}>
        <h2 className={styles.sectionTitle}>{content.featured}</h2>

        <div className={styles.grid}>
          {content.products.map((product, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.imagePlaceholder} />
              <h3 className={styles.cardTitle}>{product.name}</h3>
              <p className={styles.cardDesc}>{product.desc}</p>
              <p className={styles.cardPrice}>{product.price}</p>
            </div>
          ))}
        </div>

        <div className={styles.center}>
          <Link href="/products" className={styles.secondaryButton}>
            {content.browse}
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>{content.cta}</h2>

        <Link href="/products" className={styles.primaryButtonLight}>
          {content.start}
        </Link>
      </section>
    </main>
  );
}
