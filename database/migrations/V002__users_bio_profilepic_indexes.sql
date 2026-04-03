-- V002__users_bio_profilepic_indexes.sql
-- Adds bio and profile_pic to users table.
-- Adds missing foreign key indexes on reviews table.
-- Applied: Week 5

-- ============================================================
-- Users: bio and profile_pic
-- ============================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS bio         VARCHAR(500),
    ADD COLUMN IF NOT EXISTS profile_pic TEXT;

-- profile_pic stores a URL string (Azure Blob Storage) — not the file itself.

-- ============================================================
-- Reviews: foreign key indexes
-- ============================================================

-- PostgreSQL does NOT auto-index foreign key columns.
-- Without these, queries like "all reviews by user X" or
-- "all reviews for location Y" do a full table scan.

CREATE INDEX IF NOT EXISTS reviews_user_id_idx     ON reviews (user_id);
CREATE INDEX IF NOT EXISTS reviews_location_id_idx ON reviews (location_id);
