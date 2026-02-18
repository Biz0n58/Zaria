import styles from "./dashboard.module.css";

export default function StatusBadge({ status }: { status: "Paid" | "Pending" | "Canceled" }) {
  const cls =
    status === "Paid"
      ? styles.badgePaid
      : status === "Pending"
      ? styles.badgePending
      : styles.badgeCanceled;

  return <span className={`${styles.badge} ${cls}`}>{status}</span>;
}
