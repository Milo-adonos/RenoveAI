const MAX_SIDE = 768;
const JPEG_QUALITY = 0.78;

export async function compressImageForGeneration(
  file: File
): Promise<{ file: File; width: number; height: number }> {
  if (typeof window === "undefined") {
    return { file, width: 0, height: 0 };
  }

  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  if (width <= MAX_SIDE && height <= MAX_SIDE && file.size <= 1_200_000) {
    bitmap.close();
    return { file, width, height };
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return { file, width, height };
  }

  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });

  if (!blob) {
    return { file, width, height };
  }

  const compressed = new File(
    [blob],
    file.name.replace(/\.\w+$/, "") + ".jpg",
    { type: "image/jpeg" }
  );

  return { file: compressed, width: targetWidth, height: targetHeight };
}
