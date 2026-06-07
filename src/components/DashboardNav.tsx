"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const navItems = [
  { href: "/dashboard/creations", label: "Mes créations", icon: "🖼️" },
  { href: "/dashboard/account", label: "Mon compte", icon: "⚙️" },
];

export function DashboardNav({ userName }: { userName?: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-card shadow-soft min-h-screen p-6 gap-6">
        <Logo />
        {userName && (
          <p className="text-sm text-muted truncate">Bonjour, {userName}</p>
        )}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                pathname === item.href
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted hover:bg-background"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/upload" className="btn-primary mt-auto">
          + Nouvelle création
        </Link>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-background flex justify-around py-3 z-50">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 text-xs ${
              pathname === item.href ? "text-accent font-medium" : "text-muted"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <Link
          href="/upload"
          className="flex flex-col items-center gap-1 text-xs text-accent font-medium"
        >
          <span className="text-lg">✨</span>
          Nouveau
        </Link>
      </nav>
    </>
  );
}
