---
title: Push Notifications — Research & Decisions
project: Microsoft Project (CS335)
updated: 2026-04-09
status: awaiting team decisions
---

# Push Notifications — Research & Decisions

> **What this doc is:** A breakdown of how proximity-based push notifications could work, the decisions the team needs to make before we build it, and what each side (DB / backend / frontend) would need to do.
>
> **Action needed:** Read through the open decisions section and leave a comment or reply with your preference so we can agree on an approach.

---

## What the feature does

When a user is near a location that a friend has reviewed, they get a push notification — but only if:

1. The friend rated it **4 or 5 stars** (no point recommending somewhere bad)
2. The location category matches somewhere the **user themselves** has rated highly before (no point recommending sushi to someone who only reviews burger places)
3. The user hasn't already been notified about that location recently (no spam)

---

## How it works — overview

```
User moves around
       ↓
App sends current coordinates to backend
       ↓
Backend queries: any friend-reviewed locations nearby that match this user's taste?
       ↓
If yes → call Expo Push API → notification appears on phone
       ↓
Log it so we don't send it again for a while
```

Since we're using **Expo (React Native)**, push notifications go through the **Expo Push API** — one unified service that handles iOS (APNs) and Android (FCM) automatically. No separate Apple/Google setup needed for the demo.

Flow:
1. App launches → registers with Expo → gets a push token (e.g. `ExponentPushToken[xxxxxx]`)
2. App sends token to backend → stored in DB
3. When proximity check fires, backend POSTs to Expo Push API with the token and message
4. Notification appears on device

---

## What triggers the proximity check?

Three options — need to pick one:

| Option | How it works | Pros | Cons |
|---|---|---|---|
| **A — Frontend sends location up** | App sends coordinates to backend every N seconds/on movement | Simple backend, no extra setup | Battery drain; stops if app is fully closed |
| **B — Geofencing** | Frontend registers friends' reviewed locations as OS-level regions; OS wakes app when user enters one | Very battery efficient; works in background | Frontend must fetch all friends' reviewed locations and register them as geofences on login — more upfront work |
| **C — Backend polling** | Scheduled job on backend periodically checks all users | Works when app is closed | Needs last-known location stored in DB; high complexity; doesn't scale well |

> **Recommendation:** Option A for the demo. Expo's `expo-location` has a "significant movement" mode that only fires when the user has actually moved — reduces battery impact and keeps backend calls low. Option B is the cleanest long-term solution if we want to revisit after the demo.

---

## Preference matching — how we know what someone likes

No extra table needed. We derive it from the user's own review history — if they've rated pizza places and burger joints 4+, they probably don't want a notification for sushi.

The backend query checks: *"is this location's category one the user has previously rated 4+ stars?"*

If the user is new and has no reviews yet, there's a **cold start problem** — see open decisions below.

---

## Database changes needed (V003 — written, not pushed yet)

Two new tables:

**`device_tokens`** — stores the user's Expo push token so we know where to send notifications
- One user can have multiple devices (phone + tablet) — each gets its own row
- Deleted automatically if the user account is deleted

**`notification_log`** — prevents spamming
- Records when a user was notified about a specific location
- Backend checks this before sending and skips if a notification was already sent within the cooldown window
- Does **not** store where the user was — just that the notification happened

> Migration file is ready at `database/migrations/V003__push_notifications.sql` — waiting for team to confirm the open decisions before it gets pushed.

---

## The backend query (for reference)

This runs when a user's location is received:

```sql
SELECT DISTINCT l.id, l.name, u.username AS reviewed_by
FROM locations l
JOIN reviews r       ON r.location_id = l.id
JOIN friendships f   ON (
    (f.requester_id = $user_id AND f.addressee_id = r.user_id)
    OR
    (f.addressee_id = $user_id AND f.requester_id = r.user_id)
)
AND f.status = 'accepted'
JOIN users u ON u.id = r.user_id
WHERE
    -- Within range
    ST_DWithin(l.geo, ST_MakePoint($lng, $lat)::geography, $radius_metres)
    -- Friend rated it highly
    AND r.rating >= 4
    -- Matches user's own taste (categories they've rated 4+ themselves)
    AND l.category IN (
        SELECT l2.category
        FROM reviews r2
        JOIN locations l2 ON l2.id = r2.location_id
        WHERE r2.user_id = $user_id
        AND r2.rating >= 4
    )
    -- Not already notified recently
    AND NOT EXISTS (
        SELECT 1 FROM notification_log nl
        WHERE nl.user_id     = $user_id
        AND   nl.location_id = l.id
        AND   nl.notified_at > NOW() - INTERVAL '24 hours'
    );
```

After sending, backend inserts a row into `notification_log` for each location notified about.

---

## Open decisions — need team input

Please comment with your preference on each one.

---

### 1. Notification radius
How close does the user need to be to trigger a notification?

- [ ] **100m** — very close, fewer false positives, might miss places just around the corner
- [ ] **250m** — roughly a 3-minute walk, probably the sweet spot
- [ ] **500m** — wider net, more notifications, could feel noisy

---

### 2. Cooldown window
How long before we can notify the same user about the same location again?

- [ ] **1 hour** — good for real-world use
- [ ] **2 hours**
- [ ] **24 hours** — very conservative, good for demo reliability

---

### 3. Minimum rating to trigger
What star rating on a friend's review counts as a recommendation?

- [ ] **3+** — includes average reviews
- [ ] **4+** — only genuinely good places (recommended)
- [ ] **5 only** — only the best

---

### 4. Cold start — new users with no review history
New users have no past reviews, so the preference filter returns nothing and they'd never get a notification.

- [ ] **Option A:** Skip the preference filter until the user has written at least 3 reviews (simplest)
- [ ] **Option B:** Add a category preference screen during onboarding — user picks what they like on first launch (needs a new frontend screen)
- [ ] **Option C:** No preference filter at all until they have history — early notifications won't be personalised but at least they fire

---

### 5. Who triggers the proximity check (see table above)
- [ ] **Option A — Frontend sends location up** (recommended for demo)
- [ ] **Option B — Geofencing**
- [ ] **Option C — Backend polling**

---

### 6. How often does the app send location up? (if Option A chosen)
- [ ] Every **30 seconds**
- [ ] Every **60 seconds**
- [ ] On **significant movement only** (Expo handles this automatically — recommended, saves battery)

---

## What each side needs to build

### Database
- [ ] Push V003 migration once decisions are confirmed (device_tokens + notification_log tables)

### Backend
- [ ] New endpoint: `POST /users/{id}/device-token` — receives and stores Expo push token
- [ ] Proximity check logic — runs the query above when location is received
- [ ] Call Expo Push API to send notifications (plain HTTP POST, no SDK required)
- [ ] Handle `DeviceNotRegistered` errors — delete stale tokens from `device_tokens`
- [ ] Write to `notification_log` after each send

### Frontend
- [ ] Register for push notifications on app launch and send token to backend
- [ ] Send current location to backend (approach depends on decision #5)
- [ ] Declare background location permissions in `app.json`
- [ ] If Option B (geofencing): fetch friends' reviewed locations on login and register as geofences

---

## Dependencies on other pending work

| Dependency | Why |
|---|---|
| `azure_oid` column on `users` (DB task #1) | Backend needs this to identify who is sending their location — otherwise can't run the query |
| Location score column (DB task #2) | Optional future improvement: filter on average location score instead of individual friend rating |

---

## Things to be careful about

- **Privacy** — only send coordinates to the backend, never store the user's location history in the DB
- **Token hygiene** — Expo tokens can become invalid; backend must handle this gracefully and clean up stale tokens
- **Rate limits** — Expo Push API allows up to 100 notifications per batch request; batch sends if multiple friends reviewed the same nearby location
- **Don't skip the cooldown log** — without it, every location update floods the user with repeat notifications
