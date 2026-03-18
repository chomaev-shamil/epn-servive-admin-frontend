"use client";

import { useEffect, useState } from "react";
import {
  getWalletSummaryStats,
  getWalletDailyStats,
  getWalletTopUsers,
} from "@/lib/api";

export default function DashboardPage() {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getWalletSummaryStats()
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your service metrics</p>
        </div>
      </div>

      {error && <div className="alert-danger">{error}</div>}

      <div className="stats-grid stagger">
        <div className="stat-card">
          <div className="stat-card__accent" style={{ background: "linear-gradient(90deg, var(--primary), #6366F1)" }} />
          <div className="stat-card__label">Total Balance</div>
          <div className="stat-card__value">
            {summary ? String(summary.totalBalance ?? "—") : (
              <div className="skeleton" style={{ height: 28, width: 80 }} />
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__accent" style={{ background: "linear-gradient(90deg, #6366F1, #A855F7)" }} />
          <div className="stat-card__label">Total Wallets</div>
          <div className="stat-card__value">
            {summary ? String(summary.totalWallets ?? "—") : (
              <div className="skeleton" style={{ height: 28, width: 60 }} />
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__accent" style={{ background: "linear-gradient(90deg, var(--success), #34D399)" }} />
          <div className="stat-card__label">Active Users</div>
          <div className="stat-card__value">
            {summary ? String(summary.activeUsers ?? "—") : (
              <div className="skeleton" style={{ height: 28, width: 50 }} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
