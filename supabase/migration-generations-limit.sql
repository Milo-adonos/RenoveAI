-- Monthly generation limits (30/mois pour le plan mensuel, illimité pour yearly)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS generations_used integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS generations_reset_date timestamptz;
