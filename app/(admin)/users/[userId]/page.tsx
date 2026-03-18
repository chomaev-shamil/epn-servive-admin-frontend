"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/api";
import type { AdminUserResponse } from "@/types/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, Mail, Shield, Hash, Send, Smartphone } from "lucide-react";

const FIELD_CONFIG: Record<string, { label: string; mono?: boolean; icon?: typeof Mail }> = {
  id: { label: "User ID", mono: true, icon: Hash },
  email: { label: "Email", icon: Mail },
  firstName: { label: "First Name" },
  role: { label: "Role", icon: Shield },
  referralCode: { label: "Referral Code", mono: true },
  referrerCode: { label: "Referrer Code", mono: true },
  referralLink: { label: "Referral Link", mono: true },
  telegramId: { label: "Telegram ID", mono: true, icon: Send },
  appleId: { label: "Apple ID", mono: true, icon: Smartphone },
  receiptEmail: { label: "Receipt Email", icon: Mail },
  contactCode: { label: "Contact Code", mono: true },
  systemNotification: { label: "System Notification" },
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
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/users">Users</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user?.email ?? userId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Avatar className="size-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {user.email ? user.email.substring(0, 2).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  {user.email ?? "User"}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                    className={user.role === "admin" ? "bg-primary/10 text-primary hover:bg-primary/15" : ""}
                  >
                    {user.role}
                  </Badge>
                  {user.contactCode && (
                    <span className="text-sm text-muted-foreground">
                      Code: {user.contactCode}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Skeleton className="size-12 rounded-full" />
              <div>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="mt-2 h-5 w-20" />
              </div>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-1.5 size-4" />
          Back
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">User Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {user ? (
            <div className="divide-y">
              {Object.entries(user).map(([key, value]) => {
                const config = FIELD_CONFIG[key] ?? { label: key };
                return (
                  <div
                    key={key}
                    className="flex items-start gap-4 px-6 py-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-40 shrink-0">
                      <span className="text-sm text-muted-foreground">
                        {config.label}
                      </span>
                    </div>
                    <div className="flex-1 text-sm">
                      {value === null || value === undefined ? (
                        <span className="text-muted-foreground">--</span>
                      ) : config.mono ? (
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {String(value)}
                        </code>
                      ) : (
                        String(value)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                  <Skeleton className="h-4 w-32" />
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
