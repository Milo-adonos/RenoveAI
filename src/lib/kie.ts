const KIE_API_BASE = "https://api.kie.ai";

interface KieTaskResponse {
  code: number;
  msg: string;
  data: { taskId: string };
}

interface KieTaskDetail {
  code: number;
  msg: string;
  data: {
    taskId: string;
    state: "waiting" | "queuing" | "generating" | "success" | "fail";
    resultJson?: string;
    failMsg?: string;
  };
}

export async function createGenerationTask(
  imageUrl: string,
  prompt: string
): Promise<string> {
  const response = await fetch(`${KIE_API_BASE}/api/v1/jobs/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KIE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "nano-banana-2",
      input: {
        prompt: `Interior design: ${prompt}. Keep the same room layout and perspective, only change the decor and style.`,
        image_input: [imageUrl],
        aspect_ratio: "auto",
        resolution: "2K",
        output_format: "jpg",
      },
    }),
  });

  const data: KieTaskResponse = await response.json();

  if (data.code !== 200 || !data.data?.taskId) {
    throw new Error(data.msg || "Failed to create generation task");
  }

  return data.data.taskId;
}

export async function pollTaskResult(
  taskId: string,
  maxAttempts = 60,
  intervalMs = 3000
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(
      `${KIE_API_BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.KIE_API_KEY}`,
        },
      }
    );

    const data: KieTaskDetail = await response.json();

    if (data.data?.state === "success" && data.data.resultJson) {
      const result = JSON.parse(data.data.resultJson) as {
        resultUrls: string[];
      };
      if (result.resultUrls?.[0]) {
        return result.resultUrls[0];
      }
    }

    if (data.data?.state === "fail") {
      throw new Error(data.data.failMsg || "Generation failed");
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error("Generation timed out");
}
