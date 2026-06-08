"use client";

import { DashboardProvider } from "@/contexts/DashboardContext";
import { DashboardNav } from "@/components/DashboardNav";
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
        <main className="flex-1 min-w-0 overflow-x-hidden p-4 sm:p-6 pb-24 md:pb-6 max-w-5xl w-full">
          <WelcomeToast />
          {children}
        </main>
      </div>
    </DashboardProvider>
  );
}
