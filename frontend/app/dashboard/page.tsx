import StatCard from "@/components/dashboard/StatCard";
import Table from "@/components/dashboard/Table";
import StatusBadge from "@/components/dashboard/StatusBadge";
import styles from "@/components/dashboard/dashboard.module.css";

const orders = [
  { id: "1001", customer: "Sara", total: "18 BHD", status: "Paid" as const },
  { id: "1002", customer: "Noor", total: "25 BHD", status: "Pending" as const },
  { id: "1003", customer: "Fatima", total: "12 BHD", status: "Canceled" as const },
];

export default function DashboardPage() {
  return (
    <>
      <div className={styles.cards}>
        <StatCard title="Today Orders" value="12" />
        <StatCard title="Revenue" value="180 BHD" />
        <StatCard title="Pending" value="3" />
      </div>

      <section className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitle}>Recent Orders</div>
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
    </>
  );
}
