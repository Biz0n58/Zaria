import Table from "@/components/dashboard/Table";
import styles from "@/components/dashboard/dashboard.module.css";

const products = [
  { sku: "Z-001", name: "Luxury Foundation", price: "25 BHD", stock: "14" },
  { sku: "Z-002", name: "Velvet Lipstick", price: "12 BHD", stock: "40" },
  { sku: "Z-003", name: "Glow Highlighter", price: "18 BHD", stock: "22" },
];

export default function ProductsPage() {
  return (
    <section className={styles.tableWrap}>
      <div className={styles.tableHeader}>
        <div className={styles.tableTitle}>Products</div>
      </div>

      <Table
        columns={["SKU", "Name", "Price", "Stock"]}
        rows={products.map((p) => [p.sku, p.name, p.price, p.stock])}
      />
    </section>
  );
}
