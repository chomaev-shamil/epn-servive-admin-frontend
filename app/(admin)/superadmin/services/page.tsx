"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  superadminListServices,
  superadminCreateService,
  superadminUpdateService,
  superadminDeleteService,
} from "@/lib/api";
import type { SuperadminServiceDTO } from "@/types/admin";
import { Plus, Pencil, Trash2, Server } from "lucide-react";

export default function SuperadminServicesPage() {
  const [services, setServices] = useState<SuperadminServiceDTO[] | null>(null);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editService, setEditService] = useState<SuperadminServiceDTO | null>(null);

  const load = () => {
    superadminListServices().then(setServices).catch((e) => setError(e.message));
  };

  useEffect(load, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Сервисы</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Управление всеми сервисами платформы
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-1.5" />
              Создать сервис
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый сервис</DialogTitle>
            </DialogHeader>
            <ServiceForm
              onSubmit={async (data) => {
                await superadminCreateService(data);
                setCreateOpen(false);
                load();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {services ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                    {service.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{service.slug}</p>
                  </div>
                </div>
                <Badge variant={service.is_active ? "default" : "secondary"}>
                  {service.is_active ? "Активен" : "Неактивен"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {service.domain && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Домен</span>
                    <span className="font-mono text-xs">{service.domain}</span>
                  </div>
                )}
                {service.frontend_url && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frontend</span>
                    <span className="font-mono text-xs truncate max-w-[180px]">{service.frontend_url}</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Dialog
                    open={editService?.id === service.id}
                    onOpenChange={(open) => setEditService(open ? service : null)}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pencil className="size-3.5 mr-1" />
                        Изменить
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Редактировать {service.name}</DialogTitle>
                      </DialogHeader>
                      <ServiceForm
                        initial={service}
                        onSubmit={async (data) => {
                          await superadminUpdateService(service.id, data);
                          setEditService(null);
                          load();
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  {!service.is_active ? null : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={async () => {
                        if (!confirm(`Деактивировать сервис "${service.name}"?`)) return;
                        try {
                          await superadminDeleteService(service.id);
                          load();
                        } catch (e) {
                          setError(e instanceof Error ? e.message : String(e));
                        }
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceForm({
  initial,
  onSubmit,
}: {
  initial?: SuperadminServiceDTO;
  onSubmit: (data: { slug: string; name: string; domain: string | null; frontendUrl: string | null; isActive: boolean }) => Promise<void>;
}) {
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [domain, setDomain] = useState(initial?.domain ?? "");
  const [frontendUrl, setFrontendUrl] = useState(initial?.frontend_url ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        slug,
        name,
        domain: domain || null,
        frontendUrl: frontendUrl || null,
        isActive,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initial && (
        <div>
          <label className="text-sm font-medium mb-1.5 block">Slug</label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-service"
            required
          />
        </div>
      )}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Название</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Service"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Домен</label>
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Frontend URL</label>
        <Input
          value={frontendUrl}
          onChange={(e) => setFrontendUrl(e.target.value)}
          placeholder="https://app.example.com"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Активен</label>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Сохранение..." : initial ? "Сохранить" : "Создать"}
      </Button>
    </form>
  );
}
