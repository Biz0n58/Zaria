import Table from "@/components/dashboard/Table";
import StatusBadge from "@/components/dashboard/StatusBadge";
import styles from "@/components/dashboard/dashboard.module.css";

const orders = [
  { id: "1001", customer: "Sara", total: "18 BHD", status: "Paid" as const },
  { id: "1002", customer: "Noor", total: "25 BHD", status: "Pending" as const },
  { id: "1003", customer: "Fatima", total: "12 BHD", status: "Canceled" as const },
  { id: "1004", customer: "Aisha", total: "32 BHD", status: "Paid" as const },
];

export default function OrdersPage() {
  return (
    <section className={styles.tableWrap}>
      <div className={styles.tableHeader}>
        <div className={styles.tableTitle}>Orders</div>
      </div>

      <Table
        columns={["Order ID", "Customer", "Total", "Status"]}
        rows={orders.map((o) => [
          o.id,
          o.customer,
          o.total,
          <StatusBadge key={o.id} status={o.status} />,
        ])}
      />
    </section>
  );
}
