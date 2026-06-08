import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const { data: generation } = await supabase
    .from("generations")
    .select("generated_image_url, style, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!generation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const imageRes = await fetch(generation.generated_image_url);
  if (!imageRes.ok) {
    return NextResponse.json(
      { error: "Image unavailable" },
      { status: 502 }
    );
  }

  const buffer = await imageRes.arrayBuffer();
  const dateStr = new Date(generation.created_at)
    .toLocaleDateString("fr-FR")
    .replace(/\//g, "-");
  const styleSlug = (generation.style || "rendu")
    .toLowerCase()
    .replace(/\s+/g, "-");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": imageRes.headers.get("content-type") || "image/jpeg",
      "Content-Disposition": `attachment; filename="renoveai-${styleSlug}-${dateStr}.jpg"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
