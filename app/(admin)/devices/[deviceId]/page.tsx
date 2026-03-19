"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getDevice, deleteDevice } from "@/lib/api";
import type { AdminDeviceResponse } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Monitor, Trash2, User, Globe, Smartphone } from "lucide-react";

const PLATFORM_LABELS: Record<string, string> = {
  ios: "iOS", ipados: "iPadOS", android: "Android", macos: "macOS",
  windows: "Windows", visionos: "visionOS", tvos: "tvOS",
};

const FIELD_LABELS: Record<string, string> = {
  id: "ID устройства",
  short_id: "Короткий ID",
  internal_short_subscription_id: "ID подписки (внутр.)",
  name: "Название",
  agent: "User Agent",
  is_active: "Статус",
  hasActiveSubscription: "Активная подписка",
  ip_address: "IP-адрес",
  country_code: "Страна",
  platform: "Платформа",
  app_version: "Версия приложения",
  device_identifier: "Идентификатор устройства",
  application: "Приложение",
  created_at: "Создано",
  updated_at: "Обновлено",
};

const MONO_FIELDS = ["id", "short_id", "internal_short_subscription_id", "device_identifier", "ip_address"];

export default function DeviceDetailPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const router = useRouter();
  const [device, setDevice] = useState<AdminDeviceResponse | null>(null);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!deviceId) return;
    getDevice(deviceId)
      .then(setDevice)
      .catch((e) => setError(e.message));
  }, [deviceId]);

  const handleDelete = async () => {
    if (!deviceId) return;
    setDeleting(true);
    try {
      await deleteDevice(deviceId);
      router.replace("/devices");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/devices">Устройства</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{device?.name ?? device?.short_id ?? deviceId}</BreadcrumbPage>
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
          {device ? (
            <>
              <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Monitor className="size-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {device.name ?? "Устройство"}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">
                    {PLATFORM_LABELS[device.platform] ?? device.platform}
                  </Badge>
                  <Badge
                    variant={device.is_active ? "default" : "secondary"}
                    className={device.is_active ? "bg-emerald-50 text-emerald-700" : ""}
                  >
                    {device.is_active ? "Активно" : "Неактивно"}
                  </Badge>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-xl" />
              <div>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="mt-2 h-5 w-32" />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-1.5 size-4" />
            Назад
          </Button>
          {device && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="mr-1.5 size-4" />
              Удалить
            </Button>
          )}
        </div>
      </div>

      {/* Карточки */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Пользователь */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="rounded-lg bg-violet-50 p-1.5 text-violet-600">
                <User className="size-4" />
              </div>
              Пользователь
            </CardTitle>
          </CardHeader>
          <CardContent>
            {device ? (
              device.user ? (
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Email: </span>
                    {device.user.email ?? "Нет email"}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">ID: </span>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{device.user.id}</code>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/users/${device.user.id}`}>
                      <User className="mr-1.5 size-4" />
                      Открыть пользователя
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Не привязано к пользователю</p>
              )
            ) : (
              <Skeleton className="h-10 w-full" />
            )}
          </CardContent>
        </Card>

        {/* Сеть */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
                <Globe className="size-4" />
              </div>
              Сеть
            </CardTitle>
          </CardHeader>
          <CardContent>
            {device ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">IP: </span>
                  {device.ip_address ? (
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{device.ip_address}</code>
                  ) : "--"}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Страна: </span>
                  {device.country_code ? (
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{device.country_code}</code>
                  ) : "--"}
                </div>
              </div>
            ) : (
              <Skeleton className="h-10 w-full" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Все данные */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <Smartphone className="size-4" />
            </div>
            Данные устройства
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {device ? (
            <div className="divide-y">
              {Object.entries(device).map(([key, value]) => {
                if (key === "user" || key === "userSubscription") return null;
                return (
                  <div
                    key={key}
                    className="flex items-start gap-4 px-6 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-48 shrink-0 text-sm text-muted-foreground">
                      {FIELD_LABELS[key] ?? key}
                    </div>
                    <div className="flex-1 text-sm">
                      {value === null || value === undefined ? (
                        <span className="text-muted-foreground">--</span>
                      ) : typeof value === "boolean" ? (
                        key === "is_active" ? (
                          <Badge
                            variant={value ? "default" : "secondary"}
                            className={value ? "bg-emerald-50 text-emerald-700" : ""}
                          >
                            {value ? "Активно" : "Неактивно"}
                          </Badge>
                        ) : (
                          value ? "Да" : "Нет"
                        )
                      ) : MONO_FIELDS.includes(key) ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {String(value)}
                        </code>
                      ) : key === "platform" ? (
                        PLATFORM_LABELS[String(value)] ?? String(value)
                      ) : (key === "created_at" || key === "updated_at") && value ? (
                        new Date(String(value)).toLocaleString("ru-RU")
                      ) : (
                        String(value)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Модалка удаления */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить устройство?</DialogTitle>
            <DialogDescription>
              Устройство {device?.name ?? device?.short_id} будет удалено. Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button
              variant="destructive"
              className="flex-1"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Удаление..." : "Удалить"}
            </Button>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Отмена
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
