"use client";

import { useEffect, useState, useCallback } from "react";
import { listVouchers, deleteVoucher } from "@/lib/api";
import type { AdminVoucherResponse } from "@/types/admin";

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
    <>
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Vouchers</h1>
          <p className="page-subtitle">
            {total > 0 ? `${total} vouchers` : "Manage promotional vouchers"}
          </p>
        </div>
      </div>

      {error && <div className="alert-danger">{error}</div>}

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Amount</th>
              <th>Usage</th>
              <th>Status</th>
              <th>Expires</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading && vouchers.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} style={{ cursor: "default" }}>
                    <td><div className="skeleton" style={{ height: 14, width: 96 }} /></td>
                    <td><div className="skeleton" style={{ height: 14, width: 48 }} /></td>
                    <td><div className="skeleton" style={{ height: 14, width: 40 }} /></td>
                    <td><div className="skeleton" style={{ height: 14, width: 56 }} /></td>
                    <td><div className="skeleton" style={{ height: 14, width: 72 }} /></td>
                    <td></td>
                  </tr>
                ))
              : vouchers.map((v) => (
                  <tr key={v.id ?? v.code} style={{ cursor: "default" }}>
                    <td className="table-cell-mono" style={{ fontWeight: 500 }}>
                      {v.code}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{v.amount}</span>
                      <span style={{ color: "var(--text-tertiary)", marginLeft: 2, fontSize: "0.75rem" }}>
                        RUB
                      </span>
                    </td>
                    <td className="table-cell-mono">
                      {v.used_count}
                      <span style={{ color: "var(--text-tertiary)" }}>/{v.max_uses}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          v.is_active ? "badge--active" : "badge--inactive"
                        }`}
                      >
                        <span className="badge__dot" />
                        {v.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {v.expires_at ? (
                        <span className="table-cell-mono">
                          {new Date(v.expires_at).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="table-cell-muted">No expiry</span>
                      )}
                    </td>
                    <td>
                      {v.id && (
                        <button
                          className="btn-danger btn-sm"
                          onClick={() => handleDelete(v.id!)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            {!loading && vouchers.length === 0 && (
              <tr style={{ cursor: "default" }}>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state__title">No vouchers yet</div>
                    <div className="empty-state__text">
                      Create your first promotional voucher
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > PAGE_SIZE && (
        <div className="pagination">
          <span className="pagination__info">
            {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}
          </span>
          <div className="pagination__controls">
            <button
              className="btn-secondary btn-sm"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              Previous
            </button>
            <button
              className="btn-secondary btn-sm"
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
