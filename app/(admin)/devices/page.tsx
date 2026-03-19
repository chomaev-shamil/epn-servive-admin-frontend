"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { listDevices } from "@/lib/api";
import type { AdminDeviceResponse } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 20;

const PLATFORM_LABELS: Record<string, string> = {
  ios: "iOS",
  ipados: "iPadOS",
  android: "Android",
  macos: "macOS",
  windows: "Windows",
  visionos: "visionOS",
  tvos: "tvOS",
};

export default function DevicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userIdFromUrl = searchParams.get("userId");

  const [devices, setDevices] = useState<AdminDeviceResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [userIdFilter, setUserIdFilter] = useState(userIdFromUrl ?? "");
  const [platformFilter, setPlatformFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listDevices({
        limit: PAGE_SIZE,
        offset,
        userId: userIdFilter || undefined,
        userEmail: (!userIdFilter && searchQuery) ? searchQuery : undefined,
      });
      setDevices(res.results);
      setTotal(res.count);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [offset, userIdFilter, searchQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const hasFilters = userIdFilter || searchQuery;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Устройства</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total > 0 ? `${total} устройств` : "Все устройства пользователей"}
          {userIdFilter && " (фильтр по пользователю)"}
        </p>
      </div>

      <div className="flex gap-3 items-end flex-wrap">
        <div className="relative max-w-xs flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Email пользователя..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setOffset(0);
            }}
            className="pl-9"
            disabled={!!userIdFilter}
          />
        </div>
        <div className="relative max-w-xs flex-1 min-w-48">
          <Input
            placeholder="User ID..."
            value={userIdFilter}
            onChange={(e) => {
              setUserIdFilter(e.target.value);
              setOffset(0);
            }}
          />
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setUserIdFilter("");
              setOffset(0);
            }}
          >
            <X className="mr-1 size-3.5" />
            Сбросить
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="pl-5">Платформа</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Пользователь</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Страна</TableHead>
              <TableHead>Версия</TableHead>
              <TableHead>Создано</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && devices.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-5"><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-14" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))
              : devices.map((d) => (
                  <TableRow
                    key={d.id ?? d.short_id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => d.id && router.push(`/devices/${d.id}`)}
                  >
                    <TableCell className="pl-5">
                      <Badge variant="secondary">
                        {PLATFORM_LABELS[d.platform] ?? d.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {d.name ?? <span className="text-muted-foreground italic">Без имени</span>}
                    </TableCell>
                    <TableCell>
                      {d.user ? (
                        <Link
                          href={`/users/${d.user.id}`}
                          className="text-sm text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {d.user.email ?? d.user.id.slice(0, 8) + "..."}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={d.is_active ? "default" : "secondary"}
                        className={d.is_active ? "bg-emerald-50 text-emerald-700" : ""}
                      >
                        {d.is_active ? "Активно" : "Неактивно"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {d.country_code ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{d.country_code}</code>
                      ) : "--"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.app_version ?? "--"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.created_at
                        ? new Date(d.created_at).toLocaleDateString("ru-RU")
                        : "--"}
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && devices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="text-muted-foreground">
                    <p className="font-medium">Устройства не найдены</p>
                    <p className="mt-1 text-sm">Попробуйте изменить фильтры.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            {offset + 1}--{Math.min(offset + PAGE_SIZE, total)} из {total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}>
              <ChevronLeft className="mr-1 size-4" />Назад
            </Button>
            <Button variant="outline" size="sm" disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset(offset + PAGE_SIZE)}>
              Вперёд<ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
