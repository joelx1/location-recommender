-- V005__locations_google_place_id.sql
-- Adds google_place_id to locations table to prevent duplicate entries.
-- Applied: TBD

-- google_place_id is the unique identifier returned by the Google Places API.
-- Used to check whether a location already exists before inserting a new one.
--
-- Nullable: existing locations and manually added places won't have one.
-- PostgreSQL allows multiple NULLs in a UNIQUE column, so this is safe.

ALTER TABLE locations
    ADD COLUMN IF NOT EXISTS google_place_id TEXT UNIQUE;

-- Index is created automatically by the UNIQUE constraint above.
-- Backend can do: SELECT id FROM locations WHERE google_place_id = $1
-- before inserting to check for an existing entry.
