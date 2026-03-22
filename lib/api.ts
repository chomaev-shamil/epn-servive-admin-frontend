import { env } from "@/lib/env";
import { getAccessToken } from "@/lib/auth";
import { getServiceSlug, type AvailableService } from "@/lib/service-context";
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
  AdminUserTrafficPackagesListResponse,
  AdminTrafficPackagesListResponse,
  AdminServiceResponse,
  AdminPaymentsListResponse,
  AdminWalletTransactionsListResponse,
  LoginResponse,
  TotpVerifyResponse,
  OtpRequestResponse,
  PaymentDayStat,
  WalletDayStat,
  DeviceStats,
  UserDayStat,
  VoucherDayStat,
  SuperadminServiceDTO,
  AdminAccessDTO,
  CurrentUserResponse,
  PlatformPriceDTO,
  BusinessMetrics,
  TopReferrer,
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
  const slug = getServiceSlug();
  if (slug) {
    (headers as Record<string, string>)["X-Service-Slug"] = slug;
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

export async function verifyTotp(
  totpToken: string,
  code: string
): Promise<TotpVerifyResponse> {
  return fetchApi("/api/auth/totp/verify", {
    method: "POST",
    body: JSON.stringify({ totpToken, code }),
  });
}

export async function getCurrentUser(
  token?: string | null
): Promise<CurrentUserResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/users/me", { method: "GET", token: t });
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

export async function getUserWallet(
  userId: string,
  token?: string | null
): Promise<AdminWalletResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(`/api/admin/users/${encodeURIComponent(userId)}/wallet`, {
    method: "GET",
    token: t,
  });
}

export async function depositToWallet(
  walletId: string,
  body: { amount: number | string; description?: string },
  token?: string | null
): Promise<AdminWalletResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(`/api/admin/wallets/${encodeURIComponent(walletId)}/deposit`, {
    method: "POST",
    body: JSON.stringify(body),
    token: t,
  });
}

// ── Devices ──

export async function listDevices(
  params?: { limit?: number; offset?: number; userEmail?: string; userId?: string },
  token?: string | null
): Promise<AdminDevicesListResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  if (params?.userEmail) search.set("userEmail", params.userEmail);
  if (params?.userId) search.set("userId", params.userId);
  const qs = search.toString();
  return fetchApi(`/api/admin/devices${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token: t,
  });
}

export async function getUserTrafficPackages(
  userId: string,
  params?: { status?: string; limit?: number; offset?: number },
  token?: string | null
): Promise<AdminUserTrafficPackagesListResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  return fetchApi(
    `/api/admin/users/${encodeURIComponent(userId)}/traffic-packages${qs ? `?${qs}` : ""}`,
    { method: "GET", token: t }
  );
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
  params?: { from?: string; to?: string },
  token?: string | null
): Promise<AdminWalletSummaryStatsResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  const qs = search.toString();
  return fetchApi(`/api/admin/wallets/stats/summary${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token: t,
  });
}

export async function getWalletTopUsers(
  params?: { from?: string; to?: string; limit?: number },
  token?: string | null
): Promise<AdminWalletTopUsersResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.limit != null) search.set("limit", String(params.limit));
  const qs = search.toString();
  return fetchApi(`/api/admin/wallets/stats/top-users${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token: t,
  });
}

// ── Statistics ──

export async function getBusinessMetrics(
  token?: string | null
): Promise<BusinessMetrics> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/statistics/metrics", { method: "GET", token: t });
}

export async function getTopReferrers(
  params?: { limit?: number },
  token?: string | null
): Promise<TopReferrer[]> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.limit != null) search.set("limit", String(params.limit));
  const qs = search.toString();
  return fetchApi(`/api/admin/statistics/top-referrers${qs ? `?${qs}` : ""}`, { method: "GET", token: t });
}

export async function getPaymentDailyStats(
  params?: { fromDate?: string; toDate?: string },
  token?: string | null
): Promise<PaymentDayStat[]> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.fromDate) search.set("fromDate", params.fromDate);
  if (params?.toDate) search.set("toDate", params.toDate);
  const qs = search.toString();
  return fetchApi(`/api/admin/statistics/payments/daily${qs ? `?${qs}` : ""}`, { method: "GET", token: t });
}

export async function getWalletDailyStatistics(
  params?: { fromDate?: string; toDate?: string },
  token?: string | null
): Promise<WalletDayStat[]> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.fromDate) search.set("fromDate", params.fromDate);
  if (params?.toDate) search.set("toDate", params.toDate);
  const qs = search.toString();
  return fetchApi(`/api/admin/statistics/wallets/daily${qs ? `?${qs}` : ""}`, { method: "GET", token: t });
}

export async function getDeviceStats(
  token?: string | null
): Promise<DeviceStats> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/statistics/devices", { method: "GET", token: t });
}

export async function getUserDailyStats(
  params?: { fromDate?: string; toDate?: string },
  token?: string | null
): Promise<UserDayStat[]> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.fromDate) search.set("fromDate", params.fromDate);
  if (params?.toDate) search.set("toDate", params.toDate);
  const qs = search.toString();
  return fetchApi(`/api/admin/statistics/users/daily${qs ? `?${qs}` : ""}`, { method: "GET", token: t });
}

export async function getVoucherDailyStats(
  params?: { fromDate?: string; toDate?: string },
  token?: string | null
): Promise<VoucherDayStat[]> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.fromDate) search.set("fromDate", params.fromDate);
  if (params?.toDate) search.set("toDate", params.toDate);
  const qs = search.toString();
  return fetchApi(`/api/admin/statistics/vouchers/daily${qs ? `?${qs}` : ""}`, { method: "GET", token: t });
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

// ── Service ──

export async function getAvailableServices(
  token?: string | null
): Promise<AvailableService[]> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/service/available", { method: "GET", token: t });
}

export async function getService(
  token?: string | null
): Promise<AdminServiceResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/service", { method: "GET", token: t });
}

export async function updateService(
  body: { name?: string | null; domain?: string | null; frontendUrl?: string | null },
  token?: string | null
): Promise<AdminServiceResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/service", {
    method: "PATCH",
    body: JSON.stringify(body),
    token: t,
  });
}

// ── Payments ──

export async function listPayments(
  params?: { userId?: string; status?: string; provider?: string; fromDate?: string; toDate?: string; limit?: number; offset?: number },
  token?: string | null
): Promise<AdminPaymentsListResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.userId) search.set("userId", params.userId);
  if (params?.status) search.set("status", params.status);
  if (params?.provider) search.set("provider", params.provider);
  if (params?.fromDate) search.set("fromDate", params.fromDate);
  if (params?.toDate) search.set("toDate", params.toDate);
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  return fetchApi(`/api/admin/payments${qs ? `?${qs}` : ""}`, { method: "GET", token: t });
}

// ── Wallet Transactions ──

export async function listWalletTransactions(
  params?: { userId?: string; type?: string; source?: string; fromDate?: string; toDate?: string; limit?: number; offset?: number },
  token?: string | null
): Promise<AdminWalletTransactionsListResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.userId) search.set("userId", params.userId);
  if (params?.type) search.set("type", params.type);
  if (params?.source) search.set("source", params.source);
  if (params?.fromDate) search.set("fromDate", params.fromDate);
  if (params?.toDate) search.set("toDate", params.toDate);
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  return fetchApi(`/api/admin/wallet-transactions${qs ? `?${qs}` : ""}`, { method: "GET", token: t });
}

// ── Traffic Packages (catalog) ──

export async function listTrafficPackages(
  params?: { isActive?: boolean; limit?: number; offset?: number },
  token?: string | null
): Promise<AdminTrafficPackagesListResponse> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.isActive != null) search.set("isActive", String(params.isActive));
  if (params?.limit != null) search.set("limit", String(params.limit));
  if (params?.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  return fetchApi(`/api/admin/traffic-packages${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token: t,
  });
}

export async function purchasePackageForUser(
  packageId: string,
  userId: string,
  token?: string | null
): Promise<void> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (t) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(
    `${baseUrl()}/api/admin/traffic-packages/${encodeURIComponent(packageId)}/purchase`,
    { method: "POST", headers, body: JSON.stringify({ user_id: userId }) }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

// ── Billing ──

export async function getPlatformPrices(
  token?: string | null
): Promise<PlatformPriceDTO[]> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/admin/billing/prices", { method: "GET", token: t });
}

export async function updatePlatformPrice(
  platform: string,
  pricePerDay: number | string,
  token?: string | null
): Promise<PlatformPriceDTO> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(`/api/admin/billing/prices/${encodeURIComponent(platform)}`, {
    method: "PATCH",
    body: JSON.stringify({ price_per_day: pricePerDay }),
    token: t,
  });
}

// ── Superadmin ──

export async function superadminListServices(
  token?: string | null
): Promise<SuperadminServiceDTO[]> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/superadmin/services", { method: "GET", token: t });
}

export async function superadminCreateService(
  body: { slug: string; name: string; domain?: string | null; frontendUrl?: string | null; isActive?: boolean },
  token?: string | null
): Promise<SuperadminServiceDTO> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/superadmin/services", {
    method: "POST",
    body: JSON.stringify(body),
    token: t,
  });
}

export async function superadminUpdateService(
  serviceId: string,
  body: { name?: string | null; domain?: string | null; frontendUrl?: string | null; isActive?: boolean | null },
  token?: string | null
): Promise<SuperadminServiceDTO> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(`/api/superadmin/services/${encodeURIComponent(serviceId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    token: t,
  });
}

export async function superadminDeleteService(
  serviceId: string,
  token?: string | null
): Promise<void> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const headers: HeadersInit = { Accept: "application/json" };
  if (t) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(
    `${baseUrl()}/api/superadmin/services/${encodeURIComponent(serviceId)}`,
    { method: "DELETE", headers }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function superadminListAdminAccess(
  params?: { userId?: string; serviceId?: string },
  token?: string | null
): Promise<AdminAccessDTO[]> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const search = new URLSearchParams();
  if (params?.userId) search.set("userId", params.userId);
  if (params?.serviceId) search.set("serviceId", params.serviceId);
  const qs = search.toString();
  return fetchApi(`/api/superadmin/admin-access${qs ? `?${qs}` : ""}`, {
    method: "GET",
    token: t,
  });
}

export async function superadminGrantAdminAccess(
  body: { userId: string; serviceId: string },
  token?: string | null
): Promise<AdminAccessDTO> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi("/api/superadmin/admin-access", {
    method: "POST",
    body: JSON.stringify(body),
    token: t,
  });
}

export async function superadminRevokeAdminAccess(
  accessId: string,
  token?: string | null
): Promise<void> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  const headers: HeadersInit = { Accept: "application/json" };
  if (t) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${t}`;
  }
  const res = await fetch(
    `${baseUrl()}/api/superadmin/admin-access/${encodeURIComponent(accessId)}`,
    { method: "DELETE", headers }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function superadminSetSuperadmin(
  userId: string,
  isSuperadmin: boolean,
  token?: string | null
): Promise<Record<string, unknown>> {
  const t = token ?? (typeof window !== "undefined" ? getAccessToken() : null);
  return fetchApi(`/api/superadmin/users/${encodeURIComponent(userId)}/superadmin`, {
    method: "PATCH",
    body: JSON.stringify({ isSuperadmin }),
    token: t,
  });
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
