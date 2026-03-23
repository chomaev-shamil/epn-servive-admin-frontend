"use client";

import { useEffect, useState } from "react";
import { getService, updateService } from "@/lib/api";
import type { AdminServiceResponse } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Save, X } from "lucide-react";

export default function ServicePage() {
  const [service, setService] = useState<AdminServiceResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [clientDescription, setClientDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const populateForm = (s: AdminServiceResponse) => {
    setName(s.name);
    setClientDescription(s.client_description ?? "");
  };

  useEffect(() => {
    getService()
      .then((s) => {
        setService(s);
        populateForm(s);
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
        clientDescription: clientDescription || null,
      });
      setService(updated);
      populateForm(updated);
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
    if (service) populateForm(service);
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
              {Array.from({ length: 5 }).map((_, i) => (
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
                <label className="text-sm font-medium mb-1.5 block">Название</label>
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
                <label className="text-sm font-medium mb-1.5 block">Описание для клиентов</label>
                {editing ? (
                  <div className="space-y-1.5">
                    <Textarea
                      value={clientDescription}
                      onChange={(e) => setClientDescription(e.target.value.slice(0, 200))}
                      placeholder="Описание сервиса, которое увидят клиенты"
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {clientDescription.length}/200
                    </p>
                  </div>
                ) : (
                  <div className="rounded border bg-muted/30 px-3 py-2 text-sm">
                    {service.client_description ?? <span className="text-muted-foreground">Не указано</span>}
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
