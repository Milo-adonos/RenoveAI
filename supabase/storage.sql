-- =============================================
-- SUPABASE STORAGE — À exécuter dans le SQL Editor
-- Dashboard → Storage → ou SQL Editor
-- =============================================

-- 1. Créer les buckets (public pour que Kie.ai puisse lire les images)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES
  ('originals', 'originals', true, 10485760),
  ('generated', 'generated', true, 10485760)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Policies pour uploads anonymes (funnel sans compte)
CREATE POLICY "Allow uploads originals"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'originals');

CREATE POLICY "Allow reads originals"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'originals');

CREATE POLICY "Allow uploads generated"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'generated');

CREATE POLICY "Allow reads generated"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'generated');

-- 3. Permettre au service role de tout gérer (déjà bypass RLS par défaut)
