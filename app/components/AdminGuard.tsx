"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import { Sidebar } from "./Sidebar";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="admin-layout">
        <Sidebar />
        <main className="admin-main">
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div className="skeleton" style={{ height: 28, width: 140 }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
              <div className="skeleton" style={{ height: 90 }} />
              <div className="skeleton" style={{ height: 90 }} />
              <div className="skeleton" style={{ height: 90 }} />
            </div>
            <div className="skeleton" style={{ height: 300 }} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">{children}</main>
    </div>
  );
}
