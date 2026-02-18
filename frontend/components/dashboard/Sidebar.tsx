import Link from "next/link";
import styles from "./dashboard.module.css";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/products", label: "Products" },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>ZARIA • ADMIN</div>
      <nav className={styles.nav}>
        {items.map((it) => (
          <Link key={it.href} href={it.href} className={styles.navLink}>
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
