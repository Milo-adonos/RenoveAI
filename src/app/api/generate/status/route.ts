import { NextRequest, NextResponse } from "next/server";
import { getProgressForState, getTaskStatus } from "@/lib/kie";

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
        {
          state: status.state,
          progress,
          error: status.failMsg || "Generation failed",
        },
        { status: 500 }
      );
    }

    if (status.state === "success" && status.resultUrl) {
      return NextResponse.json({
        state: status.state,
        progress: 100,
        generatedUrl: status.resultUrl,
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
