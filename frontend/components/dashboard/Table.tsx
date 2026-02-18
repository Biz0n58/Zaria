import styles from "./dashboard.module.css";

export default function Table({
  columns,
  rows,
}: {
  columns: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} className={styles.th}>{c}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((cell, j) => (
              <td key={j} className={styles.td}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
