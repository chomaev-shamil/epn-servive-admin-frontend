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
      label: "Общий баланс",
      value: summary ? String(summary.totalBalance ?? "--") : null,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Всего кошельков",
      value: summary ? String(summary.totalWallets ?? "--") : null,
      icon: Wallet,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Активные пользователи",
      value: summary ? String(summary.activeUsers ?? "--") : null,
      icon: Users,
      color: "text-emerald-600 bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Главная</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Обзор основных показателей сервиса
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              {stat.value !== null ? (
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              ) : (
                <Skeleton className="h-9 w-24" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
