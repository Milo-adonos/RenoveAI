-- Run AFTER migration-credits-system.sql
-- Migrates existing active subscribers to the credits system while keeping their legacy plan.

UPDATE profiles
SET
  credits_balance = 30,
  credits_reset_date = NOW() + INTERVAL '30 days'
WHERE subscription_status = 'active'
  AND subscription_plan = 'monthly';

UPDATE profiles
SET
  credits_balance = 9999,
  credits_reset_date = NULL
WHERE subscription_status = 'active'
  AND subscription_plan IN ('yearly', 'annual');

UPDATE profiles
SET
  credits_balance = 20,
  credits_reset_date = NOW() + INTERVAL '7 days'
WHERE subscription_status = 'active'
  AND subscription_plan = 'weekly';

-- Active Pro/Discovery users who already paid under the new system (if any)
UPDATE profiles
SET credits_balance = COALESCE(credits_balance, 20)
WHERE subscription_status = 'active'
  AND subscription_plan = 'pro'
  AND (credits_balance IS NULL OR credits_balance = 0);

UPDATE profiles
SET credits_balance = COALESCE(credits_balance, 5)
WHERE subscription_status = 'active'
  AND subscription_plan = 'discovery'
  AND (credits_balance IS NULL OR credits_balance = 0);
