-- À coller dans Supabase → SQL Editor → Run
-- Ajoute les colonnes pour le plan hebdomadaire (20 générations/semaine)

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_generations_used integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_reset_date timestamptz;
