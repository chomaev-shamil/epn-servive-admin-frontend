"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import { getAvailableServices } from "@/lib/api";
import { ServiceProvider, useService } from "@/lib/service-context";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "./AppSidebar";
import { ThemeSwitcher } from "./ThemeSwitcher";

function AdminShell({ children }: { children: React.ReactNode }) {
  const { currentSlug } = useService();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card/50 px-6">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="!h-5" />
          <span className="text-sm text-muted-foreground font-medium">Панель администратора</span>
          <div className="ml-auto">
            <ThemeSwitcher />
          </div>
        </header>
        <div key={currentSlug} className="flex-1 p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm animate-pulse">Загрузка...</div>
      </div>
    );
  }

  return (
    <ServiceProvider fetchServices={getAvailableServices}>
      <AdminShell>{children}</AdminShell>
    </ServiceProvider>
  );
}
