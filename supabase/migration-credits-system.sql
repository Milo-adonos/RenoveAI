-- Credits-based pricing system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_balance integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_reset_date timestamptz;

ALTER TABLE profiles DROP COLUMN IF EXISTS generations_used;
ALTER TABLE profiles DROP COLUMN IF EXISTS generations_reset_date;
ALTER TABLE profiles DROP COLUMN IF EXISTS weekly_generations_used;
ALTER TABLE profiles DROP COLUMN IF EXISTS weekly_reset_date;

-- subscription_plan: 'inactive' | 'discovery' | 'pro'
ALTER TABLE profiles ALTER COLUMN subscription_plan SET DEFAULT 'inactive';
