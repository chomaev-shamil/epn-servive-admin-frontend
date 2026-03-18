/**
 * Переменные окружения (NEXT_PUBLIC_* доступны на клиенте).
 * Задаются в .env.local (не коммитить).
 */
export const env = {
  backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL ?? "",
} as const;
