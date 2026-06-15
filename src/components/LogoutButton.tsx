"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type LogoutButtonProps = {
  variant?: "sidebar" | "account";
};

export function LogoutButton({ variant = "sidebar" }: LogoutButtonProps) {
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (variant === "account") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        className="md:hidden w-full flex items-center justify-center gap-2 text-[13px] text-[#8B7D6B] border border-muted/30 px-4 py-3 rounded-xl hover:bg-background transition-colors mt-6"
      >
        <LogOut size={16} strokeWidth={2} />
        Se déconnecter
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-muted hover:bg-background transition-colors w-full text-left"
      style={{ color: "#8B7D6B" }}
    >
      <LogOut size={24} strokeWidth={2} />
      Se déconnecter
    </button>
  );
}
