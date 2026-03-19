"use client";

import { useEffect, useState } from "react";
import { getService, updateService } from "@/lib/api";
import type { AdminServiceResponse } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Save, X } from "lucide-react";

export default function ServicePage() {
  const [service, setService] = useState<AdminServiceResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // edit state
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [frontendUrl, setFrontendUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getService()
      .then((s) => {
        setService(s);
        setName(s.name);
        setDomain(s.domain ?? "");
        setFrontendUrl(s.frontend_url ?? "");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateService({
        name: name || null,
        domain: domain || null,
        frontendUrl: frontendUrl || null,
      });
      setService(updated);
      setName(updated.name);
      setDomain(updated.domain ?? "");
      setFrontendUrl(updated.frontend_url ?? "");
      setEditing(false);
      setSuccess("Настройки сохранены");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (service) {
      setName(service.name);
      setDomain(service.domain ?? "");
      setFrontendUrl(service.frontend_url ?? "");
    }
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Сервис</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Основные настройки вашего сервиса
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <Card className="shadow-sm max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="rounded-lg bg-blue-50 p-1.5 text-blue-600">
              <Settings className="size-4" />
            </div>
            Настройки сервиса
          </CardTitle>
          {service && !editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Редактировать
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="mb-1.5 h-3 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          ) : service ? (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    ID
                  </label>
                  <code className="block rounded bg-muted px-3 py-2 text-xs">
                    {service.id}
                  </code>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Slug
                  </label>
                  <code className="block rounded bg-muted px-3 py-2 text-xs">
                    {service.slug}
                  </code>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Название
                </label>
                {editing ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Название сервиса"
                  />
                ) : (
                  <div className="rounded border bg-muted/30 px-3 py-2 text-sm">
                    {service.name}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Домен
                </label>
                {editing ? (
                  <Input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                  />
                ) : (
                  <div className="rounded border bg-muted/30 px-3 py-2 text-sm">
                    {service.domain ?? <span className="text-muted-foreground">Не указан</span>}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  URL фронтенда
                </label>
                {editing ? (
                  <Input
                    value={frontendUrl}
                    onChange={(e) => setFrontendUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                ) : (
                  <div className="rounded border bg-muted/30 px-3 py-2 text-sm">
                    {service.frontend_url ?? <span className="text-muted-foreground">Не указан</span>}
                  </div>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Статус
                  </label>
                  <Badge
                    variant={service.is_active ? "default" : "secondary"}
                    className={service.is_active ? "bg-emerald-50 text-emerald-700" : ""}
                  >
                    {service.is_active ? "Активен" : "Неактивен"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                    Создан
                  </label>
                  <div className="text-sm">
                    {service.created_at
                      ? new Date(service.created_at).toLocaleString("ru-RU")
                      : "--"}
                  </div>
                </div>
              </div>

              {editing && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-1.5 size-4" />
                    {saving ? "Сохранение..." : "Сохранить"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="mr-1.5 size-4" />
                    Отмена
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
