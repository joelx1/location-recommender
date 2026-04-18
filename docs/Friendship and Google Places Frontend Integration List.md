# Friendship and Google Places Frontend Integration List

This document summarizes the remaining frontend-facing MVP work for the friendship and Google Places flows.

The main purpose is to clarify:

- which frontend screens and flows are involved
- which backend APIs already exist
- which backend support or changes are still needed
- how the frontend/backend flow is expected to work
- which database capabilities are already confirmed

---

## 1. Friendship

### Goal

Deliver a workable MVP social relationship system using the existing friendship-based model, but with a simplified frontend flow.

### Current MVP decision

For MVP, we are **not** changing the backend/data model to a true one-way follow system.

We also want to avoid the full request / accept flow if possible, because it adds more frontend states and screens.

The preferred simplified MVP version is:

- user taps `Add Friend`
- the relationship is created immediately
- both users are treated as connected
- both users can see each other's activity

This means:

- the app still behaves like a mutual friendship model
- the feed can continue using mutual connection logic
- profile counts should use `Friends` rather than `Followers / Following`
- this also keeps the current proximity design compatible, since it already depends on mutual accepted-style friendships

### Frontend pages involved

- `Profile`
- `Friend Profile` (new page)
- `Home` search bar for people search
- `Social (Feed)`

### Current backend APIs already available

- `GET /users/{id}`
- `GET /users/{id}/reviews`
- `GET /users/{id}/feed`
- `GET /users/{id}/friends`
- `GET /users/{id}/friendship-status?with={otherUserId}`
- `POST /friends`
- `PATCH /friends/{id}`

### Backend support still needed or needs clarification

Suggested minimum backend changes:

- update `POST /friends`
  - instead of creating a `PENDING` relationship, create an `ACCEPTED` relationship directly
  - this allows the frontend to use a simple flow:
    - tap `Add Friend`
    - immediately become `Friends`

- keep `GET /users/{id}/friends`
  - this can continue to provide the connected users list
  - it can also support the `Friends` count on profile pages

- keep `GET /users/{id}/feed`
  - if friendships are created directly as accepted, the existing feed logic may continue to work without major changes

- keep `GET /users/{id}/friendship-status?with={otherUserId}`
  - frontend mainly needs to distinguish:
    - `NONE`
    - `ACCEPTED`

- add `GET /users/search?q=...`
  - needed for people search from the Home search bar

### Frontend data needed

#### User search result item

- `id`
- `username`
- `profilePic`
- optional `bio`

#### Friend profile screen

- `id`
- `username`
- `bio`
- `profilePic`
- friendship state
- `friends_count`
- user posts list

### Frontend/backend flow

1. User types into the Home search bar.
2. Frontend requests:
   - place search
   - user search
3. Results are shown in grouped sections:
   - `Places`
   - `People`
4. User taps a people result.
5. Frontend opens `Friend Profile`.
6. `Friend Profile` loads:
   - `GET /users/{id}`
   - `GET /users/{id}/reviews`
   - `GET /users/{currentUserId}/friendship-status?with={otherUserId}`
7. If there is no relationship:
   - show `Add Friend`
8. User taps `Add Friend`.
9. Frontend sends:
   - `POST /friends`
10. Backend creates the relationship directly as accepted.
11. Frontend refreshes status and updates button to:

- `Friends`

12. Both users are now included in each other’s visible feed logic.

### Main backend questions to confirm

- Should `POST /friends` create an accepted relationship directly for this simplified version?
- Or should there be a separate simplified connect/friend endpoint?

---

## 2. Google Places -> Database

### Goal

Allow users to find places not already stored in our database, choose them from Google Places, save them into our DB.

### Frontend pages involved

- `Search`
- `Add`
- `Home`
- optional `Place Details`

### Current backend APIs already available

- `GET /locations`
- `GET /locations/search?q=...`
- `POST /locations`
- `GET /locations/{id}`
- `GET /locations/{id}/summary`
- `GET /locations/{id}/reviews`

### Database support already added

Google Places deduplication is now supported at the database level through `V005__locations_google_place_id.sql`.

The `locations` table now includes:

- `google_place_id TEXT UNIQUE`

Backend can use the Google Places unique place ID to check whether a location already exists before inserting a new one.

### Current frontend limitation

- `Search` currently works only with locations already stored in the DB.
- `Add` currently works only with locations already stored in the DB.
- There is no current flow for:
  - searching Google Places
  - selecting a new place
  - saving it to our DB
  - continuing to review or details

### Backend support still needed or needs clarification

- confirm that backend models and DTOs include `google_place_id`
- confirm that `POST /locations` accepts Google-imported place data

### Frontend data needed from Google Places

- `place_name`
- `formatted_address`
- `lat`
- `lng`
- `types`
- optional `place_id`

### Frontend/backend flow

1. User searches in `Search`, `Add`, or `Home` search.
2. Frontend first checks the app database:
   - `GET /locations/search?q=...`
3. If there is no suitable DB result, frontend requests Google Places results.
4. User selects a Google Places result.
5. Frontend prepares a location payload including:
   - `name`
   - `address`
   - `latitude`
   - `longitude`
   - `category`
   - `googlePlaceId`
6. Frontend sends that payload to backend:
   - `POST /locations`
7. Backend checks whether a row already exists with the same `google_place_id`.
8. If the location already exists:
   - backend returns the existing location
9. If the location does not exist:
   - backend creates a new location row
10. Backend returns the final DB location object or location ID.
11. Frontend then continues with one of these flows:

- open `Place Details`
- or use the returned `location_id` to create a review

### Request sequence for `Add`

1. `GET /locations/search?q=...`
2. If no suitable DB result, request Google Places results
3. User selects place
4. `POST /locations`
5. backend returns `location.id`
6. `POST /reviews`

### Suggested request sequence for `Search`

1. `GET /locations/search?q=...`
2. If no suitable DB result, request Google Places results
3. User selects place
4. optional `POST /locations`
5. `GET /locations/{id}/summary`
6. `GET /locations/{id}/reviews`

### Main backend questions to confirm

- Is `google_place_id` already wired through backend DTOs and models?
- What exact create payload should frontend send for a Google-imported location?
- If a location already exists, should backend return existing location data instead of erroring?
