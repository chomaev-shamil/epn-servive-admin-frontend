"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Monitor,
  CreditCard,
  Wallet,
  Ticket,
  KeyRound,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearTokens } from "@/lib/auth";
import { useRouter } from "next/navigation";

const overviewItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
];

const managementItems = [
  { href: "/users", label: "Users", icon: Users },
  { href: "/devices", label: "Devices", icon: Monitor },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/wallets", label: "Wallets", icon: Wallet },
];

const configItems = [
  { href: "/vouchers", label: "Vouchers", icon: Ticket },
  { href: "/api-keys", label: "API Keys", icon: KeyRound },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearTokens();
    router.replace("/login");
  };

  const renderItems = (items: typeof overviewItems) =>
    items.map((item) => {
      const isActive =
        item.href === "/"
          ? pathname === "/"
          : pathname.startsWith(item.href);
      return (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
            <Link href={item.href}>
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-sm">
            E
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">EPN Admin</div>
            <div className="text-[11px] text-muted-foreground">Control Panel</div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(overviewItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(managementItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(configItems)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
