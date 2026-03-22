"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlatformPrices, updatePlatformPrice } from "@/lib/api";
import type { PlatformPriceDTO } from "@/types/admin";
import { Check, Pencil, X } from "lucide-react";

const PLATFORM_LABELS: Record<string, string> = {
  ios: "iOS",
  android: "Android",
  macos: "macOS",
  windows: "Windows",
  ipados: "iPadOS",
  tvos: "tvOS",
  xros: "xrOS",
  unknown: "Другое",
};

function labelFor(platform: string): string {
  const key = platform.replace(/^DevicePlatform\./i, "").toLowerCase();
  return PLATFORM_LABELS[key] ?? platform;
}

export default function PricingPage() {
  const [prices, setPrices] = useState<PlatformPriceDTO[] | null>(null);
  const [editPlatform, setEditPlatform] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    getPlatformPrices()
      .then(setPrices)
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const startEdit = (p: PlatformPriceDTO) => {
    setEditPlatform(p.platform);
    setEditValue(String(p.price_per_day));
    setError("");
  };

  const cancelEdit = () => {
    setEditPlatform(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editPlatform) return;
    setSaving(true);
    setError("");
    try {
      await updatePlatformPrice(editPlatform, editValue);
      setEditPlatform(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Тарифы</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ежедневная стоимость подписки по платформам
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Цена за день (₽)</CardTitle>
        </CardHeader>
        <CardContent>
          {prices ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Платформа</th>
                    <th className="pb-2 font-medium text-right">Цена / день</th>
                    <th className="pb-2 font-medium text-right w-[120px]">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {prices.map((p) => (
                    <tr key={p.platform} className="border-b last:border-0">
                      <td className="py-3 font-medium">{labelFor(p.platform)}</td>
                      <td className="py-3 text-right">
                        {editPlatform === p.platform ? (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveEdit();
                              if (e.key === "Escape") cancelEdit();
                            }}
                            className="w-[120px] ml-auto text-right"
                            autoFocus
                          />
                        ) : (
                          <span className="font-mono">{p.price_per_day} ₽</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {editPlatform === p.platform ? (
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={saveEdit}
                              disabled={saving}
                            >
                              <Check className="size-4 text-emerald-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEdit}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(p)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Skeleton className="h-[200px] w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
