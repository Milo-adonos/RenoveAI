"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3X3, User, Sparkles } from "lucide-react";
import { Logo } from "./Logo";

const navItems = [
  { href: "/dashboard/creations", label: "Mes créations", Icon: Grid3X3 },
  { href: "/dashboard/account", label: "Mon compte", Icon: User },
  { href: "/dashboard/new", label: "Nouveau", Icon: Sparkles },
];

const activeColor = "#A0522D";
const inactiveColor = "#8B7D6B";

export function DashboardNav({ userName }: { userName?: string }) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-card shadow-soft min-h-screen p-6 gap-6">
        <Logo />
        {userName && (
          <p className="text-sm text-muted truncate">Bonjour, {userName}</p>
        )}
        <nav className="flex flex-col gap-2">
          {navItems.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                  active
                    ? "bg-accent/10 font-medium"
                    : "text-muted hover:bg-background"
                }`}
                style={{ color: active ? activeColor : inactiveColor }}
              >
                <Icon size={24} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-background flex justify-around py-2 z-50">
        {navItems.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
              style={{ color: active ? activeColor : inactiveColor }}
            >
              <Icon size={24} strokeWidth={2} />
              <span
                className="font-medium"
                style={{ fontSize: 11, fontFamily: "var(--font-inter)" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
