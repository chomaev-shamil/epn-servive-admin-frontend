"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Pie,
  PieChart,
  Cell,
} from "recharts";
import {
  getWalletSummaryStats,
  getPaymentDailyStats,
  getUserDailyStats,
  getDeviceStats,
  getVoucherDailyStats,
  getWalletTopUsers,
} from "@/lib/api";
import type {
  AdminWalletSummaryStatsResponse,
  PaymentDayStat,
  UserDayStat,
  DeviceStats,
  VoucherDayStat,
  AdminWalletTopUser,
} from "@/types/admin";
import {
  Wallet,
  Users,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Smartphone,
  Ticket,
} from "lucide-react";

const PLATFORM_COLORS: Record<string, string> = {
  ios: "hsl(210, 80%, 55%)",
  android: "hsl(140, 60%, 45%)",
  macos: "hsl(260, 60%, 55%)",
  windows: "hsl(30, 80%, 55%)",
  ipados: "hsl(190, 70%, 50%)",
  tvos: "hsl(340, 60%, 55%)",
  xros: "hsl(50, 70%, 50%)",
  unknown: "hsl(0, 0%, 60%)",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function formatAmount(value: number | string) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
  }).format(num);
}

const paymentsChartConfig = {
  totalAmount: { label: "Сумма", color: "hsl(210, 80%, 55%)" },
  count: { label: "Кол-во", color: "hsl(140, 60%, 45%)" },
} satisfies ChartConfig;

const usersChartConfig = {
  newUsers: { label: "Новые", color: "hsl(260, 60%, 55%)" },
  referredUsers: { label: "Реферальные", color: "hsl(30, 80%, 55%)" },
} satisfies ChartConfig;

const vouchersChartConfig = {
  usages: { label: "Активации", color: "hsl(340, 60%, 55%)" },
  totalAmount: { label: "Сумма", color: "hsl(50, 70%, 50%)" },
} satisfies ChartConfig;

export default function DashboardPage() {
  const [summary, setSummary] = useState<AdminWalletSummaryStatsResponse | null>(null);
  const [payments, setPayments] = useState<PaymentDayStat[] | null>(null);
  const [users, setUsers] = useState<UserDayStat[] | null>(null);
  const [devices, setDevices] = useState<DeviceStats | null>(null);
  const [vouchers, setVouchers] = useState<VoucherDayStat[] | null>(null);
  const [topUsers, setTopUsers] = useState<AdminWalletTopUser[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleError = (e: unknown) => {
      if (e instanceof Error) setError((prev) => prev || e.message);
    };

    getWalletSummaryStats().then(setSummary).catch(handleError);
    getPaymentDailyStats().then(setPayments).catch(handleError);
    getUserDailyStats().then(setUsers).catch(handleError);
    getDeviceStats().then(setDevices).catch(handleError);
    getVoucherDailyStats().then(setVouchers).catch(handleError);
    getWalletTopUsers().then(setTopUsers).catch(handleError);
  }, []);

  const deviceChartConfig = useMemo(() => {
    if (!devices) return {} as ChartConfig;
    const config: ChartConfig = {};
    devices.byPlatform.forEach((p) => {
      config[p.platform] = {
        label: p.platform,
        color: PLATFORM_COLORS[p.platform] ?? PLATFORM_COLORS.unknown,
      };
    });
    return config;
  }, [devices]);

  const summaryCards = [
    {
      label: "Депозиты",
      value: summary ? `${formatAmount(summary.deposit_total)} ₽` : null,
      sub: summary ? `${summary.deposit_count} операций` : null,
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Списания",
      value: summary ? `${formatAmount(summary.withdraw_total)} ₽` : null,
      sub: summary ? `${summary.withdraw_count} операций` : null,
      icon: TrendingDown,
      color: "text-red-600 bg-red-50",
    },
    {
      label: "Новые кошельки",
      value: summary ? String(summary.new_wallets) : null,
      sub: null,
      icon: Wallet,
      color: "text-violet-600 bg-violet-50",
    },
    {
      label: "Всего устройств",
      value: devices ? String(devices.totalCount) : null,
      sub: devices ? `${devices.activeCount} активных` : null,
      icon: Smartphone,
      color: "text-blue-600 bg-blue-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Главная</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Обзор основных показателей сервиса за последние 30 дней
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((stat) => (
          <Card key={stat.label} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              {stat.value !== null ? (
                <>
                  <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                  {stat.sub && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                  )}
                </>
              ) : (
                <Skeleton className="h-8 w-24" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Payments daily */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <CreditCard className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Платежи по дням</CardTitle>
          </CardHeader>
          <CardContent>
            {payments ? (
              <ChartContainer config={paymentsChartConfig} className="h-[250px] w-full">
                <BarChart data={payments} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatDate} tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(v) => formatAmount(v)} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="totalAmount" fill="var(--color-totalAmount)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <Skeleton className="h-[250px] w-full" />
            )}
          </CardContent>
        </Card>

        {/* Users daily */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Users className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Новые пользователи по дням</CardTitle>
          </CardHeader>
          <CardContent>
            {users ? (
              <ChartContainer config={usersChartConfig} className="h-[250px] w-full">
                <LineChart data={users} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatDate} tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="newUsers" stroke="var(--color-newUsers)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="referredUsers" stroke="var(--color-referredUsers)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            ) : (
              <Skeleton className="h-[250px] w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Vouchers daily */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Ticket className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Ваучеры по дням</CardTitle>
          </CardHeader>
          <CardContent>
            {vouchers ? (
              <ChartContainer config={vouchersChartConfig} className="h-[250px] w-full">
                <BarChart data={vouchers} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickFormatter={formatDate} tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="usages" fill="var(--color-usages)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <Skeleton className="h-[250px] w-full" />
            )}
          </CardContent>
        </Card>

        {/* Devices by platform */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Smartphone className="size-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Устройства по платформам</CardTitle>
          </CardHeader>
          <CardContent>
            {devices ? (
              <div className="flex items-center gap-6">
                <ChartContainer config={deviceChartConfig} className="h-[220px] w-[220px] shrink-0">
                  <PieChart accessibilityLayer>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie
                      data={devices.byPlatform}
                      dataKey="count"
                      nameKey="platform"
                      innerRadius={50}
                      outerRadius={90}
                      strokeWidth={2}
                    >
                      {devices.byPlatform.map((entry) => (
                        <Cell
                          key={entry.platform}
                          fill={PLATFORM_COLORS[entry.platform] ?? PLATFORM_COLORS.unknown}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="space-y-3 text-sm">
                  {devices.byPlatform.map((p) => (
                    <div key={p.platform} className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: PLATFORM_COLORS[p.platform] ?? PLATFORM_COLORS.unknown }}
                      />
                      <span className="text-muted-foreground">{p.platform}</span>
                      <span className="font-medium ml-auto">{p.count}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between text-muted-foreground">
                    <span>Виртуальных: {devices.virtualCount}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Физических: {devices.physicalCount}</span>
                  </div>
                </div>
              </div>
            ) : (
              <Skeleton className="h-[220px] w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top users table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <TrendingUp className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">Топ пользователей по обороту</CardTitle>
        </CardHeader>
        <CardContent>
          {topUsers ? (
            topUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">#</th>
                      <th className="pb-2 font-medium">Пользователь</th>
                      <th className="pb-2 font-medium text-right">Оборот</th>
                      <th className="pb-2 font-medium text-right">Транзакций</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topUsers.map((user, i) => (
                      <tr key={user.user_id} className="border-b last:border-0">
                        <td className="py-2 text-muted-foreground">{i + 1}</td>
                        <td className="py-2">
                          <div className="font-medium">{user.email ?? user.first_name ?? "—"}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {user.user_id}
                          </div>
                        </td>
                        <td className="py-2 text-right font-medium">{formatAmount(user.total)} ₽</td>
                        <td className="py-2 text-right">{user.transaction_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Нет данных</p>
            )
          ) : (
            <Skeleton className="h-[200px] w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
