"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { listPayments } from "@/lib/api";
import type { AdminPaymentResponse } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

const PAGE_SIZE = 20;

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: "Ожидание", cls: "bg-amber-50 text-amber-700" },
  completed: { label: "Завершён", cls: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Ошибка", cls: "bg-rose-50 text-rose-700" },
  refunded: { label: "Возврат", cls: "bg-blue-50 text-blue-700" },
  canceled: { label: "Отменён", cls: "bg-muted text-muted-foreground" },
};

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const userIdFromUrl = searchParams.get("userId");

  const [payments, setPayments] = useState<AdminPaymentResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [userIdFilter, setUserIdFilter] = useState(userIdFromUrl ?? "");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listPayments({
        limit: PAGE_SIZE,
        offset,
        userId: userIdFilter || undefined,
      });
      setPayments(res.results);
      setTotal(res.count);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [offset, userIdFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Платежи</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total > 0 ? `${total} платежей` : "История платежей"}
          {userIdFilter && " (фильтр по пользователю)"}
        </p>
      </div>

      <div className="flex gap-3 items-end">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Фильтр по User ID..."
            value={userIdFilter}
            onChange={(e) => {
              setUserIdFilter(e.target.value);
              setOffset(0);
            }}
            className="pl-9"
          />
        </div>
        {userIdFilter && (
          <Button variant="ghost" size="sm" onClick={() => { setUserIdFilter(""); setOffset(0); }}>
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
              <TableHead className="pl-5">Дата</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Провайдер</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>User ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && payments.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-5"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              : payments.map((p) => {
                  const st = STATUS_MAP[p.status] ?? { label: p.status, cls: "" };
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="pl-5 text-sm">
                        {p.payment_date
                          ? new Date(p.payment_date).toLocaleString("ru-RU")
                          : p.created_at
                            ? new Date(p.created_at).toLocaleString("ru-RU")
                            : "--"}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">{p.amount}</span>
                        <span className="ml-1 text-xs text-muted-foreground">{p.currency}</span>
                        {p.amount_in_rub && p.currency !== "RUB" && (
                          <span className="ml-1 text-xs text-muted-foreground">({p.amount_in_rub} RUB)</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{p.payment_provider}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={st.cls}>{st.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs text-muted-foreground">{p.user_id.slice(0, 8)}...</code>
                      </TableCell>
                    </TableRow>
                  );
                })}
            {!loading && payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  Платежей не найдено
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
