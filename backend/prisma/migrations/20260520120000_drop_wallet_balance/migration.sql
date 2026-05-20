-- Wallet balances are calculated from transactions by the application.
ALTER TABLE "Wallet" DROP COLUMN IF EXISTS "balance";
