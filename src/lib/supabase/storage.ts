import { createServiceClient } from "./server";
import { isSupabaseConfigured } from "./config";

const BUCKETS = ["originals", "generated"] as const;

export async function ensureBucketsExist() {
  const supabase = await createServiceClient();

  for (const bucket of BUCKETS) {
    const { data: existing } = await supabase.storage.getBucket(bucket);

    if (!existing) {
      console.log(`[storage] Création du bucket "${bucket}"...`);
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 10485760, // 10 Mo
      });

      if (error && !error.message.includes("already exists")) {
        console.error(`[storage] Erreur création bucket "${bucket}":`, error);
        return { ok: false, error: error.message };
      }
      console.log(`[storage] Bucket "${bucket}" prêt`);
    }
  }

  return { ok: true };
}

export async function uploadImageToStorage(
  buffer: Buffer,
  path: string,
  bucket: "originals" | "generated" = "originals",
  contentType = "image/jpeg"
): Promise<{ url: string } | { error: string }> {
  if (!isSupabaseConfigured()) {
    return {
      error:
        "Supabase non configuré — remplis NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY dans .env.local",
    };
  }

  const bucketCheck = await ensureBucketsExist();
  if (!bucketCheck.ok) {
    return { error: `Bucket storage inaccessible : ${bucketCheck.error}` };
  }

  const supabase = await createServiceClient();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType, upsert: true });

  if (uploadError) {
    console.error(`[storage] Upload échoué (${bucket}/${path}):`, uploadError);
    return { error: uploadError.message };
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  console.log(`[storage] Upload OK → ${urlData.publicUrl}`);

  return { url: urlData.publicUrl };
}
