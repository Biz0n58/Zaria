"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-2 w-full text-left rounded-md hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
    >
      <LogOut size={20} />
      Logout
    </button>
  );
}
