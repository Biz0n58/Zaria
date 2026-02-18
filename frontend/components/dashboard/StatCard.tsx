import styles from "./dashboard.module.css";

export default function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>{title}</div>
      <div className={styles.cardValue}>{value}</div>
    </div>
  );
}
