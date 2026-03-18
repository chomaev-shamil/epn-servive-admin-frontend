export type UserRole = "admin" | "user";

export interface OtpRequestResponse {
  expiresAt: string;
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

// ── Users ──

export interface AdminUserResponse {
  id: string;
  email: string | null;
  firstName: string | null;
  appleId: string | null;
  telegramId: string | null;
  referralCode: string;
  referrerCode: string | null;
  referralLink: string | null;
  role: UserRole;
  receiptEmail: string | null;
  systemNotification?: string | null;
  contactCode?: string | null;
}

export interface AdminUsersListResponse {
  count: number;
  results: AdminUserResponse[];
}

// ── Devices ──

export interface AdminDeviceResponse {
  id: string | null;
  shortId: string;
  userId?: string | null;
  name: string | null;
  agent: string;
  isVirtual?: boolean;
  expireAt?: string | null;
  platform?: string | null;
  createdAt?: string | null;
}

export interface AdminDevicesListResponse {
  count: number;
  results: AdminDeviceResponse[];
}

// ── User Subscriptions ──

export interface AdminUserSubscriptionResponse {
  id: string | null;
  userId: string;
  subscriptionId: string;
  subscriptionName: string | null;
  status: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  autoRenewal: boolean;
  isTrial: boolean;
  currentPrice: string;
  duration: string;
  createdAt: string | null;
  updatedAt: string | null;
  maxDevices: number | null;
  supportedPlatforms: string[] | null;
}

export interface AdminUserSubscriptionsListResponse {
  count: number;
  results: AdminUserSubscriptionResponse[];
}

// ── Wallets ──

export interface AdminWalletResponse {
  id: string | null;
  shortId: string;
  userId: string;
  balance: string;
  allowsTestPayments: boolean;
}

export interface AdminWalletsListResponse {
  count: number;
  results: AdminWalletResponse[];
}

export interface AdminWalletDailyStatsResponse {
  [key: string]: unknown;
}

export interface AdminWalletSummaryStatsResponse {
  [key: string]: unknown;
}

export interface AdminWalletTopUsersResponse {
  [key: string]: unknown;
}

// ── Vouchers ──

export interface AdminVoucherResponse {
  id: string | null;
  code: string;
  amount: string;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_by_user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminVouchersListResponse {
  count: number;
  results: AdminVoucherResponse[];
}

// ── API Keys ──

export interface AdminApiKeyResponse {
  id: string;
  name: string;
  key?: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminApiKeysListResponse {
  count: number;
  results: AdminApiKeyResponse[];
}
