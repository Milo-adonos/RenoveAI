import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/DashboardShell";
import { isBypassAuthEnabled } from "@/lib/dev-bypass";

export { noIndexMetadata as metadata } from "@/lib/noindex-metadata";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bypass = isBypassAuthEnabled();
  let userName = "Développeur";

  if (!bypass) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth/login");

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    userName =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Utilisateur";
  }

  return <DashboardShell userName={userName}>{children}</DashboardShell>;
}
