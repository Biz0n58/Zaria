import styles from "./dashboard.module.css";

export default function Topbar() {
  return (
    <header className={styles.topbar}>
      <div className={styles.topTitle}>Employee Dashboard</div>
      <div className={styles.topRight}>
        <input className={styles.search} placeholder="Search..." />
        <div style={{ fontSize: 13, color: "#6b7280" }}>Admin</div>
      </div>
    </header>
  );
}
