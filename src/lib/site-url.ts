export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "https://www.renoveai.com";
}
