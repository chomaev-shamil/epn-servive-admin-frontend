"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBroadcast, sendBroadcast, duplicateBroadcast } from "@/lib/api";
import type { BroadcastResponse } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  Send,
  Loader2,
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending: { label: "Ожидание", cls: "bg-amber-50 text-amber-700" },
  sending: { label: "Отправляется", cls: "bg-blue-50 text-blue-700" },
  completed: { label: "Отправлена", cls: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Ошибка", cls: "bg-rose-50 text-rose-700" },
  partial: { label: "Частично", cls: "bg-orange-50 text-orange-700" },
};

const POLL_INTERVAL = 5000;

export default function BroadcastDetailPage() {
  const { broadcastId } = useParams<{ broadcastId: string }>();
  const router = useRouter();
  const [broadcast, setBroadcast] = useState<BroadcastResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getBroadcast(broadcastId);
      setBroadcast(res);
      setLastPolled(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [broadcastId]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while sending
  useEffect(() => {
    if (broadcast?.status === "sending") {
      pollRef.current = setInterval(() => load(false), POLL_INTERVAL);
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [broadcast?.status, load]);

  const handleSend = async () => {
    setSending(true);
    setError("");
    try {
      const res = await sendBroadcast(broadcastId);
      setBroadcast(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
    }
  };

  const handleDuplicate = async () => {
    setDuplicating(true);
    setError("");
    try {
      const res = await duplicateBroadcast(broadcastId);
      router.push(`/broadcasts/${res.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setDuplicating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!broadcast) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/broadcasts")}
        >
          <ChevronLeft className="mr-1 size-4" />
          Назад к рассылкам
        </Button>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error || "Рассылка не найдена"}
        </div>
      </div>
    );
  }

  const st = STATUS_MAP[broadcast.status] ?? {
    label: broadcast.status,
    cls: "",
  };
  const isPending = broadcast.status === "pending";
  const isSending = broadcast.status === "sending";
  const progress =
    broadcast.totalCount > 0
      ? Math.round(
          ((broadcast.sentCount + broadcast.failedCount) /
            broadcast.totalCount) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/broadcasts")}
        >
          <ChevronLeft className="mr-1 size-4" />
          Рассылки
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Рассылка</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <code className="text-xs">{broadcast.id}</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastPolled && (
            <span className="text-xs text-muted-foreground">
              Обновлено{" "}
              {lastPolled.toLocaleTimeString("ru-RU")}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(false)}
            disabled={loading}
          >
            <RefreshCw className="mr-1 size-3.5" />
            Обновить
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
            disabled={duplicating}
          >
            {duplicating ? (
              <Loader2 className="mr-1 size-3.5 animate-spin" />
            ) : (
              <Copy className="mr-1 size-3.5" />
            )}
            Дублировать
          </Button>
          {isPending && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={sending}>
                  {sending ? (
                    <Loader2 className="mr-1 size-4 animate-spin" />
                  ) : (
                    <Send className="mr-1 size-4" />
                  )}
                  Отправить
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Отправить рассылку?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Сообщение будет отправлено{" "}
                    <span className="font-semibold">
                      {broadcast.totalCount}
                    </span>{" "}
                    получателям через Telegram. Это действие нельзя отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSend}>
                    Да, отправить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Users className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{broadcast.totalCount}</p>
                <p className="text-xs text-muted-foreground">Получатели</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{broadcast.sentCount}</p>
                <p className="text-xs text-muted-foreground">Отправлено</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-rose-50 p-2">
                <XCircle className="size-4 text-rose-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {broadcast.failedCount}
                </p>
                <p className="text-xs text-muted-foreground">Ошибки</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Clock className="size-4 text-muted-foreground" />
              </div>
              <div>
                <Badge variant="secondary" className={st.cls}>
                  {st.label}
                </Badge>
                {isSending && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {progress}%
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isSending && (
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Сообщение</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
            {broadcast.message}
          </div>
        </CardContent>
      </Card>

      {broadcast.imageUrl && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Изображение</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={broadcast.imageUrl}
              alt="Broadcast image"
              className="max-h-64 rounded-lg border object-contain"
            />
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle>Информация</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Формат</dt>
              <dd className="font-medium">{broadcast.parseMode}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Создано</dt>
              <dd className="font-medium">
                {new Date(broadcast.createdAt).toLocaleString("ru-RU")}
              </dd>
            </div>
            {broadcast.startedAt && (
              <div>
                <dt className="text-muted-foreground">Начало отправки</dt>
                <dd className="font-medium">
                  {new Date(broadcast.startedAt).toLocaleString("ru-RU")}
                </dd>
              </div>
            )}
            {broadcast.completedAt && (
              <div>
                <dt className="text-muted-foreground">Завершено</dt>
                <dd className="font-medium">
                  {new Date(broadcast.completedAt).toLocaleString("ru-RU")}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Автор</dt>
              <dd className="font-medium">
                <code className="text-xs">{broadcast.createdBy}</code>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
