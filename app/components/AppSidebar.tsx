"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  Monitor,
  Ticket,
  KeyRound,
  LogOut,
  Receipt,
  ArrowLeftRight,
  Settings,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { clearTokens } from "@/lib/auth";
import { useService } from "@/lib/service-context";

const overviewItems = [
  { href: "/", label: "Главная", icon: LayoutDashboard },
];

const managementItems = [
  { href: "/users", label: "Пользователи", icon: Users },
  { href: "/devices", label: "Устройства", icon: Monitor },
  { href: "/payments", label: "Платежи", icon: Receipt },
  { href: "/transactions", label: "Транзакции", icon: ArrowLeftRight },
];

const configItems = [
  { href: "/service", label: "Сервис", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { services, currentSlug, switchService } = useService();

  const currentService = services.find((s) => s.slug === currentSlug);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleLogout = () => {
    clearTokens();
    router.replace("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {services.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="cursor-pointer">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shrink-0">
                      {currentService?.name?.charAt(0) ?? "E"}
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none flex-1 min-w-0">
                      <span className="font-semibold truncate">{currentService?.name ?? "Сервис"}</span>
                      <span className="text-xs text-muted-foreground truncate">{currentService?.slug}</span>
                    </div>
                    <ChevronsUpDown className="size-4 text-muted-foreground shrink-0" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[--radix-dropdown-menu-trigger-width]">
                  {services.map((service) => (
                    <DropdownMenuItem
                      key={service.slug}
                      onClick={() => switchService(service.slug)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex size-6 items-center justify-center rounded bg-primary/10 text-primary text-xs font-bold shrink-0">
                          {service.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{service.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{service.slug}</span>
                        </div>
                      </div>
                      {service.slug === currentSlug && (
                        <Check className="size-4 text-primary shrink-0" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton size="lg" asChild>
                <Link href="/">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    {currentService?.name?.charAt(0) ?? "E"}
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">{currentService?.name ?? "EPN Admin"}</span>
                    <span className="text-xs text-muted-foreground">Панель управления</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Обзор</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {overviewItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Управление</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Настройки</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {configItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Выйти">
              <LogOut />
              <span>Выйти</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
