"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  superadminListAdminAccess,
  superadminGrantAdminAccess,
  superadminRevokeAdminAccess,
  superadminSetSuperadmin,
  listUsers,
} from "@/lib/api";
import type { SuperadminServiceDTO, AdminAccessDTO, AdminUserResponse } from "@/types/admin";
import { Plus, Trash2, Shield, ShieldOff, Search } from "lucide-react";

export default function SuperadminAccessPage() {
  const [accessList, setAccessList] = useState<AdminAccessDTO[] | null>(null);
  const [services, setServices] = useState<SuperadminServiceDTO[]>([]);
  const [error, setError] = useState("");
  const [grantOpen, setGrantOpen] = useState(false);

  const load = () => {
    superadminListAdminAccess().then(setAccessList).catch((e) => setError(e.message));
    superadminListServices().then(setServices).catch(() => {});
  };

  useEffect(load, []);

  const serviceMap = Object.fromEntries(services.map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Права доступа</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Управление админскими правами и суперадминами
          </p>
        </div>
        <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-1.5" />
              Выдать доступ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Выдать админский доступ</DialogTitle>
            </DialogHeader>
            <GrantAccessForm
              services={services}
              onSubmit={async (data) => {
                await superadminGrantAdminAccess(data);
                setGrantOpen(false);
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

      {/* Admin Access Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Админские доступы к сервисам</CardTitle>
        </CardHeader>
        <CardContent>
          {accessList ? (
            accessList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">User ID</th>
                      <th className="pb-2 font-medium">Сервис</th>
                      <th className="pb-2 font-medium">Дата</th>
                      <th className="pb-2 font-medium text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessList.map((access) => (
                      <tr key={access.id} className="border-b last:border-0">
                        <td className="py-2">
                          <span className="font-mono text-xs">{access.user_id.slice(0, 8)}...</span>
                        </td>
                        <td className="py-2">
                          <Badge variant="outline">
                            {access.service_name ?? access.service_slug ?? serviceMap[access.service_id]?.name ?? access.service_id.slice(0, 8)}
                          </Badge>
                        </td>
                        <td className="py-2 text-muted-foreground">
                          {access.created_at
                            ? new Date(access.created_at).toLocaleDateString("ru-RU")
                            : "—"}
                        </td>
                        <td className="py-2 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={async () => {
                              if (!confirm("Отозвать доступ?")) return;
                              try {
                                await superadminRevokeAdminAccess(access.id);
                                load();
                              } catch (e) {
                                setError(e instanceof Error ? e.message : String(e));
                              }
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Нет записей</p>
            )
          ) : (
            <Skeleton className="h-[150px] w-full" />
          )}
        </CardContent>
      </Card>

      {/* Superadmin Toggle */}
      <SuperadminToggleSection />
    </div>
  );
}

function GrantAccessForm({
  services,
  onSubmit,
}: {
  services: SuperadminServiceDTO[];
  onSubmit: (data: { userId: string; serviceId: string }) => Promise<void>;
}) {
  const [userId, setUserId] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit({ userId, serviceId });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">User ID</label>
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="UUID пользователя"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Сервис</label>
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          required
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.slug})
            </option>
          ))}
        </select>
      </div>
      {error && <div className="text-sm text-destructive">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Сохранение..." : "Выдать доступ"}
      </Button>
    </form>
  );
}

function SuperadminToggleSection() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUserResponse[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await listUsers({ search: search.trim(), limit: 20 });
      setUsers(res.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const toggleSuperadmin = async (userId: string, current: boolean) => {
    const action = current ? "снять суперадмин" : "назначить суперадмином";
    if (!confirm(`Вы уверены, что хотите ${action}?`)) return;
    try {
      await superadminSetSuperadmin(userId, !current);
      handleSearch();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Суперадмин-флаг</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Поиск по email или ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button variant="outline" onClick={handleSearch} disabled={loading}>
            <Search className="size-4" />
          </Button>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        {users && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Пользователь</th>
                  <th className="pb-2 font-medium">Роль</th>
                  <th className="pb-2 font-medium text-right">Суперадмин</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b last:border-0">
                    <td className="py-2">
                      <div className="font-medium">{user.email ?? user.first_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {user.id}
                      </div>
                    </td>
                    <td className="py-2">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="py-2 text-right">
                      <Button
                        variant={user.is_superadmin ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => user.id && toggleSuperadmin(user.id, user.is_superadmin)}
                      >
                        {user.is_superadmin ? (
                          <>
                            <ShieldOff className="size-3.5 mr-1" />
                            Снять
                          </>
                        ) : (
                          <>
                            <Shield className="size-3.5 mr-1" />
                            Назначить
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-muted-foreground">
                      Пользователи не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
