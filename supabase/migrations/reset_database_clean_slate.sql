-- =====================================================
-- DATABASE RESET - CLEAN SLATE MIGRATION
-- =====================================================
-- This migration deletes ALL existing tables to start fresh
-- with proper separation between admin and customer entities
-- 
-- CRITICAL: This will delete ALL data in the database
-- =====================================================

-- Drop all existing tables in correct order (respecting foreign key constraints)

-- Drop tables with foreign key dependencies first
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS daily_journal CASCADE;
DROP TABLE IF EXISTS trades CASCADE;

-- Drop main entity tables
DROP TABLE IF EXISTS customer_profiles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any remaining sequences or functions if they exist
DROP SEQUENCE IF EXISTS order_number_seq CASCADE;

-- Verify all tables are dropped
-- (This is just for logging - the tables should be gone)

-- Log the reset action
DO $$
BEGIN
    RAISE NOTICE 'Database reset completed - all tables dropped';
    RAISE NOTICE 'Ready for clean schema creation';
END $$;