import { env } from "@/lib/env";
import { getAccessToken } from "@/lib/auth";
import type {
  AdminUsersListResponse,
  AdminUserResponse,
  AdminDevicesListResponse,
  AdminDeviceResponse,
  AdminUserSubscriptionsListResponse,
  AdminUserSubscriptionResponse,
  AdminWalletsListResponse,
  AdminWalletResponse,
  AdminWalletDailyStatsResponse,
  AdminWalletSummaryStatsResponse,
  AdminWalletTopUsersResponse,
  AdminVouchersListResponse,
  AdminVoucherResponse,
  AdminApiKeysListResponse,
  AdminApiKeyResponse,
  LoginResponse,
  OtpRequestResponse,
} from "@/types/admin";

const baseUrl = () => env.backendUrl.replace(/\/$/, "");

async function fetchApi<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (init.method !== "GET" && !headers["Content-Type"]) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, { ...init, headers });
  } catch (err) {
    if (err instanceof TypeError && err.message.includes("fetch")) {
      throw new Error(
        "Не удалось подключиться к серверу. Проверьте CORS настройки на бэкенде или подключение к интернету."
      );
    }
    throw err;
  }

  if (res.status === 0) {
    throw new Error(
      "Запрос заблокирован CORS. Убедитесь, что бэкенд возвращает заголовок Access-Control-Allow-Origin."
    );
  }

  if (!res.ok) {
    let errorText: string;
    try {
      errorText = await res.text();
    } catch {
      errorText = "";
    }
    throw new Error(errorText || `HTTP ${res.status}`);
  }

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    if (!text) {
      return {} as T;
    }
    throw new Error(`Ожидался JSON, получен: ${contentType}`);
  }

  try {
    return (await res.json()) as Promise<T>;
  } catch (err) {
    throw new Error(
      `Не удалось распарсить JSON ответ: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// ── Auth ──

export async function requestOtp(email: string): Promise<OtpRequestResponse> {
  return fetchApi("/api/auth/otp/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function loginOtp(
  email: string,
  code: string,
  userAgent: string
): Promise<LoginResponse> {
  return fetchApi("/api/auth/otp/login", {
    method: "POST",
    body: JSON.stringify({ email, code, userAgent }),
  });
}

// ── Users ──

export async function listUsers(
  params?: { limit?: number; offset?: number; search?: string },
  token?: string | null
): Promise<AdminUsersListResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  if (params?.search) search.set("search", params.search);
  const qs = search.toString();
  return fetchApi(`/api/admin/users${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token: t,
  });
}

export async function getUser(
  userId: string,
  token?: string | null
): Promise<AdminUserResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "GET",
    token: t,
  });
}

export async function updateUser(
  userId: string,
  body: Record<string, unknown>,
  token?: string | null
): Promise<AdminUserResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(`/api/admin/users/${encodeURIComponent(userId)}`, {
    method: "PUT",
    body: JSON.stringify(body),
    token: t,
  });
}

// ── Devices ──

export async function listDevices(
  params?: { limit?: number; offset?: number },
  token?: string | null
): Promise<AdminDevicesListResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  return fetchApi(`/api/admin/devices${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token: t,
  });
}

export async function getDevice(
  deviceId: string,
  token?: string | null
): Promise<AdminDeviceResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(`/api/admin/devices/${encodeURIComponent(deviceId)}`, {
    method: "GET",
    token: t,
  });
}

export async function createDevice(
  body: Record<string, unknown>,
  token?: string | null
): Promise<AdminDeviceResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/devices", {
    method: "POST",
    body: JSON.stringify(body),
    token: t,
  });
}

export async function updateDevice(
  deviceId: string,
  body: Record<string, unknown>,
  token?: string | null
): Promise<AdminDeviceResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(`/api/admin/devices/${encodeURIComponent(deviceId)}`, {
    method: "PUT",
    body: JSON.stringify(body),
    token: t,
  });
}

export async function deleteDevice(
  deviceId: string,
  token?: string | null
): Promise<void> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const headers: HeadersInit = { Accept: "application/json" };
  if (t) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(
    `${baseUrl()}/api/admin/devices/${encodeURIComponent(deviceId)}`,
    { method: "DELETE", headers }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

// ── User Subscriptions ──

export async function listUserSubscriptions(
  params?: { limit?: number; offset?: number },
  token?: string | null
): Promise<AdminUserSubscriptionsListResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  return fetchApi(`/api/admin/user-subscriptions${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token: t,
  });
}

export async function getUserSubscription(
  id: string,
  token?: string | null
): Promise<AdminUserSubscriptionResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(
    `/api/admin/user-subscriptions/${encodeURIComponent(id)}`,
    { method: "GET", token: t }
  );
}

export async function updateUserSubscription(
  id: string,
  body: Record<string, unknown>,
  token?: string | null
): Promise<AdminUserSubscriptionResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(
    `/api/admin/user-subscriptions/${encodeURIComponent(id)}`,
    { method: "PUT", body: JSON.stringify(body), token: t }
  );
}

export async function deleteUserSubscription(
  id: string,
  token?: string | null
): Promise<void> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const headers: HeadersInit = { Accept: "application/json" };
  if (t) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(
    `${baseUrl()}/api/admin/user-subscriptions/${encodeURIComponent(id)}`,
    { method: "DELETE", headers }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function updateSubscriptionDates(
  id: string,
  body: Record<string, unknown>,
  token?: string | null
): Promise<AdminUserSubscriptionResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(
    `/api/admin/user-subscriptions/${encodeURIComponent(id)}/dates`,
    { method: "PATCH", body: JSON.stringify(body), token: t }
  );
}

// ── Wallets ──

export async function listWallets(
  params?: { limit?: number; offset?: number },
  token?: string | null
): Promise<AdminWalletsListResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  return fetchApi(`/api/admin/wallets${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token: t,
  });
}

export async function getWallet(
  walletId: string,
  token?: string | null
): Promise<AdminWalletResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(`/api/admin/wallets/${encodeURIComponent(walletId)}`, {
    method: "GET",
    token: t,
  });
}

export async function createWallet(
  body: Record<string, unknown>,
  token?: string | null
): Promise<AdminWalletResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/wallets", {
    method: "POST",
    body: JSON.stringify(body),
    token: t,
  });
}

export async function getWalletDailyStats(
  token?: string | null
): Promise<AdminWalletDailyStatsResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/wallets/stats/daily", { method: "GET", token: t });
}

export async function getWalletSummaryStats(
  token?: string | null
): Promise<AdminWalletSummaryStatsResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/wallets/stats/summary", {
    method: "GET",
    token: t,
  });
}

export async function getWalletTopUsers(
  token?: string | null
): Promise<AdminWalletTopUsersResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/wallets/stats/top-users", {
    method: "GET",
    token: t,
  });
}

// ── Vouchers ──

export async function listVouchers(
  params?: { limit?: number; offset?: number },
  token?: string | null
): Promise<AdminVouchersListResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  return fetchApi(`/api/admin/vouchers${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token: t,
  });
}

export async function getVoucher(
  voucherId: string,
  token?: string | null
): Promise<AdminVoucherResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(`/api/admin/vouchers/${encodeURIComponent(voucherId)}`, {
    method: "GET",
    token: t,
  });
}

export async function createVoucher(
  body: Record<string, unknown>,
  token?: string | null
): Promise<AdminVoucherResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/vouchers", {
    method: "POST",
    body: JSON.stringify(body),
    token: t,
  });
}

export async function deleteVoucher(
  voucherId: string,
  token?: string | null
): Promise<void> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const headers: HeadersInit = { Accept: "application/json" };
  if (t) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(
    `${baseUrl()}/api/admin/vouchers/${encodeURIComponent(voucherId)}`,
    { method: "DELETE", headers }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

// ── API Keys ──

export async function listApiKeys(
  token?: string | null
): Promise<AdminApiKeysListResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/api-keys", { method: "GET", token: t });
}

export async function createApiKey(
  body: Record<string, unknown>,
  token?: string | null
): Promise<AdminApiKeyResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/api-keys", {
    method: "POST",
    body: JSON.stringify(body),
    token: t,
  });
}

export async function deleteApiKey(
  apiKeyId: string,
  token?: string | null
): Promise<void> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const headers: HeadersInit = { Accept: "application/json" };
  if (t) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(
    `${baseUrl()}/api/admin/api-keys/${encodeURIComponent(apiKeyId)}`,
    { method: "DELETE", headers }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function toggleApiKey(
  apiKeyId: string,
  token?: string | null
): Promise<AdminApiKeyResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(
    `/api/admin/api-keys/${encodeURIComponent(apiKeyId)}/toggle`,
    { method: "PATCH", token: t }
  );
}

// ── Remnawave ──

export async function testRemnawaveConnection(
  token?: string | null
): Promise<{ status: string }> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/remnawave/test", { method: "GET", token: t });
}

export async function syncRemnawaveSubscriptions(
  token?: string | null
): Promise<Record<string, unknown>> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/remnawave/sync-subscriptions", {
    method: "POST",
    token: t,
  });
}

export async function syncRemnawaveSubscription(
  subscriptionId: string,
  token?: string | null
): Promise<Record<string, unknown>> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(
    `/api/admin/remnawave/sync-subscription/${encodeURIComponent(subscriptionId)}`,
    { method: "POST", token: t }
  );
}
