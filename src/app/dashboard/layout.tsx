import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardNav } from "@/components/DashboardNav";
import { WelcomeToast } from "@/components/WelcomeToast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const userName =
    profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0];

  return (
    <div className="flex min-h-screen">
      <DashboardNav userName={userName} />
      <main className="flex-1 p-6 pb-24 md:pb-6 max-w-5xl">
        <WelcomeToast />
        {children}
      </main>
    </div>
  );
}
