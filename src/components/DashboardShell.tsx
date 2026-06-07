"use client";

import { DashboardProvider } from "@/contexts/DashboardContext";
import { DashboardNav } from "@/components/DashboardNav";
import { DevBypassBanner } from "@/components/DevBypassBanner";
import { WelcomeToast } from "@/components/WelcomeToast";

export function DashboardShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen">
        <DashboardNav userName={userName} />
        <main className="flex-1 p-6 pb-24 md:pb-6 max-w-5xl">
          <DevBypassBanner />
          <WelcomeToast />
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
}
