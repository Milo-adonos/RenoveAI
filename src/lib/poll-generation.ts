import {
  GENERATION_POLL_INTERVAL_MS,
  GENERATION_SAFETY_TIMEOUT_MS,
} from "@/lib/generation-config";

const SAFETY_TIMEOUT_MESSAGE =
  "La génération a pris trop de temps (25 s max). Réessayez.";

export async function resolveGenerationResponse(
  data: { generatedUrl?: string; taskId?: string },
  startedAt = Date.now()
): Promise<string> {
  if (data.generatedUrl) return data.generatedUrl;
  if (!data.taskId) throw new Error("La génération a échoué");
  return pollGenerationUntilDone(data.taskId, startedAt);
}

export async function pollGenerationUntilDone(
  taskId: string,
  startedAt = Date.now()
): Promise<string> {
  let pollIndex = 0;

  while (true) {
    if (Date.now() - startedAt >= GENERATION_SAFETY_TIMEOUT_MS) {
      throw new Error(SAFETY_TIMEOUT_MESSAGE);
    }

    const statusRes = await fetch(
      `/api/generate/status?taskId=${taskId}&poll=${pollIndex}`
    );
    const statusData = await statusRes.json();
    pollIndex += 1;

    if (!statusRes.ok) {
      throw new Error(statusData.error || "La génération a échoué");
    }

    if (statusData.state === "fail") {
      throw new Error(statusData.error || "La génération IA a échoué");
    }

    if (statusData.state === "success" && statusData.generatedUrl) {
      return statusData.generatedUrl as string;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, GENERATION_POLL_INTERVAL_MS)
    );
  }
}
