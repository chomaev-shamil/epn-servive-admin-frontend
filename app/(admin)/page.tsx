"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  CalendarIcon,
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

const PLATFORM_LABELS: Record<string, string> = {
  ios: "iOS",
  android: "Android",
  macos: "macOS",
  windows: "Windows",
  ipados: "iPadOS",
  tvos: "tvOS",
  xros: "xrOS",
  unknown: "Другое",
};

function normalizePlatform(raw: string): string {
  return raw.replace(/^DevicePlatform\./i, "").toLowerCase();
}

function formatChartDate(dateStr: string) {
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

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PRESETS = [
  { label: "7 дней", days: 7 },
  { label: "30 дней", days: 30 },
  { label: "90 дней", days: 90 },
  { label: "365 дней", days: 365 },
] as const;

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
  const [fromDate, setFromDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [toDate, setToDate] = useState<Date>(() => new Date());
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const [summary, setSummary] = useState<AdminWalletSummaryStatsResponse | null>(null);
  const [payments, setPayments] = useState<PaymentDayStat[] | null>(null);
  const [users, setUsers] = useState<UserDayStat[] | null>(null);
  const [devices, setDevices] = useState<DeviceStats | null>(null);
  const [vouchers, setVouchers] = useState<VoucherDayStat[] | null>(null);
  const [topUsers, setTopUsers] = useState<AdminWalletTopUser[] | null>(null);
  const [error, setError] = useState("");

  const fetchData = useCallback(() => {
    setError("");
    setSummary(null);
    setPayments(null);
    setUsers(null);
    setVouchers(null);
    setTopUsers(null);

    const handleError = (e: unknown) => {
      if (e instanceof Error) setError((prev) => prev || e.message);
    };

    const from = toISODate(fromDate);
    const to = toISODate(toDate);

    getWalletSummaryStats({ from, to }).then(setSummary).catch(handleError);
    getPaymentDailyStats({ fromDate: from, toDate: to }).then(setPayments).catch(handleError);
    getUserDailyStats({ fromDate: from, toDate: to }).then(setUsers).catch(handleError);
    getVoucherDailyStats({ fromDate: from, toDate: to }).then(setVouchers).catch(handleError);
    getWalletTopUsers({ from, to }).then(setTopUsers).catch(handleError);
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchData();
    // devices не зависят от дат — грузим один раз
    getDeviceStats().then(setDevices).catch(() => {});
  }, [fetchData]);

  const paymentsTotals = useMemo(() => {
    if (!payments) return null;
    return payments.reduce(
      (acc, d) => ({ total: acc.total + d.totalAmount, count: acc.count + d.count }),
      { total: 0, count: 0 }
    );
  }, [payments]);

  const normalizedPlatforms = useMemo(() => {
    if (!devices) return [];
    return devices.byPlatform.map((p) => {
      const key = normalizePlatform(p.platform);
      return { platform: key, label: PLATFORM_LABELS[key] ?? key, count: p.count };
    });
  }, [devices]);

  const deviceChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    normalizedPlatforms.forEach((p) => {
      config[p.platform] = {
        label: p.label,
        color: PLATFORM_COLORS[p.platform] ?? PLATFORM_COLORS.unknown,
      };
    });
    return config;
  }, [normalizedPlatforms]);

  const summaryCards = [
    {
      label: "Доход (платежи)",
      value: paymentsTotals ? `${formatAmount(paymentsTotals.total)} ₽` : null,
      sub: paymentsTotals ? `${paymentsTotals.count} платежей` : null,
      icon: CreditCard,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Пополнения кошельков",
      value: summary ? `${formatAmount(summary.deposit_total)} ₽` : null,
      sub: summary ? `${summary.deposit_count} операций` : null,
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Списания с кошельков",
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
      color: "text-orange-600 bg-orange-50",
    },
  ];

  function applyPreset(days: number) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setFromDate(from);
    setToDate(to);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Главная</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Обзор основных показателей сервиса
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.days}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(p.days)}
            >
              {p.label}
            </Button>
          ))}

          <Popover open={fromOpen} onOpenChange={setFromOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarIcon className="size-3.5" />
                {formatDisplayDate(fromDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={fromDate}
                onSelect={(d) => {
                  if (d) {
                    setFromDate(d);
                    setFromOpen(false);
                  }
                }}
                disabled={(d) => d > toDate || d > new Date()}
              />
            </PopoverContent>
          </Popover>

          <span className="text-sm text-muted-foreground">—</span>

          <Popover open={toOpen} onOpenChange={setToOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <CalendarIcon className="size-3.5" />
                {formatDisplayDate(toDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={toDate}
                onSelect={(d) => {
                  if (d) {
                    setToDate(d);
                    setToOpen(false);
                  }
                }}
                disabled={(d) => d < fromDate || d > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
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
                  <XAxis dataKey="date" tickFormatter={formatChartDate} tickLine={false} axisLine={false} fontSize={12} />
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
                  <XAxis dataKey="date" tickFormatter={formatChartDate} tickLine={false} axisLine={false} fontSize={12} />
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
                  <XAxis dataKey="date" tickFormatter={formatChartDate} tickLine={false} axisLine={false} fontSize={12} />
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
                      data={normalizedPlatforms}
                      dataKey="count"
                      nameKey="platform"
                      innerRadius={50}
                      outerRadius={90}
                      strokeWidth={2}
                    >
                      {normalizedPlatforms.map((entry) => (
                        <Cell
                          key={entry.platform}
                          fill={PLATFORM_COLORS[entry.platform] ?? PLATFORM_COLORS.unknown}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="space-y-3 text-sm">
                  {normalizedPlatforms.map((p) => (
                    <div key={p.platform} className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: PLATFORM_COLORS[p.platform] ?? PLATFORM_COLORS.unknown }}
                      />
                      <span className="text-muted-foreground">{p.label}</span>
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
