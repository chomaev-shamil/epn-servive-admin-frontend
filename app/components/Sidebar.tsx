"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  section?: string;
  icon: React.ReactNode;
}

const IconDashboard = () => (
  <svg className="admin-sidebar__link-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
    <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
    <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
  </svg>
);

const IconUsers = () => (
  <svg className="admin-sidebar__link-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="4.5" r="2.5" />
    <path d="M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
    <circle cx="11.5" cy="5" r="1.75" />
    <path d="M11.5 9.5c1.93 0 3.5 1.57 3.5 3.5" />
  </svg>
);

const IconDevices = () => (
  <svg className="admin-sidebar__link-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="3" width="13" height="8.5" rx="1.5" />
    <path d="M5 14h6" />
    <path d="M8 11.5V14" />
  </svg>
);

const IconSubscriptions = () => (
  <svg className="admin-sidebar__link-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4.5h12M2 8h12M2 11.5h8" />
  </svg>
);

const IconWallets = () => (
  <svg className="admin-sidebar__link-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" />
    <path d="M1.5 6.5h13" />
    <circle cx="11" cy="9.5" r="1" />
  </svg>
);

const IconVouchers = () => (
  <svg className="admin-sidebar__link-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4.5h12v7H2z" />
    <path d="M2 8h12" />
    <circle cx="5.5" cy="6.25" r="0.5" fill="currentColor" />
    <circle cx="5.5" cy="9.75" r="0.5" fill="currentColor" />
  </svg>
);

const IconKeys = () => (
  <svg className="admin-sidebar__link-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="7" r="3.5" />
    <path d="M8.25 9L14 9" />
    <path d="M12 9v2" />
    <path d="M14 9v2" />
  </svg>
);

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", section: "Overview", icon: <IconDashboard /> },
  { href: "/users", label: "Users", section: "Management", icon: <IconUsers /> },
  { href: "/devices", label: "Devices", icon: <IconDevices /> },
  { href: "/subscriptions", label: "Subscriptions", icon: <IconSubscriptions /> },
  { href: "/wallets", label: "Wallets", icon: <IconWallets /> },
  { href: "/vouchers", label: "Vouchers", section: "Configuration", icon: <IconVouchers /> },
  { href: "/api-keys", label: "API Keys", icon: <IconKeys /> },
];

export function Sidebar() {
  const pathname = usePathname();

  let lastSection = "";

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__header">
        <Link href="/" className="admin-sidebar__logo">
          <div className="admin-sidebar__logo-mark">E</div>
          <span className="admin-sidebar__logo-text">EPN</span>
          <span className="admin-sidebar__logo-badge">Admin</span>
        </Link>
      </div>

      <div className="admin-sidebar__section">
        <nav className="admin-sidebar__nav">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            const showSection = item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;

            return (
              <div key={item.href}>
                {showSection && (
                  <div className="admin-sidebar__section-label">
                    {item.section}
                  </div>
                )}
                <Link
                  href={item.href}
                  className={`admin-sidebar__link${isActive ? " admin-sidebar__link--active" : ""}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
