---
title: Database Schema Draft
project: Microsoft Project (CS335)
role: Jack James — Database
status: Draft (Week 3)
tags: [database, postgresql, postgis, schema]
---

# Database Schema Draft

PostgreSQL + PostGIS. Four tables for Week 3 — kept minimal so backend can get started. Columns like `bio`, `profile_pic`, `score`, etc. will be added in later weeks.

> **Note for backend:** The `users` table does **not** store passwords. Azure Entra ID handles all auth — backend receives a validated token, then syncs `id`, `email`, and `username` into this table on first login. Don't add a `password_hash` column. Check on the auth flow before building the login endpoint.

---

## Setup

Run this once before creating any tables:

```sql
-- postgis: adds support for storing and querying geographic data (coordinates, distances, etc.)
CREATE EXTENSION IF NOT EXISTS postgis;

-- pgcrypto: gives us gen_random_uuid() so each row gets a unique ID automatically
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## Tables

### `users`

```sql
-- Stores the app's user accounts.
-- Passwords are NOT stored here — Azure Entra ID handles login and authentication.
-- This table is populated when a user logs in for the first time.
CREATE TABLE users (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- unique ID, auto-generated
    username   VARCHAR(50)  UNIQUE NOT NULL,               -- no two users can share a username
    email      VARCHAR(255) UNIQUE NOT NULL,               -- no two users can share an email
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()          -- timestamp with timezone, set automatically
);
```

---

### `locations`

```sql
-- Stores physical places (bars, restaurants, etc.) added by users.
CREATE TABLE locations (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    category   VARCHAR(50)  NOT NULL,                      -- e.g. 'bar', 'restaurant', 'cafe', 'club'
    address    TEXT,                                       -- freeform address text, can be null
    geo        GEOGRAPHY(POINT, 4326) NOT NULL,            -- stores the lat/lng coordinates as a spatial point
                                                           -- 4326 is the standard coordinate system used by GPS
    created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- who added it; set to null if that user deletes their account
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A spatial index on the geo column.
-- This is required by PostGIS to make any distance/proximity queries run efficiently.
-- Without it, every search would scan the entire table.
CREATE INDEX locations_geo_idx ON locations USING GIST (geo);
```

---

### `reviews`

```sql
-- Stores a user's written review of a location.
CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,     -- which user wrote it; deleted if user is deleted
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE, -- which location it's about; deleted if location is deleted
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),         -- enforced at DB level, not just in the app
    body        TEXT,                                                      -- the written review; optional, rating alone is valid
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, location_id) -- prevents a user from submitting more than one review per location
);
```

---

### `friendships`

```sql
-- Stores friend relationships between users.
-- Uses a directional model: the person who sends the request is the requester,
-- the person who receives it is the addressee.
-- A row is created when a request is sent (status = 'pending'),
-- and updated to 'accepted' when the other person accepts.
CREATE TABLE friendships (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- user who sent the request
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- user who received the request
    status       VARCHAR(10) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'accepted', 'blocked')), -- only these three values are valid
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (requester_id, addressee_id),       -- can't send a duplicate request to the same person
    CHECK (requester_id <> addressee_id)       -- can't send a friend request to yourself
);
```

---

## What's Not Here Yet

Columns and tables to be added in later weeks as features are built:

- `users`: `bio`, `profile_pic`
- `locations`: `score` (dynamic ranking — formula TBD)
- `review_photos` table (photo uploads — Azure Blob Storage)
- Any indexes beyond the spatial one above
