export type UserRole = "admin" | "user";

export interface OtpRequestResponse {
  expiresAt: string;
  message: string;
}

export interface LoginResponse {
  accessToken: string | null;
  refreshToken: string | null;
  totpToken: string | null;
  totpRequired: boolean;
  totpSetupRequired: boolean;
}

export interface TotpVerifyResponse {
  accessToken: string;
  refreshToken: string;
}

// ── Users ──

export interface AdminUserResponse {
  id: string | null;
  first_name: string | null;
  email: string | null;
  apple_id: string | null;
  telegram_id: string | null;
  role: UserRole;
  is_superadmin: boolean;
  referral_code: string;
  referrer_code: string | null;
  system_notification: string | null;
  fixed_payment_provider: string | null;
  contact_code: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminUsersListResponse {
  count: number;
  results: AdminUserResponse[];
}

// ── Devices ──

export interface AdminDeviceUserDTO {
  id: string;
  email: string | null;
}

export interface AdminDeviceResponse {
  id: string | null;
  short_id: string;
  internal_short_subscription_id: string;
  name: string | null;
  agent: string;
  is_active: boolean;
  hasActiveSubscription: boolean;
  ip_address?: string | null;
  country_code?: string | null;
  platform: string;
  app_version?: string | null;
  device_identifier?: string | null;
  application?: string | null;
  user?: AdminDeviceUserDTO | null;
  created_at?: string | null;
  updated_at?: string | null;
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
  short_id: string;
  user_id: string;
  balance: string;
  allows_test_payments: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminWalletsListResponse {
  count: number;
  results: AdminWalletResponse[];
}

export interface AdminWalletDailyStatsItem {
  date: string;
  deposits: string;
  withdraws: string;
  depositCount: number;
  withdrawCount: number;
  newWallets: number;
}

export type AdminWalletDailyStatsResponse = AdminWalletDailyStatsItem[];

export interface AdminWalletSummaryStatsResponse {
  from: string;
  to: string;
  deposit_total: string;
  withdraw_total: string;
  deposit_count: number;
  withdraw_count: number;
  new_wallets: number;
  payments_by_currency?: Record<string, { total: string; count: string }>;
}

export interface AdminWalletTopUser {
  user_id: string;
  email: string | null;
  first_name: string | null;
  total: string;
  transaction_count: number;
}

export type AdminWalletTopUsersResponse = AdminWalletTopUser[];

// ── Statistics ──

export interface PaymentDayStat {
  date: string;
  totalAmount: number;
  count: number;
}

export interface WalletDayStat {
  date: string;
  depositsCount: number;
  depositsAmount: number;
  withdrawalsCount: number;
  withdrawalsAmount: number;
}

export interface DevicePlatformStat {
  platform: string;
  count: number;
}

export interface DeviceStats {
  byPlatform: DevicePlatformStat[];
  virtualCount: number;
  physicalCount: number;
  activeCount: number;
  inactiveCount: number;
  totalCount: number;
}

export interface UserDayStat {
  date: string;
  newUsers: number;
  referredUsers: number;
}

export interface VoucherDayStat {
  date: string;
  usages: number;
  totalAmount: number;
}

// ── User Traffic Packages ──

export type UserTrafficPackageStatus = "active" | "depleted" | "expired" | "cancelled";

export interface AdminUserTrafficPackageResponse {
  id: string;
  traffic_package_id: string;
  name: string;
  traffic_limit_gb: number;
  price: string;
  status: UserTrafficPackageStatus;
  purchased_at: string | null;
  used_bytes: number;
  usage_synced_at: string | null;
  remnawave_squads_synced: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminUserTrafficPackagesListResponse {
  count: number;
  results: AdminUserTrafficPackageResponse[];
}

// ── Service ──

export interface AdminServiceResponse {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  frontend_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

// ── Payments ──

export interface AdminPaymentResponse {
  id: string;
  user_id: string;
  user_subscription_id: string | null;
  traffic_package_id: string | null;
  user_traffic_package_id: string | null;
  amount: string;
  currency: string;
  amount_in_rub: string | null;
  exchange_rate: string | null;
  payment_provider: string;
  status: string;
  payment_date: string | null;
  charge_at: string | null;
  external_transaction_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminPaymentsListResponse {
  count: number;
  results: AdminPaymentResponse[];
}

// ── Wallet Transactions ──

export interface AdminWalletTransactionResponse {
  id: string;
  wallet_id: string;
  type: string;
  amount: string;
  balance_after: string;
  description: string | null;
  source: string;
  payment_id: string | null;
  user_subscription_id: string | null;
  device_id: string | null;
  created_by_user_id: string | null;
  created_at: string | null;
}

export interface AdminWalletTransactionsListResponse {
  count: number;
  results: AdminWalletTransactionResponse[];
}

// ── Traffic Packages (catalog) ──

export interface AdminTrafficPackageResponse {
  id: string | null;
  name: string;
  description: string | null;
  traffic_limit_gb: number;
  price: string;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminTrafficPackagesListResponse {
  count: number;
  results: AdminTrafficPackageResponse[];
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

// ── Business Metrics ──

export interface BusinessMetrics {
  projectedMonthlyRevenue: number;
  activeDevices: number;
  ltv: number;
  avgTopUpAmount: number;
  totalUsers: number;
  churnRate: number;
  churned: number;
  churnBase: number;
}

export interface TopReferrer {
  userId: string;
  email: string | null;
  firstName: string | null;
  referralCode: string;
  invitedCount: number;
  invitedWithTopupCount: number;
}

// ── Billing ──

export interface PlatformPriceDTO {
  platform: string;
  price_per_day: number;
}

// ── Current User ──

export interface CurrentUserResponse {
  id: string | null;
  firstName: string | null;
  email: string | null;
  isSuperadmin: boolean;
}

// ── Superadmin ──

export interface SuperadminServiceDTO {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  frontend_url: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminAccessDTO {
  id: string;
  user_id: string;
  service_id: string;
  service_slug: string | null;
  service_name: string | null;
  created_at: string | null;
}
