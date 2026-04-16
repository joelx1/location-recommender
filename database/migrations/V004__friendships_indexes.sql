-- V004__friendships_indexes.sql
-- Adds indexes on friendships table to speed up bidirectional friend lookups.
-- Applied: 2026-04-09

-- The friendships table is queried in both directions on every feed load,
-- friend list request, and proximity notification check:
--
--   WHERE (requester_id = $me OR addressee_id = $me) AND status = 'accepted'
--
-- Without indexes on both columns, these scan the full table.
-- These two indexes make those lookups fast.

CREATE INDEX IF NOT EXISTS friendships_requester_idx ON friendships (requester_id, status);
CREATE INDEX IF NOT EXISTS friendships_addressee_idx ON friendships (addressee_id, status);
