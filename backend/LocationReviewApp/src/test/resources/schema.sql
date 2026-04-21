-- Test schema for H2 in-memory database.
-- Only includes tables needed by tests — skips Location/Review/etc. because
-- they use PostGIS geography types that H2 doesn't support.

CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    azure_oid VARCHAR(255) UNIQUE,
    bio VARCHAR(500),
    profile_pic VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
