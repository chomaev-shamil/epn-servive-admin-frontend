"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { listUsers } from "@/lib/api";
import type { AdminUserResponse } from "@/types/admin";

const PAGE_SIZE = 20;

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listUsers({
        limit: PAGE_SIZE,
        offset,
        search: search || undefined,
      });
      setUsers(res.results);
      setTotal(res.count);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [offset, search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <div className="page-header">
        <div className="page-header__left">
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">
            {total > 0 ? `${total} registered users` : "Manage user accounts"}
          </p>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <svg className="search-input-wrap__icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5L14 14" />
          </svg>
          <input
            type="text"
            placeholder="Search by email or ID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setOffset(0);
            }}
          />
        </div>
      </div>

      {error && <div className="alert-danger">{error}</div>}

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Referral</th>
              <th>Telegram</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ cursor: "default" }}>
                    <td><div className="skeleton" style={{ height: 14, width: "70%" }} /></td>
                    <td><div className="skeleton" style={{ height: 14, width: 48 }} /></td>
                    <td><div className="skeleton" style={{ height: 14, width: 72 }} /></td>
                    <td><div className="skeleton" style={{ height: 14, width: 56 }} /></td>
                    <td><div className="skeleton" style={{ height: 14, width: 40 }} /></td>
                  </tr>
                ))
              : users.map((u) => (
                  <tr key={u.id} onClick={() => router.push(`/users/${u.id}`)}>
                    <td>{u.email ?? <span className="table-cell-muted">No email</span>}</td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === "admin" ? "badge--warning" : "badge--info"
                        }`}
                      >
                        <span className="badge__dot" />
                        {u.role}
                      </span>
                    </td>
                    <td className="table-cell-mono">{u.referralCode}</td>
                    <td>
                      {u.telegramId ? (
                        <span className="table-cell-mono">{u.telegramId}</span>
                      ) : (
                        <span className="table-cell-muted">—</span>
                      )}
                    </td>
                    <td>
                      {u.contactCode ? (
                        <span className="table-cell-mono">{u.contactCode}</span>
                      ) : (
                        <span className="table-cell-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
            {!loading && users.length === 0 && (
              <tr style={{ cursor: "default" }}>
                <td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state__title">No users found</div>
                    <div className="empty-state__text">
                      Try adjusting your search query
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
