export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isPlaceholder = (v?: string) =>
    !v || v.includes("XXXX") || v.includes("xxxxxxxx");

  return !isPlaceholder(url) && !isPlaceholder(anonKey) && !isPlaceholder(serviceKey);
}

export function getSupabaseConfigStatus() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "défini" : "manquant",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes("XXXX")
      ? "placeholder"
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? "défini"
        : "manquant",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY?.includes("XXXX")
      ? "placeholder"
      : process.env.SUPABASE_SERVICE_ROLE_KEY
        ? "défini"
        : "manquant",
    configured: isSupabaseConfigured(),
  };
}
