-- PostGIS verification queries
-- Run these to confirm PostGIS is working correctly after setup.
-- Uses a test user and two test locations — all cleaned up at the end.

-- ============================================================
-- Setup: insert test data
-- ============================================================

INSERT INTO users (id, username, email)
VALUES ('00000000-0000-0000-0000-000000000001', 'test_user', 'test@example.com');

-- Maynooth University (~53.3813, -6.5930)
INSERT INTO locations (id, name, category, address, geo, created_by)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Maynooth University',
    'landmark',
    'Maynooth, Co. Kildare',
    ST_MakePoint(-6.5930, 53.3813)::geography,
    '00000000-0000-0000-0000-000000000001'
);

-- Kildare Arms (~53.3808, -6.5951) — roughly 150 m from the university
INSERT INTO locations (id, name, category, address, geo, created_by)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    'Kildare Arms',
    'bar',
    'Main Street, Maynooth, Co. Kildare',
    ST_MakePoint(-6.5951, 53.3808)::geography,
    '00000000-0000-0000-0000-000000000001'
);

-- ============================================================
-- Test 1: ST_Distance — distance in metres between two locations
-- Expected: roughly 600–700 metres
-- ============================================================

SELECT
    a.name AS from_location,
    b.name AS to_location,
    ROUND(ST_Distance(a.geo, b.geo)::numeric, 1) AS distance_metres
FROM locations a, locations b
WHERE a.id = '00000000-0000-0000-0000-000000000002'
  AND b.id = '00000000-0000-0000-0000-000000000003';

-- ============================================================
-- Test 2: ST_DWithin — find locations within 1 km of Maynooth University
-- Expected: both test locations returned
-- ============================================================

SELECT name, category
FROM locations
WHERE ST_DWithin(
    geo,
    ST_MakePoint(-6.5930, 53.3813)::geography,
    1000  -- radius in metres
);

-- ============================================================
-- Test 3: Order by distance — nearest first
-- Expected: Maynooth University first (0 m), then Kildare Arms (~150 m)
-- ============================================================

SELECT
    name,
    ROUND(ST_Distance(geo, ST_MakePoint(-6.5930, 53.3813)::geography)::numeric, 1) AS distance_metres
FROM locations
ORDER BY geo <-> ST_MakePoint(-6.5930, 53.3813)::geography;

-- ============================================================
-- Cleanup: remove test data
-- ============================================================

DELETE FROM locations WHERE id IN (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003'
);
DELETE FROM users WHERE id = '00000000-0000-0000-0000-000000000001';
