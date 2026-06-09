import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function isAllowedImageHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return (
      hostname.endsWith("kie.ai") ||
      hostname.endsWith("fal.media") ||
      hostname.endsWith("supabase.co") ||
      hostname.endsWith("supabase.in")
    );
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const directUrl = request.nextUrl.searchParams.get("url");

  if (!id && !directUrl) {
    return NextResponse.json({ error: "Missing id or url" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  let imageUrl: string;
  let style: string | null = null;
  let createdAt = new Date().toISOString();

  if (id) {
    const { data: generation } = await supabase
      .from("generations")
      .select("generated_image_url, style, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!generation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    imageUrl = generation.generated_image_url;
    style = generation.style;
    createdAt = generation.created_at;
  } else {
    if (!isAllowedImageHost(directUrl!)) {
      return NextResponse.json({ error: "Invalid url" }, { status: 400 });
    }
    imageUrl = directUrl!;
    style = request.nextUrl.searchParams.get("style");
  }

  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) {
    return NextResponse.json(
      { error: "Image unavailable" },
      { status: 502 }
    );
  }

  const buffer = await imageRes.arrayBuffer();
  const dateStr = new Date(createdAt)
    .toLocaleDateString("fr-FR")
    .replace(/\//g, "-");
  const styleSlug = (style || "rendu")
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
