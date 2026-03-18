"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getWalletSummaryStats } from "@/lib/api";
import { Wallet, Users, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getWalletSummaryStats()
      .then(setSummary)
      .catch((e) => setError(e.message));
  }, []);

  const stats = [
    {
      label: "Total Balance",
      value: summary ? String(summary.totalBalance ?? "—") : null,
      icon: TrendingUp,
    },
    {
      label: "Total Wallets",
      value: summary ? String(summary.totalWallets ?? "—") : null,
      icon: Wallet,
    },
    {
      label: "Active Users",
      value: summary ? String(summary.activeUsers ?? "—") : null,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your service metrics
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stat.value !== null ? (
                <div className="text-2xl font-bold">{stat.value}</div>
              ) : (
                <Skeleton className="h-8 w-20" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
