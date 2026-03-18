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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Monitor,
  CreditCard,
  Wallet,
  Ticket,
  KeyRound,
} from "lucide-react";

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

  const renderItems = (items: typeof overviewItems) =>
    items.map((item) => {
      const isActive =
        item.href === "/"
          ? pathname === "/"
          : pathname.startsWith(item.href);
      return (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            isActive={isActive}
            render={<Link href={item.href} />}
            tooltip={item.label}
          >
            <item.icon className="size-4" />
            <span>{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background text-xs font-bold">
            E
          </div>
          <span className="text-sm font-semibold tracking-tight">
            EPN Admin
          </span>
        </Link>
      </SidebarHeader>

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
    </Sidebar>
  );
}
