import type { SupabaseClient } from "@supabase/supabase-js";
import { shouldDebitCredits } from "@/lib/credits";

export async function debitOneCredit(
  serviceClient: SupabaseClient,
  userId: string,
  plan: string | null | undefined
): Promise<boolean> {
  if (!shouldDebitCredits(plan)) return true;

  const { data: profile } = await serviceClient
    .from("profiles")
    .select("credits_balance")
    .eq("id", userId)
    .single();

  const balance = profile?.credits_balance ?? 0;
  if (balance <= 0) return false;

  const { data: updated, error } = await serviceClient
    .from("profiles")
    .update({ credits_balance: balance - 1 })
    .eq("id", userId)
    .eq("credits_balance", balance)
    .select("credits_balance")
    .maybeSingle();

  return !error && updated != null;
}
