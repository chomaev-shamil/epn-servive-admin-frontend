"use client";

import { useEffect, useState, useCallback } from "react";
import { listVouchers, deleteVoucher } from "@/lib/api";
import type { AdminVoucherResponse } from "@/types/admin";
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
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

const PAGE_SIZE = 20;

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<AdminVoucherResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listVouchers({ limit: PAGE_SIZE, offset });
      setVouchers(res.results);
      setTotal(res.count);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this voucher?")) return;
    try {
      await deleteVoucher(id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vouchers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total > 0 ? `${total} vouchers total` : "Manage promotional vouchers"}
        </p>
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
              <TableHead className="pl-5">Code</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-14" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && vouchers.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="pl-5"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell />
                  </TableRow>
                ))
              : vouchers.map((v) => (
                  <TableRow key={v.id ?? v.code} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="pl-5">
                      <code className="rounded bg-muted px-2 py-0.5 text-xs font-semibold">
                        {v.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{v.amount}</span>
                      <span className="ml-1 text-xs text-muted-foreground">RUB</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{
                              width: `${Math.min(100, (v.used_count / Math.max(1, v.max_uses)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {v.used_count}/{v.max_uses}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={v.is_active ? "default" : "secondary"}
                        className={
                          v.is_active
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                            : ""
                        }
                      >
                        {v.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {v.expires_at ? (
                        <span className="text-sm text-muted-foreground">
                          {new Date(v.expires_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {v.id && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(v.id!)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            {!loading && vouchers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="text-muted-foreground">
                    <p className="font-medium">No vouchers yet</p>
                    <p className="mt-1 text-sm">Create your first promotional voucher.</p>
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
            Showing {offset + 1}--{Math.min(offset + PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              <ChevronLeft className="mr-1 size-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
