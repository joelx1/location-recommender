# LocationReviewApp — Backend

A location review and recommendation platform where users can discover, add, and review places. Users can register, add locations (pubs, restaurants, cafes etc.), write reviews, connect with friends, and receive proximity-based push notifications when they're near somewhere a friend has reviewed.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Java 17 | Programming language |
| Spring Boot 3.2.5 | Backend framework |
| Spring Data JPA + Hibernate Spatial | Database access layer with spatial support |
| Spring Security + OAuth2 Resource Server | JWT authentication via Azure Entra External ID |
| PostgreSQL + PostGIS | Relational database with geographic extension for coordinate storage and querying |
| jackson-datatype-jts (v1.2.10) | Serialises PostGIS Point objects as GeoJSON |
| Azure Blob Storage | Image storage for profile pictures and review photos |

> **Note on Spring Boot version:** Downgraded from 4.0.3 to 3.2.5 — hibernate-spatial was not available on Maven Central for Hibernate 7, which Spring Boot 4 bundles. 3.2.5 is a stable, widely supported release that resolves all dependencies cleanly.

---

## Project Structure

```
src/main/java/com/example/LocationReviewApp/
├── model/          → Entity classes (User, Location, Review, Friendship, FriendshipStatus, DeviceToken, NotificationLog)
├── repository/     → Database query interfaces
├── controller/     → REST API endpoints
├── dto/            → Data Transfer Objects (LocationRequest, LocationSummary, LocationUpdateRequest, FriendRequest, FeedItem, UserSummary)
├── config/         → Security, GeoJSON serialisation, Azure Blob configuration
├── service/        → Business logic (AzureBlobService, NotificationService)
└── Application.java → App entry point
```

---

## Authentication

All endpoints require a valid JWT Bearer token issued by Azure Entra External ID unless stated otherwise. Requests without a valid token return `401 Unauthorized`.

After every login the frontend calls `POST /auth/me`. The backend reads the `sub` claim (Azure Object ID) from the token and either returns the existing user record or creates a new one on first login. The caller's identity is always derived from their token — it cannot be overridden by request body values.

Add the following to `application.properties`:

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://locationreviewapp.ciamlogin.com/<TENANT_ID>/v2.0
azure.entra.client-id=<BACKEND_CLIENT_ID>
```

---

## Data Models

### User

| Field | Type | Notes |
|---|---|---|
| id | UUID | Auto-generated primary key |
| username | String | Unique, required |
| email | String | Unique, required |
| azureOid | String | Azure Object ID from JWT `sub` claim — never returned in API responses |
| bio | String | Optional, max 500 characters |
| profilePic | String | Optional — permanent Azure Blob Storage URL |
| createdAt | Instant | Set automatically on creation |

### Location

| Field | Type | Notes |
|---|---|---|
| id | UUID | Auto-generated primary key |
| name | String | Required |
| category | String | e.g. `bar`, `restaurant`, `cafe` — required |
| address | String | Optional |
| coordinates | Point | PostGIS `geography(Point, 4326)`. Callers send plain `latitude`/`longitude`; stored and returned as GeoJSON. Mapped to column `geo` in the database |
| googlePlacesId | String | Optional — populated when imported from Google Places. Unique constraint prevents duplicate locations. Mapped to column `google_place_id` in the database |
| createdBy | User (FK) | Set automatically from the JWT — callers cannot set this |
| createdAt | Instant | Set automatically on creation |

### Review

| Field | Type | Notes |
|---|---|---|
| id | UUID | Auto-generated primary key |
| user | User (FK) | Set automatically from the JWT — callers cannot set this |
| location | Location (FK) | The location being reviewed — required |
| rating | int | Required (range: 1–5) |
| body | String | Optional written review |
| photoUrl | String | Optional — permanent Azure Blob Storage URL |
| createdAt | Instant | Set automatically on creation |

> Only one review per user per location is allowed — enforced by a unique constraint on `(user_id, location_id)`.

### Friendship

Friendships are mutual and immediate — adding a friend creates an `ACCEPTED` connection straight away. There is no pending/request flow.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Auto-generated primary key |
| requester | User (FK) | The user who initiated the connection |
| receiver | User (FK) | The user who was added. Mapped to column `addressee_id` in the database |
| status | FriendshipStatus | Always `ACCEPTED` |
| createdAt | Instant | Set automatically on creation |

### DeviceToken

Stores Expo push tokens so the backend knows where to send notifications. A user can have multiple tokens — one per device.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Auto-generated primary key |
| user | User (FK) | The user this token belongs to |
| token | String | Expo push token e.g. `ExponentPushToken[xxxxxx]`. Unique per user/device combination |
| createdAt | Instant | Set automatically on creation |

### NotificationLog

Records when a user was notified about a specific location. Used to enforce the 1-hour cooldown. User coordinates are never stored.

| Field | Type | Notes |
|---|---|---|
| id | UUID | Auto-generated primary key |
| user | User (FK) | The user who received the notification |
| location | Location (FK) | The location the notification was about |
| notifiedAt | Instant | Set automatically on creation |

---

## API Endpoints

All endpoints require a valid Bearer token unless stated otherwise.

### Auth

| Method | URL | Description |
|---|---|---|
| POST | /auth/me | Get or create the authenticated user from their JWT |

### Users

| Method | URL | Description |
|---|---|---|
| GET | /users | Get all users |
| GET | /users/search?q= | Search users by username (case-insensitive, excludes self, max 20 results) |
| GET | /users/{id} | Get user by ID |
| PATCH | /users/{id} | Update username, email, or bio (owner only) |
| DELETE | /users/{id} | Delete a user (owner only) |
| GET | /users/{id}/reviews | Get all reviews written by a user |
| GET | /users/{id}/friends | Get all accepted friends for a user |
| GET | /users/{id}/feed | Get reviews posted by a user's friends, newest first (flat FeedItem shape — see below) |
| GET | /users/{id}/friendship-status?with= | Get friendship status between two users |
| POST | /users/{id}/profile-picture | Upload a profile picture (owner only) |
| POST | /users/{id}/device-token | Register an Expo push token for a user (owner only) |

### Locations

| Method | URL | Description |
|---|---|---|
| GET | /locations | Get all locations |
| GET | /locations/search?q= | Search locations by name or category (case-insensitive, ranked by Bayesian score) |
| GET | /locations/{id} | Get location by ID (coordinates as GeoJSON — use for map display) |
| GET | /locations/{id}/summary | Get location with review stats and flat lat/lng (use for detail screens) |
| GET | /locations/{id}/social-summary?userId= | Get count of a user's accepted friends who have reviewed this location |
| GET | /locations/{id}/reviews | Get all reviews for a location |
| GET | /locations/nearby?lat=&lng=&km= | Get locations within a given radius (default 5km), unordered |
| GET | /locations/nearby/ranked?lat=&lng=&km= | Get locations within radius ranked by Bayesian score |
| POST | /locations | Create a new location (`createdBy` set from JWT; Google Places deduplication via `googlePlacesId`) |
| DELETE | /locations/{id} | Delete a location (creator only) |

### Reviews

| Method | URL | Description |
|---|---|---|
| GET | /reviews | Get all reviews |
| GET | /reviews/{id} | Get review by ID |
| POST | /reviews | Create a new review (author set from JWT) |
| DELETE | /reviews/{id} | Delete a review (author only) |
| POST | /reviews/{id}/photo | Upload a photo for a review (author only) |

### Friends

| Method | URL | Description |
|---|---|---|
| POST | /friends | Add a friend — creates an ACCEPTED friendship immediately. Requester derived from JWT |

### Notifications

| Method | URL | Description |
|---|---|---|
| POST | /notifications/check | Receive user coordinates, run proximity check, send push notifications if applicable |

### Images

| Method | URL | Description |
|---|---|---|
| POST | /api/images/upload | Upload an image to Azure Blob Storage |
| DELETE | /api/images/{blobName} | Delete an image by blob name |

---

## Response Shapes

### LocationSummary

Returned by `/locations/{id}/summary`, `/locations/nearby/ranked`, and `/locations/search`.

| Field | Type | Description |
|---|---|---|
| id | UUID | Location ID |
| name | String | Location name |
| category | String | e.g. `bar`, `restaurant` |
| address | String | Address |
| latitude | Double | Latitude extracted from PostGIS point |
| longitude | Double | Longitude extracted from PostGIS point |
| reviewCount | Integer | Total number of reviews |
| averageRating | Double | Plain average of all ratings (0 if no reviews) |
| bayesianScore | Double | Bayesian-adjusted score used for ranking |

Use `GET /locations/{id}` instead of `/summary` when you need GeoJSON coordinates (e.g. for map rendering).

### FeedItem

Returned by `GET /users/{id}/feed`. A flat structure rather than nested Review entities.

| Field | Type |
|---|---|
| id | UUID |
| userId | UUID |
| username | String |
| profilePic | String |
| locationId | UUID |
| locationName | String |
| locationCategory | String |
| locationAddress | String |
| rating | int |
| body | String |
| photoUrl | String |
| createdAt | Instant |

### Friendship Status

Returned by `GET /users/{id}/friendship-status?with={otherUserId}`.

| Response | Meaning |
|---|---|
| `{ "status": "NONE" }` | No friendship record exists |
| `{ "status": "ACCEPTED" }` | Both users are friends |

---

## Push Notifications

Proximity-based push notifications are sent when a user moves near a location that a friend has reviewed highly.

**Parameters:**

| Setting | Value |
|---|---|
| Trigger radius | 250 metres |
| Cooldown | 1 hour per user per location |
| Minimum friend rating to trigger | 4 stars or above |
| Cold start | Preference filter skipped until user has 3 or more of their own reviews |

**Flow:**

1. App launches → registers Expo push token via `POST /users/{id}/device-token`
2. User moves significantly → app sends coordinates to `POST /notifications/check`
3. Backend queries for nearby locations reviewed by friends at 4+ stars, matching the user's taste profile, not notified about in the last hour
4. Backend calls the Expo Push API for each qualifying location
5. Stale tokens are cleaned up automatically when Expo returns `DeviceNotRegistered`
6. Each notification is logged in `notification_log` to enforce the cooldown

Coordinates sent to `POST /notifications/check` are never stored.

---

## Google Places Deduplication

When the frontend imports a location from Google Places it sends a `googlePlacesId` in the `POST /locations` body. The backend checks for an existing record before inserting:

- **Found** — returns the existing location with `200 OK`
- **Not found** — creates a new location and returns `201 Created`

Locations added manually inside the app have no `googlePlacesId` and skip this check entirely.

---

## Location Ranking — Bayesian Scoring

Used by `/locations/nearby/ranked` and `/locations/search` to rank results. Prevents a location with a single 5★ review from outranking one with hundreds of strong reviews.

**Formula:**

```
bayesianScore = (C × globalMean + sumOfRatings) / (C + reviewCount)
```

| Variable | Value | Meaning |
|---|---|---|
| C | 5 | Confidence weight — how many reviews a location needs before its score is fully trusted |
| globalMean | Computed at query time | Average rating across every review in the database |
| sumOfRatings | Computed at query time | Sum of all ratings for this location |
| reviewCount | Computed at query time | Number of reviews for this location |

Every location starts anchored toward the global average. As it accumulates more reviews, the anchor weakens and the score reflects actual ratings more closely. A location with zero reviews scores exactly at the global average — sitting mid-pack rather than top or bottom.

`C = 5` is a tuning parameter and can be adjusted in `LocationRepository.java`.

---

## Error Responses

Error responses include a `message` field describing the problem (requires `server.error.include-message=always` in `application.properties`).

| Status | Meaning | Example |
|---|---|---|
| 200 OK | Request succeeded | — |
| 201 Created | Resource created | New device token registered |
| 400 Bad Request | Invalid input | Blank token, non-image file, adding yourself as a friend |
| 401 Unauthorized | No token or invalid token | Missing Bearer token |
| 403 Forbidden | Caller not permitted | Deleting another user's review |
| 404 Not Found | Resource does not exist | User/location/review not found |
| 409 Conflict | Conflicts with existing data | Duplicate friend, duplicate review |
| 500 Internal Server Error | Unexpected server error | — |

---

## Configuration

The app is configured via `src/main/resources/application.properties`. This file is **not committed to the repository** — copy `application.properties.example` and fill in your values.

```properties
# Azure PostgreSQL
spring.datasource.url=
spring.datasource.username=
spring.datasource.password=
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.idle-timeout=30000

# Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Error messages
server.error.include-message=always

# Azure Blob Storage
azure.storage.connection-string=
azure.storage.container-name=

# Azure Entra External ID
spring.security.oauth2.resourceserver.jwt.issuer-uri=
azure.entra.client-id=
```

> **ddl-auto warning:** Do not use `create` or `create-drop` against the shared Azure database — this will wipe existing data. `update` is safe for development.

> **Public blob access:** The storage container must have anonymous read access enabled for blobs (not the container). Uploaded images are stored as permanent plain URLs in the format `https://<account>.blob.core.windows.net/<container>/<blob>` — no expiry, no tokens. The container is created automatically on startup if it does not exist.

> **CORS:** Currently set to allow all origins (`*`) for development. Restrict before production.

---

## Known Database Notes

Some column names in the shared Azure PostgreSQL schema differ from Java entity field names. These are mapped explicitly using `@Column(name=...)` and `@JoinColumn(name=...)`.

| Table | Database column | Java field |
|---|---|---|
| locations | geo | coordinates |
| locations | google_place_id | googlePlacesId |
| friendships | addressee_id | receiver |

### Dropped constraints

The `friendships_status_check` constraint was dropped from the database. It originally only allowed lowercase values (`pending`, `accepted`) but the Java enum stores uppercase (`PENDING`, `ACCEPTED`). The constraint was removed rather than altered since the enum enforces valid values at the application level. If the schema is ever recreated from scratch, do not add this constraint back unless you also change the enum to store lowercase.

### Native query casting

PostgreSQL's `::` cast shorthand cannot be used in Spring Data native queries — Spring Data's parameter binding parser treats `:geometry` as a named parameter and strips one of the colons, producing invalid SQL. Always use `CAST(x AS type)` instead:

```sql
-- Do not use:
ST_Y(l.geo::geometry)

-- Use instead:
ST_Y(CAST(l.geo AS geometry))
```

---

## How to Run

### Prerequisites

- Java 17+
- Access to the shared Azure PostgreSQL database
- Access to Azure Blob Storage

### Setup

1. Clone the repository
2. Copy `application.properties.example` to `src/main/resources/application.properties` and fill in credentials
3. Run:
   ```bash
   ./mvnw spring-boot:run          # macOS / Linux
   .\mvnw.cmd spring-boot:run      # Windows
   ```
4. Backend starts on `http://localhost:8080`

No local database is needed — the app connects directly to the shared Azure PostgreSQL instance.

### Running Tests

```bash
./mvnw test          # macOS / Linux
.\mvnw.cmd test      # Windows
```

5 tests, all expected to pass. Tests use H2 in-memory database and mocked Azure connections — no real credentials needed.

---

## Example Requests

### First login / get current user
```
POST /auth/me
Authorization: Bearer <token>
```
Creates a new user on first login, returns the existing user on subsequent logins.

### Search for users
```
GET /users/search?q=jack
```
Returns up to 20 matching users as slim objects (id, username, profilePic, bio). Excludes the calling user. Returns an empty array for blank queries.

### Update a user's profile
```json
PATCH /users/{id}
Authorization: Bearer <token>

{
  "bio": "Big fan of Dublin pubs"
}
```
Include only the fields you want to change — omitted fields are left unchanged.

### Register a push token
```json
POST /users/{id}/device-token
Authorization: Bearer <token>

{ "token": "ExponentPushToken[xxxxxx]" }
```
Returns `201 Created` if the token is new, `200 OK` if already registered.

### Create a location
```json
POST /locations
Authorization: Bearer <token>

{
  "name": "Temple Bar Pub",
  "category": "bar",
  "address": "Temple Bar, Dublin",
  "latitude": 53.3456,
  "longitude": -6.2619,
  "googlePlacesId": "ChIJxxxxxxxx"
}
```
`googlePlacesId` is optional — omit it for manually added locations. `createdBy` is set from the JWT.

### Create a review
```json
POST /reviews
Authorization: Bearer <token>

{
  "location": { "id": "your-location-uuid" },
  "rating": 5,
  "body": "Amazing atmosphere!"
}
```
Author is set from the JWT — do not include a `user` field.

### Upload a review photo
```
POST /reviews/{id}/photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image file>
```
Returns:
```json
{ "url": "https://<account>.blob.core.windows.net/<container>/<blob>" }
```

### Add a friend
```json
POST /friends
Authorization: Bearer <token>

{ "receiverId": "other-user-uuid" }
```
Creates an ACCEPTED friendship immediately. Requester is derived from the JWT.

### Get a user's feed
```
GET /users/{id}/feed
Authorization: Bearer <token>
```
Returns all reviews posted by the user's accepted friends, ordered newest first, as a flat FeedItem list.

### Get nearby locations ranked by score
```
GET /locations/nearby/ranked?lat=53.3456&lng=-6.2619&km=5
Authorization: Bearer <token>
```

| Parameter | Type | Description |
|---|---|---|
| lat | double | Latitude of the search origin |
| lng | double | Longitude of the search origin |
| km | double | Search radius in kilometres (default: 5) |

### Trigger a proximity notification check
```json
POST /notifications/check
Authorization: Bearer <token>

{
  "latitude": 53.3456,
  "longitude": -6.2619
}
```
Called by the frontend on significant movement. Coordinates are never stored. Returns `200 OK` regardless of whether any notifications were sent.

---

## What's Next

| Feature | Notes |
|---|---|
| End-to-end testing | Pending Azure user flow setup for token generation |
| Azure App Service deployment | Backend ready — Azure setup owned by DB/auth team |
| Location cover images | Blob storage infrastructure already in place |
| Input validation | Add `@Valid` annotations and proper 400 responses for malformed requests (e.g. missing required fields, rating out of 1–5 range) |
