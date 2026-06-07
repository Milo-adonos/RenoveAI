export type DevBypassUser = {
  id: string;
  email: string;
  subscription_status: "active";
  subscription_plan: "monthly" | "weekly";
};

export function isBypassAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";
}

export function saveDevBypassUser(plan: "monthly" | "weekly"): void {
  if (typeof window === "undefined") return;

  const user: DevBypassUser = {
    id: "dev-user-123",
    email: "dev@renoveai.com",
    subscription_status: "active",
    subscription_plan: plan,
  };

  sessionStorage.setItem("user", JSON.stringify(user));
}

export function getDevBypassUser(): DevBypassUser | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem("user");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DevBypassUser;
  } catch {
    return null;
  }
}
