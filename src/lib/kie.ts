import type { SpaceType } from "@/lib/styles";
import {
  GENERATION_POLL_INTERVAL_MS,
  GENERATION_SAFETY_TIMEOUT_MS,
} from "@/lib/generation-config";

const KIE_API_BASE = "https://api.kie.ai";
const KIE_RESOLUTION = process.env.KIE_RESOLUTION === "2K" ? "2K" : "1K";

const DETECTABLE_SPACE_TYPES: SpaceType[] = [
  "bedroom",
  "living_room",
  "kitchen",
  "bathroom",
  "garden_exterior",
  "facade",
  "office",
  "other",
];

interface KieTaskResponse {
  code: number;
  msg: string;
  data: { taskId: string };
}

export type KieTaskState =
  | "waiting"
  | "queuing"
  | "generating"
  | "success"
  | "fail";

interface KieTaskDetail {
  code: number;
  msg: string;
  data: {
    taskId: string;
    state: KieTaskState;
    resultJson?: string;
    failMsg?: string;
  };
}

export function getProgressForState(
  state: KieTaskState,
  pollIndex = 0
): number {
  switch (state) {
    case "waiting":
      return 20;
    case "queuing":
      return 35;
    case "generating":
      return Math.min(45 + pollIndex * 5, 92);
    case "success":
      return 100;
    default:
      return 10;
  }
}

export async function getTaskStatus(taskId: string): Promise<{
  state: KieTaskState;
  resultUrl?: string;
  failMsg?: string;
}> {
  const response = await fetch(
    `${KIE_API_BASE}/api/v1/jobs/recordInfo?taskId=${taskId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.KIE_API_KEY}`,
      },
    }
  );

  const data: KieTaskDetail = await response.json();

  if (data.code !== 200 || !data.data) {
    throw new Error(data.msg || "Failed to fetch task status");
  }

  const { state, resultJson, failMsg } = data.data;

  if (state === "success" && resultJson) {
    const result = JSON.parse(resultJson) as { resultUrls: string[] };
    return { state, resultUrl: result.resultUrls?.[0] };
  }

  return { state, failMsg };
}

export async function detectSpaceType(imageUrl: string): Promise<SpaceType> {
  try {
    const response = await fetch(
      `${KIE_API_BASE}/gemini-2.5-pro/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.KIE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
                {
                  type: "text",
                  text: `Analyze this image and identify the type of space shown. Respond with ONLY one of these exact labels, nothing else:
bedroom, living_room, kitchen, bathroom, garden_exterior, facade, office, other

Use garden_exterior for gardens, terraces, yards, patios, and outdoor spaces.
Use facade for building exteriors and front facades.
Use other for corridor, garage, basement, or unclear spaces.`,
                },
              ],
            },
          ],
          stream: false,
          reasoning_effort: "low",
          include_thoughts: false,
        }),
      }
    );

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim().toLowerCase() || "";
    const normalized = raw.replace(/[^a-z_]/g, "");

    if (DETECTABLE_SPACE_TYPES.includes(normalized as SpaceType)) {
      return normalized as SpaceType;
    }

    console.warn("[kie] Space detection unrecognized:", raw);
    return "other";
  } catch (error) {
    console.warn("[kie] Space detection failed, using other:", error);
    return "other";
  }
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
        prompt,
        image_input: [imageUrl],
        aspect_ratio: "auto",
        resolution: KIE_RESOLUTION,
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
  maxAttempts = Math.ceil(
    GENERATION_SAFETY_TIMEOUT_MS / GENERATION_POLL_INTERVAL_MS
  ),
  intervalMs = GENERATION_POLL_INTERVAL_MS
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
