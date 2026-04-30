"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { listBroadcasts } from "@/lib/api";
import type { BroadcastResponse } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const PAGE_SIZE = 20;

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: "Ожидание", cls: "bg-amber-50 text-amber-700" },
  sending: { label: "Отправляется", cls: "bg-blue-50 text-blue-700" },
  completed: { label: "Отправлена", cls: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Ошибка", cls: "bg-rose-50 text-rose-700" },
  partial: { label: "Частично", cls: "bg-orange-50 text-orange-700" },
};

export default function BroadcastsPage() {
  const router = useRouter();
  const [broadcasts, setBroadcasts] = useState<BroadcastResponse[]>([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listBroadcasts({ page, pageSize: PAGE_SIZE });
      setBroadcasts(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Рассылки</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Отправка сообщений пользователям через Telegram
          </p>
        </div>
        <Button onClick={() => router.push("/broadcasts/new")}>
          <Plus className="mr-1 size-4" />
          Создать рассылку
        </Button>
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
              <TableHead className="pl-5">Сообщение</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Получатели</TableHead>
              <TableHead>Прогресс</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && broadcasts.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-5">
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                  </TableRow>
                ))
              : broadcasts.map((b) => {
                  const st = STATUS_MAP[b.status] ?? {
                    label: b.status,
                    cls: "",
                  };
                  return (
                    <TableRow
                      key={b.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => router.push(`/broadcasts/${b.id}`)}
                    >
                      <TableCell className="pl-5 max-w-xs">
                        <p className="truncate text-sm font-medium">
                          {b.message.slice(0, 80)}
                          {b.message.length > 80 ? "..." : ""}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={st.cls}>
                          {st.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {b.totalCount}
                      </TableCell>
                      <TableCell className="text-sm">
                        {b.status === "pending" ? (
                          <span className="text-muted-foreground">--</span>
                        ) : (
                          <span>
                            <span className="text-emerald-600">
                              {b.sentCount}
                            </span>
                            {b.failedCount > 0 && (
                              <>
                                {" / "}
                                <span className="text-rose-600">
                                  {b.failedCount}
                                </span>
                              </>
                            )}
                            <span className="text-muted-foreground">
                              {" "}
                              / {b.totalCount}
                            </span>
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(b.createdAt).toLocaleString("ru-RU")}
                      </TableCell>
                    </TableRow>
                  );
                })}
            {!loading && broadcasts.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  <p className="font-medium">Рассылок пока нет</p>
                  <p className="mt-1 text-sm">Создайте первую рассылку</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {broadcasts.length >= PAGE_SIZE && (
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="mr-1 size-4" />
            Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            Страница {page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={broadcasts.length < PAGE_SIZE}
            onClick={() => setPage(page + 1)}
          >
            Вперёд
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
