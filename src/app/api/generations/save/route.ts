import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { originalUrl, generatedUrl, style, customPrompt, originalPath } =
      await request.json();

    if (!originalUrl || !generatedUrl) {
      return NextResponse.json(
        { error: "Missing image URLs" },
        { status: 400 }
      );
    }

    const serviceClient = await createServiceClient();
    let finalOriginalUrl = originalUrl;

    // Move from temp to permanent if we have a storage path
    if (originalPath && originalPath.startsWith("temp/")) {
      const permanentPath = originalPath.replace("temp/", "permanent/");
      const { data: fileData } = await serviceClient.storage
        .from("originals")
        .download(originalPath);

      if (fileData) {
        await serviceClient.storage
          .from("originals")
          .upload(permanentPath, fileData, { upsert: true });

        const { data: urlData } = serviceClient.storage
          .from("originals")
          .getPublicUrl(permanentPath);

        finalOriginalUrl = urlData.publicUrl;
        await serviceClient.storage.from("originals").remove([originalPath]);
      }
    }

    const { data, error } = await serviceClient
      .from("generations")
      .insert({
        user_id: user.id,
        original_image_url: finalOriginalUrl,
        generated_image_url: generatedUrl,
        style: style || null,
        custom_prompt: customPrompt || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ generation: data });
  } catch (error) {
    console.error("Save generation error:", error);
    return NextResponse.json(
      { error: "Failed to save generation" },
      { status: 500 }
    );
  }
}
