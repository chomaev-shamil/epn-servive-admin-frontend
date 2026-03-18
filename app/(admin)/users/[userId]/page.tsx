"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/api";
import type { AdminUserResponse } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";

const FIELD_LABELS: Record<string, string> = {
  id: "User ID",
  email: "Email",
  firstName: "First Name",
  role: "Role",
  referralCode: "Referral Code",
  referrerCode: "Referrer Code",
  referralLink: "Referral Link",
  telegramId: "Telegram ID",
  appleId: "Apple ID",
  receiptEmail: "Receipt Email",
  contactCode: "Contact Code",
  systemNotification: "System Notification",
};

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AdminUserResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    getUser(userId)
      .then(setUser)
      .catch((e) => setError(e.message));
  }, [userId]);

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/users" />}>
              Users
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user?.email ?? userId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {error && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          {user ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">
                {user.email ?? "User"}
              </h1>
              <div className="mt-1">
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </div>
            </>
          ) : (
            <>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="mt-2 h-5 w-16" />
            </>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-1.5 size-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {user ? (
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {Object.entries(user).map(([key, value]) => (
                <div
                  key={key}
                  className="border-b px-4 py-3 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
                >
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {FIELD_LABELS[key] ?? key}
                  </div>
                  <div className="mt-1 text-sm">
                    {value === null || value === undefined ? (
                      <span className="text-muted-foreground">—</span>
                    ) : ["id", "referralCode", "referrerCode", "telegramId", "appleId", "contactCode"].includes(key) ? (
                      <code className="text-xs">{String(value)}</code>
                    ) : (
                      String(value)
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-b px-4 py-3">
                  <Skeleton className="mb-1.5 h-3 w-20" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
