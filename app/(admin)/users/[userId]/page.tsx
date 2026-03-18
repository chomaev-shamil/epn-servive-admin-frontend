"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/api";
import type { AdminUserResponse } from "@/types/admin";

const FIELD_LABELS: Record<string, string> = {
  id: "User ID",
  email: "Email",
  firstName: "First Name",
  role: "Role",
  referralCode: "Referral Code",
  referrerCode: "Referrer Code",
  referralLink: "Referral Link",
  telegramId: "Telegram ID",
  appleId: "Apple ID",
  receiptEmail: "Receipt Email",
  contactCode: "Contact Code",
  systemNotification: "System Notification",
};

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AdminUserResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    getUser(userId)
      .then(setUser)
      .catch((e) => setError(e.message));
  }, [userId]);

  if (error) {
    return <div className="alert-danger">{error}</div>;
  }

  return (
    <>
      <div className="page-breadcrumb">
        <Link href="/users">Users</Link>
        <span className="page-breadcrumb__sep">/</span>
        <span>{user?.email ?? userId}</span>
      </div>

      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">
            {user ? (user.email ?? "User") : (
              <div className="skeleton" style={{ height: 24, width: 200 }} />
            )}
          </h1>
          {user && (
            <p className="page-subtitle">
              <span
                className={`badge ${user.role === "admin" ? "badge--warning" : "badge--info"}`}
              >
                <span className="badge__dot" />
                {user.role}
              </span>
            </p>
          )}
        </div>
        <button className="btn-secondary btn-icon" onClick={() => router.back()}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3L5 8l5 5" />
          </svg>
          Back
        </button>
      </div>

      {user ? (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="detail-grid">
            {Object.entries(user).map(([key, value]) => (
              <div className="detail-row" key={key}>
                <div className="detail-row__label">
                  {FIELD_LABELS[key] ?? key}
                </div>
                <div
                  className={`detail-row__value${
                    ["id", "referralCode", "referrerCode", "telegramId", "appleId", "contactCode"].includes(key)
                      ? " detail-row__value--mono"
                      : ""
                  }`}
                >
                  {value === null || value === undefined ? (
                    <span style={{ color: "var(--text-tertiary)" }}>—</span>
                  ) : (
                    String(value)
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="skeleton" style={{ height: 10, width: 80, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: "60%" }} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
