-- fix_nullable_uid.sql
-- Relaxes the requirement for bybit_sub_uid to support OAuth flows that only return keys immediately.

ALTER TABLE user_broker_accounts ALTER COLUMN bybit_sub_uid DROP NOT NULL;
