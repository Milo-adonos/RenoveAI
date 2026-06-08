import { redirect } from "next/navigation";

export default function DashboardPage({
  searchParams,
}: {
  searchParams: { success?: string };
}) {
  const suffix = searchParams.success === "true" ? "?success=true" : "";
  redirect(`/dashboard/creations${suffix}`);
}
