import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "260px 1fr" }}>
      <Sidebar />
      <main style={{ padding: 20, background: "#f6f7f9" }}>{children}</main>
    </div>
  );
}
