"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getUser, getUserWallet, depositToWallet, listDevices,
  getUserTrafficPackages, listTrafficPackages, purchasePackageForUser,
} from "@/lib/api";
import type {
  AdminUserResponse, AdminWalletResponse, AdminDeviceResponse,
  AdminUserTrafficPackageResponse, AdminTrafficPackageResponse,
} from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Wallet, Monitor, Plus, Package, ShoppingCart, Receipt, ArrowLeftRight } from "lucide-react";

const FIELD_LABELS: Record<string, string> = {
  id: "ID пользователя",
  first_name: "Имя",
  email: "Email",
  apple_id: "Apple ID",
  telegram_id: "Telegram ID",
  role: "Роль",
  referral_code: "Реферальный код",
  referrer_code: "Код пригласившего",
  system_notification: "Системное уведомление",
  fixed_payment_provider: "Платёжный провайдер",
  contact_code: "Контактный код",
  created_at: "Дата регистрации",
  updated_at: "Обновлён",
};

const MONO_FIELDS = ["id", "referral_code", "referrer_code", "telegram_id", "apple_id", "contact_code"];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active: { label: "Активен", cls: "bg-emerald-50 text-emerald-700" },
  depleted: { label: "Исчерпан", cls: "bg-amber-50 text-amber-700" },
  expired: { label: "Истёк", cls: "bg-muted text-muted-foreground" },
  cancelled: { label: "Отменён", cls: "bg-rose-50 text-rose-700" },
};

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AdminUserResponse | null>(null);
  const [wallet, setWallet] = useState<AdminWalletResponse | null>(null);
  const [devices, setDevices] = useState<AdminDeviceResponse[]>([]);
  const [error, setError] = useState("");
  const [walletLoading, setWalletLoading] = useState(true);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [packages, setPackages] = useState<AdminUserTrafficPackageResponse[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  // deposit
  const [depositAmount, setDepositAmount] = useState("");
  const [depositDesc, setDepositDesc] = useState("");
  const [depositing, setDepositing] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);

  // purchase dialog
  const [showPurchase, setShowPurchase] = useState(false);
  const [catalogPackages, setCatalogPackages] = useState<AdminTrafficPackageResponse[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    getUser(userId)
      .then(setUser)
      .catch((e) => setError(e.message));

    listDevices({ userId, limit: 50 })
      .then((r) => setDevices(r.results))
      .catch(() => {})
      .finally(() => setDevicesLoading(false));

    getUserWallet(userId)
      .then(setWallet)
      .catch(() => {})
      .finally(() => setWalletLoading(false));

    loadPackages();
  }, [userId]);

  const loadPackages = () => {
    if (!userId) return;
    setPackagesLoading(true);
    getUserTrafficPackages(userId, { limit: 50 })
      .then((r) => setPackages(r.results))
      .catch(() => {})
      .finally(() => setPackagesLoading(false));
  };

  const handleDeposit = async () => {
    if (!wallet?.id || !depositAmount) return;
    setDepositing(true);
    try {
      const updated = await depositToWallet(wallet.id, {
        amount: Number(depositAmount),
        description: depositDesc || undefined,
      });
      setWallet(updated);
      setDepositAmount("");
      setDepositDesc("");
      setShowDeposit(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDepositing(false);
    }
  };

  const openPurchaseDialog = async () => {
    setShowPurchase(true);
    setCatalogLoading(true);
    try {
      const res = await listTrafficPackages({ isActive: true, limit: 50 });
      setCatalogPackages(res.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setCatalogLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!userId) return;
    setPurchasing(packageId);
    try {
      await purchasePackageForUser(packageId, userId);
      loadPackages();
      // обновим кошелёк — списание
      getUserWallet(userId).then(setWallet).catch(() => {});
      setShowPurchase(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/users">Пользователи</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user?.email ?? userId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Шапка */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Avatar className="size-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {user.email ? user.email.substring(0, 2).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {user.email ?? user.first_name ?? "Пользователь"}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Админ" : "Пользователь"}
                  </Badge>
                  {user.contact_code && (
                    <span className="text-sm text-muted-foreground">#{user.contact_code}</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-full" />
              <div>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="mt-2 h-5 w-20" />
              </div>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-1.5 size-4" />
          Назад
        </Button>
      </div>

      {/* Кошелёк */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-violet-50 p-1.5 text-violet-600">
              <Wallet className="size-4" />
            </div>
            Кошелёк
          </CardTitle>
          <div className="flex gap-2">
            {wallet?.id && (
              <Button variant="outline" size="sm" onClick={() => setShowDeposit(true)}>
                <Plus className="mr-1 size-3.5" />
                Пополнить
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {walletLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : wallet ? (
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold tracking-tight">
                  {wallet.balance} <span className="text-lg text-muted-foreground font-normal">RUB</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  ID: {wallet.short_id}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/payments?userId=${userId}`}>
                    <Receipt className="mr-1 size-3.5" />
                    Платежи
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/transactions?userId=${userId}`}>
                    <ArrowLeftRight className="mr-1 size-3.5" />
                    Транзакции
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Кошелёк не найден</p>
          )}
        </CardContent>
      </Card>

      {/* Модалка пополнения */}
      <Dialog open={showDeposit} onOpenChange={setShowDeposit}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Пополнить кошелёк</DialogTitle>
            <DialogDescription>
              Средства будут зачислены на баланс пользователя.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Сумма (RUB)</label>
              <Input
                type="number"
                placeholder="100"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Описание</label>
              <Input
                placeholder="Необязательно"
                value={depositDesc}
                onChange={(e) => setDepositDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                disabled={!depositAmount || depositing}
                onClick={handleDeposit}
              >
                {depositing ? "Обработка..." : "Пополнить"}
              </Button>
              <Button variant="outline" onClick={() => setShowDeposit(false)}>
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Пакеты трафика */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
              <Package className="size-4" />
            </div>
            Пакеты трафика
            {!packagesLoading && (
              <Badge variant="secondary" className="ml-1">{packages.length}</Badge>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={openPurchaseDialog}>
            <ShoppingCart className="mr-1 size-3.5" />
            Купить пакет
          </Button>
        </CardHeader>
        <CardContent>
          {packagesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : packages.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {packages.map((pkg) => {
                const usedGb = pkg.used_bytes / (1024 * 1024 * 1024);
                const pct = Math.min(100, (usedGb / Math.max(1, pkg.traffic_limit_gb)) * 100);
                const st = STATUS_MAP[pkg.status] ?? { label: pkg.status, cls: "" };
                return (
                  <div key={pkg.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{pkg.name}</span>
                      <Badge variant="secondary" className={st.cls}>{st.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {usedGb.toFixed(1)} / {pkg.traffic_limit_gb} GB
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{pkg.price} RUB</span>
                      {pkg.purchased_at && (
                        <span>{new Date(pkg.purchased_at).toLocaleDateString("ru-RU")}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Пакетов нет</p>
          )}
        </CardContent>
      </Card>

      {/* Устройства */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <Monitor className="size-4" />
            </div>
            Устройства
            {!devicesLoading && (
              <Badge variant="secondary" className="ml-1">{devices.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {devicesLoading ? (
            <div className="space-y-0 divide-y px-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : devices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="pl-6">Платформа</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Страна</TableHead>
                  <TableHead>Создано</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devices.map((d) => (
                  <TableRow
                    key={d.id ?? d.short_id}
                    className={d.id ? "cursor-pointer hover:bg-muted/30 transition-colors" : ""}
                    onClick={() => d.id && router.push(`/devices/${d.id}`)}
                  >
                    <TableCell className="pl-6">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {d.platform}
                      </code>
                    </TableCell>
                    <TableCell>{d.name ?? d.agent}</TableCell>
                    <TableCell>
                      <Badge
                        variant={d.is_active ? "default" : "secondary"}
                        className={d.is_active ? "bg-emerald-50 text-emerald-700" : ""}
                      >
                        {d.is_active ? "Активно" : "Неактивно"}
                      </Badge>
                    </TableCell>
                    <TableCell>{d.country_code ?? "--"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {d.created_at
                        ? new Date(d.created_at).toLocaleDateString("ru-RU")
                        : "--"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Устройства не найдены
            </div>
          )}
        </CardContent>
      </Card>

      {/* Данные пользователя */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Данные пользователя</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {user ? (
            <div className="divide-y">
              {Object.entries(user).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start gap-4 px-6 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-44 shrink-0 text-sm text-muted-foreground">
                    {FIELD_LABELS[key] ?? key}
                  </div>
                  <div className="flex-1 text-sm">
                    {value === null || value === undefined ? (
                      <span className="text-muted-foreground">--</span>
                    ) : MONO_FIELDS.includes(key) ? (
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {String(value)}
                      </code>
                    ) : key === "role" ? (
                      String(value) === "admin" ? "Админ" : "Пользователь"
                    ) : (key === "created_at" || key === "updated_at") && value ? (
                      new Date(String(value)).toLocaleString("ru-RU")
                    ) : (
                      String(value)
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модалка покупки пакета */}
      <Dialog open={showPurchase} onOpenChange={setShowPurchase}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Купить пакет трафика</DialogTitle>
            <DialogDescription>
              Выберите пакет для покупки. Стоимость будет списана с кошелька пользователя.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {catalogLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))
            ) : catalogPackages.length > 0 ? (
              catalogPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{pkg.name}</div>
                    {pkg.description && (
                      <div className="text-xs text-muted-foreground">{pkg.description}</div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {pkg.traffic_limit_gb} GB
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">{pkg.price} RUB</span>
                    <Button
                      size="sm"
                      disabled={purchasing !== null}
                      onClick={() => pkg.id && handlePurchase(pkg.id)}
                    >
                      {purchasing === pkg.id ? "Покупка..." : "Купить"}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Нет доступных пакетов
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
