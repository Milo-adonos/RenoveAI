const DOWNLOAD_TIMEOUT_MS = 30_000;

function filenameFromDisposition(disposition: string | null): string | null {
  if (!disposition) return null;
  const match = disposition.match(/filename="([^"]+)"/);
  return match?.[1] ?? null;
}

type DownloadOptions = {
  imageUrl?: string;
  style?: string | null;
};

export async function downloadGenerationImage(
  generationId: string,
  options?: DownloadOptions
): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  const query = options?.imageUrl
    ? `url=${encodeURIComponent(options.imageUrl)}&style=${encodeURIComponent(options.style || "rendu")}`
    : `id=${generationId}`;

  let res: Response;
  try {
    res = await fetch(`/api/generations/download?${query}`, {
      credentials: "include",
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        "Le téléchargement a pris trop de temps (30 s max). Réessayez."
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    throw new Error("Impossible de télécharger l'image");
  }

  const blob = await res.blob();
  const filename =
    filenameFromDisposition(res.headers.get("Content-Disposition")) ??
    `renoveai-${generationId}.jpg`;
  const file = new File([blob], filename, {
    type: blob.type || "image/jpeg",
  });

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
