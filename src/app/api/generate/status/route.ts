import { NextRequest, NextResponse } from "next/server";
import { getProgressForState, getTaskStatus } from "@/lib/kie";
import { uploadImageToStorage } from "@/lib/supabase/storage";

export async function GET(request: NextRequest) {
  try {
    const taskId = request.nextUrl.searchParams.get("taskId");
    const pollIndex = Number(request.nextUrl.searchParams.get("poll") ?? "0");

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const status = await getTaskStatus(taskId);
    const progress = getProgressForState(status.state, pollIndex);

    if (status.state === "fail") {
      return NextResponse.json(
        { state: status.state, progress, error: status.failMsg || "Generation failed" },
        { status: 500 }
      );
    }

    if (status.state === "success" && status.resultUrl) {
      const imageRes = await fetch(status.resultUrl);
      const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
      const genPath = `temp/${Date.now()}-generated.jpg`;

      const genResult = await uploadImageToStorage(
        imageBuffer,
        genPath,
        "generated"
      );

      const generatedUrl =
        "error" in genResult ? status.resultUrl : genResult.url;

      return NextResponse.json({
        state: status.state,
        progress: 100,
        generatedUrl,
      });
    }

    return NextResponse.json({
      state: status.state,
      progress,
    });
  } catch (error) {
    console.error("[generate/status] Erreur:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Status check failed",
      },
      { status: 500 }
    );
  }
}
