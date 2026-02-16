-- ============================================
-- Add missing has_voted column to users table
-- Run this in phpMyAdmin SQL tab
-- ============================================

USE smart_evoting;

-- Add the missing column
ALTER TABLE users 
ADD COLUMN has_voted BOOLEAN DEFAULT 0 AFTER role;

-- Verify it was added
DESCRIBE users;

-- Show success message
SELECT 'Column added successfully!' AS Status;
SELECT * FROM users;
