import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolvePostAuthRedirectPath } from "@/lib/post-auth-redirect";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const path = await resolvePostAuthRedirectPath(supabase, user.id);
  return NextResponse.redirect(new URL(path, request.url));
}
