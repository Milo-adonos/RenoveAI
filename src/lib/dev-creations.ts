import type { Generation } from "@/types/database";

const DEV_CREATIONS_KEY = "renove_dev_creations";

export function getDevCreations(): Generation[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(DEV_CREATIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Generation[];
  } catch {
    return [];
  }
}

export function addDevCreation(
  data: Omit<Generation, "id" | "user_id" | "created_at"> & {
    id?: string;
  }
): Generation {
  const creation: Generation = {
    id: data.id || `dev-${Date.now()}`,
    user_id: "dev-user-123",
    original_image_url: data.original_image_url,
    generated_image_url: data.generated_image_url,
    style: data.style,
    custom_prompt: data.custom_prompt,
    created_at: new Date().toISOString(),
  };

  const existing = getDevCreations();
  localStorage.setItem(
    DEV_CREATIONS_KEY,
    JSON.stringify([creation, ...existing])
  );

  return creation;
}
