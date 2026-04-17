-- V006__push_notifications.sql
-- Adds push notification support: device token storage and notification log.
-- Decisions confirmed 2026-04-17:
--   Radius: 250m | Cooldown: 1 hour | Min rating: 4+ | Trigger: significant movement (Option A)
--   Cold start: skip preference filter until user has 3+ reviews (Option A)

-- ============================================================
-- Device tokens
-- ============================================================

-- Stores Expo push tokens per user.
-- A user can have multiple devices (phone + tablet etc), so one-to-many on user_id.
-- Token is the Expo push token string (e.g. ExponentPushToken[xxxxxx]).
-- Deleted automatically if the user is deleted.

CREATE TABLE device_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token      TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, token) -- prevents duplicate tokens for the same user/device
);

-- ============================================================
-- Notification log
-- ============================================================

-- Tracks when a user was last notified about a specific location.
-- Used to prevent spamming: backend checks this before sending a notification
-- and skips if one was already sent within the cooldown window (1 hour, confirmed).

CREATE TABLE notification_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id)     ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    notified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index to make the cooldown check fast:
-- "has this user been notified about this location in the last 1 hour?"
CREATE INDEX notification_log_user_location_idx
    ON notification_log (user_id, location_id, notified_at DESC);

-- ============================================================
-- Proximity query (for backend reference — not run here)
-- ============================================================

-- Backend runs this when a user's location is sent up (on significant movement).
-- Returns locations reviewed by accepted friends, within 250m,
-- rated 4+, matching user's taste, not notified about in the last 1 hour.
-- Cold start: if user has fewer than 3 reviews, skip the category preference filter.
-- Backend sends Expo push notifications and inserts rows into notification_log.
--
-- SELECT DISTINCT l.id, l.name, u.username AS reviewed_by
-- FROM locations l
-- JOIN reviews r ON r.location_id = l.id
-- JOIN friendships f ON (
--     (f.requester_id = $user_id AND f.addressee_id = r.user_id)
--     OR
--     (f.addressee_id = $user_id AND f.requester_id = r.user_id)
-- )
-- AND f.status = 'accepted'
-- JOIN users u ON u.id = r.user_id
-- WHERE ST_DWithin(l.geo, ST_MakePoint($lng, $lat)::geography, 250)
-- AND r.rating >= 4
-- AND (
--     -- Cold start: skip preference filter if user has fewer than 3 reviews
--     (SELECT COUNT(*) FROM reviews WHERE user_id = $user_id) < 3
--     OR
--     l.category IN (
--         SELECT l2.category FROM reviews r2
--         JOIN locations l2 ON l2.id = r2.location_id
--         WHERE r2.user_id = $user_id AND r2.rating >= 4
--     )
-- )
-- AND NOT EXISTS (
--     SELECT 1 FROM notification_log nl
--     WHERE nl.user_id     = $user_id
--     AND   nl.location_id = l.id
--     AND   nl.notified_at > NOW() - INTERVAL '1 hour'
-- );
