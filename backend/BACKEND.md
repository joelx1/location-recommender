# LocationReviewApp — Backend

## What This Is
This is the Spring Boot backend for the location review and recommendation app (Name Pending) — a location review platform where users can discover, add, and review places.

Users can register, add locations (pubs, restaurants, cafes etc.), write reviews, and follow friends to see a personalised feed of their reviews.

---

## Tech Stack
| Technology | Purpose |
|-----------|---------|
| Java 17 | Programming language |
| Spring Boot 3.2.5 | Backend framework |
| Spring Data JPA + Hibernate Spatial | Database access layer with spatial support |
| Spring Security | Authentication (Azure Entra ID to be configured) |
| PostgreSQL | Relational database |
| PostGIS | Geographic extension for PostgreSQL — stores and queries coordinates |
| jackson-datatype-jts (v1.2.10) | Serialises PostGIS Point objects as GeoJSON |
| Azure Blob Storage | Image storage for profile pictures, review photos, and standalone uploads |

> **Note on Spring Boot version:** Downgraded from 4.0.3 to 3.2.5 — hibernate-spatial was not available on Maven Central for Hibernate 7, which Spring Boot 4 bundles. 3.2.5 is a stable, widely supported release and resolves all dependencies cleanly.

---

## Project Structure
```
src/main/java/com/example/LocationReviewApp/
├── model/          → Database entity classes (User, Location, Review, Friendship, FriendshipStatus)
├── repository/     → Database query interfaces
├── controller/     → REST API endpoints
├── dto/            → Data Transfer Objects (LocationRequest, FriendRequest, LocationSummary)
├── config/         → Security + GeoJSON serialization + Azure Blob configuration
└── Application.java → App entry point
```

---

## Data Models

### User
Represents a registered user of the app.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Auto-generated primary key |
| username | String | Unique, required |
| email | String | Unique, required |
| bio | String | Optional, max 500 characters |
| profilePic | String | Optional, stores a permanent Azure Blob Storage URL |
| createdAt | Instant | Set automatically on creation |

### Location
Represents a place that can be reviewed (pub, restaurant, cafe etc.).

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Auto-generated primary key |
| name | String | Required |
| category | String | e.g. "bar", "restaurant", "cafe" — required |
| address | String | Optional |
| coordinates | Point | PostGIS geography(Point, 4326) — stored as GeoJSON, accepts lat/lng via LocationRequest DTO. Mapped to column `geo` in the database. |
| createdBy | User (FK) | Optional reference to the user who added this location |
| createdAt | Instant | Set automatically on creation |

### Review
Represents a user's review of a location.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Auto-generated primary key |
| user | User (FK) | The user who wrote the review — required |
| location | Location (FK) | The location being reviewed — required |
| rating | int | Required (intended range: 1–5) |
| body | String | Optional written review |
| photoUrl | String | Optional — stores a permanent Azure Blob Storage URL if a photo was uploaded |
| createdAt | Instant | Set automatically on creation |

> **Note:** Only one review per user per location is allowed — enforced by a unique constraint on `(user_id, location_id)` in the database.

### Friendship
Represents a friendship between two users. Friendships are directional at the request stage (one user sends, one receives) but are treated as bidirectional once accepted.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Auto-generated primary key |
| requester | User (FK) | The user who sent the friend request |
| receiver | User (FK) | The user who received the friend request. Mapped to column `addressee_id` in the database. |
| status | FriendshipStatus | `PENDING` or `ACCEPTED` — defaults to `PENDING` |
| createdAt | Instant | Set automatically on creation |

---

## API Endpoints

### Users
| Method | URL | Description |
|--------|-----|-------------|
| GET | /users | Get all users |
| GET | /users/{id} | Get user by ID |
| POST | /users | Create a new user |
| DELETE | /users/{id} | Delete a user |
| GET | /users/{id}/reviews | Get all reviews written by a user |
| GET | /users/{id}/friends | Get all accepted friends for a user |
| GET | /users/{id}/feed | Get reviews posted by a user's friends (newest first) |
| POST | /users/{id}/profile-picture | Upload a profile picture for a user |

### Locations
| Method | URL | Description |
|--------|-----|-------------|
| GET | /locations | Get all locations |
| GET | /locations/{id} | Get location by ID |
| POST | /locations | Create a new location |
| DELETE | /locations/{id} | Delete a location |
| GET | /locations/{id}/reviews | Get all reviews for a location |
| GET | /locations/nearby?lat=&lng=&km= | Get locations within a given radius |
| GET | /locations/nearby/ranked?lat=&lng=&km= | Get locations within a given radius, ranked by Bayesian score |

### Reviews
| Method | URL | Description |
|--------|-----|-------------|
| GET | /reviews | Get all reviews |
| GET | /reviews/{id} | Get review by ID |
| POST | /reviews | Create a new review |
| DELETE | /reviews/{id} | Delete a review |
| POST | /reviews/{id}/photo | Upload a photo for a review |

### Friends
| Method | URL | Description |
|--------|-----|-------------|
| POST | /friends | Send a friend request |
| PATCH | /friends/{id}?receiverId= | Accept a friend request |

### Images
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/images/upload | Upload an image to Azure Blob Storage |
| DELETE | /api/images/{blobName} | Delete an image by blob name |

---

## Error Responses

The API returns standard HTTP status codes. Error responses include a `message` field describing the problem (requires `server.error.include-message=always` in `application.properties`).

| Status | Meaning | Example |
|--------|---------|---------|
| 200 OK | Request succeeded | — |
| 400 Bad Request | Invalid input | No file provided, or file is not an image |
| 404 Not Found | The requested resource does not exist | User/location/review not found |
| 403 Forbidden | The caller is not permitted to perform this action | Trying to accept a friend request you didn't receive |
| 409 Conflict | The request conflicts with existing data | Sending a duplicate friend request, or reviewing the same location twice |
| 500 Internal Server Error | Unexpected server error | — |

---

## Configuration

The app is configured via `src/main/resources/application.properties`. This file is **not committed to the repository** — copy `application.properties.example` and fill in your own values.

### Key properties

```properties
# Azure PostgreSQL connection
spring.datasource.url=your_azure_postgres_jdbc_url
spring.datasource.username=your_username
spring.datasource.password=your_password

# Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Show full error messages in API responses
server.error.include-message=always
```

> **ddl-auto warning:** `update` is safe for development — Hibernate will create or alter tables automatically. Do **not** use `create` or `create-drop` against the shared Azure database as this will wipe existing data.

### Azure Blob Storage

Image uploads require Azure Blob Storage. Add the following to your `application.properties`:

```properties
# Azure Blob Storage
azure.storage.connection-string=your_connection_string
azure.storage.container-name=your_container_name
```

> **Public blob access:** The storage container must have anonymous read access enabled for blobs (not the container). Uploaded images are stored as permanent plain URLs in the format `https://<account>.blob.core.windows.net/<container>/<blob>` — no expiry, no tokens. The container is created automatically on startup if it does not already exist.

### CORS

CORS is configured in `SecurityConfig.java` to accept requests from any origin. This is required for the React Native frontend running on Expo Go on a physical device — Expo Go cannot use `localhost`, so the frontend connects to the backend via the machine's local IP address over shared Wi-Fi.

> **TODO:** Restrict allowed origins before production. The current `setAllowedOriginPatterns("*")` setting is development-only.

---

## Known Database Notes

The shared Azure PostgreSQL schema uses some column names that differ from the Java entity field names. These are mapped explicitly in the entity classes using `@Column(name=...)` and `@JoinColumn(name=...)` — no code changes are needed, but it is useful to be aware of these if you inspect the database directly.

| Table | Database column | Java field |
|-------|----------------|------------|
| locations | geo | coordinates |
| friendships | addressee_id | receiver |

### Dropped constraints

The `friendships_status_check` constraint was dropped from the database. It originally only allowed lowercase values (`pending`, `accepted`, `blocked`) but the Java enum stores uppercase (`PENDING`, `ACCEPTED`). The constraint was removed rather than altered since the enum enforces valid values at the application level. If the schema is ever recreated from scratch, do not add this constraint back unless you also change the enum to store lowercase.

### Native query casting

PostgreSQL's `::` shorthand cast syntax (e.g. `l.geo::geometry`) cannot be used in Spring Data native queries. Spring Data's parameter binding parser treats `:geometry` as a named parameter and strips one of the colons, producing invalid SQL. Always use the standard `CAST(x AS type)` syntax instead:

```sql
-- Do not use:
ST_Y(l.geo::geometry)

-- Use instead:
ST_Y(CAST(l.geo AS geometry))
```

---

## Location Ranking — Bayesian Scoring

The `GET /locations/nearby/ranked` endpoint sorts locations by a Bayesian average score rather than a plain average rating. This prevents a location with a single 5★ review from outranking one with hundreds of strong reviews.

**Formula:**
```
bayesianScore = (C × globalMean + sumOfRatings) / (C + reviewCount)
```

| Variable | Value | Meaning |
|----------|-------|---------|
| C | 5 | Confidence weight — how many reviews a location needs before its score is fully trusted |
| globalMean | computed at query time | Average rating across every review in the database |
| sumOfRatings | computed at query time | Sum of all ratings for this location |
| reviewCount | computed at query time | Number of reviews for this location |

**In plain terms:** Every location starts anchored toward the global average. As it accumulates more reviews, the anchor weakens and its score reflects its actual ratings more closely. A location with zero reviews scores exactly at the global average — sitting mid-pack rather than top or bottom.

The value of `C = 5` is a tuning parameter and can be adjusted in `LocationRepository.java` if the ranking behaviour needs changing.

---

## How to Run

### Prerequisites
- Java 17+ installed
- Access to an Azure PostgreSQL database
- Access to an Azure Blob Storage account
- Any terminal

### Setup
1. Clone the repository
2. Copy `application.properties.example` to `application.properties` in `src/main/resources/` and fill in the Azure credentials
3. Run via terminal:
   ```
   .\mvnw.cmd spring-boot:run       # Windows
   ./mvnw spring-boot:run           # macOS / Linux
   ```
4. Backend starts on `http://localhost:8080`

> **No local database needed.** The app connects directly to the shared Azure PostgreSQL instance. Do not change `ddl-auto` to `create` or `create-drop` — this will wipe the shared database.

---

## Example Requests

### Create a user
```json
POST /users
{
  "username": "jack",
  "email": "jack@email.com"
}
```

### Create a location
```json
POST /locations
{
  "name": "Temple Bar Pub",
  "category": "bar",
  "address": "Temple Bar, Dublin",
  "latitude": 53.3456,
  "longitude": -6.2619,
  "createdById": "your-user-uuid"
}
```
Coordinates are stored internally as a PostGIS `geography(Point, 4326)` column and returned as GeoJSON. Callers always send plain `latitude`/`longitude` numbers.

### Create a review
```json
POST /reviews
{
  "user": { "id": "your-user-uuid" },
  "location": { "id": "your-location-uuid" },
  "rating": 5,
  "body": "Amazing atmosphere!"
}
```

### Upload a review photo
```
POST /reviews/{id}/photo
Content-Type: multipart/form-data

file: <image file>
```
Uploads the image to Azure Blob Storage, saves the permanent URL to the review's `photoUrl` field, and returns:
```json
{ "url": "https://<account>.blob.core.windows.net/<container>/<blob>" }
```
Photo is optional — reviews without a photo have `photoUrl: null`.

### Get all reviews for a location
```
GET /locations/{id}/reviews
```

### Get all reviews by a user
```
GET /users/{id}/reviews
```

### Get nearby locations
Returns all locations within a given radius of the provided coordinates, in no particular order.
```
GET /locations/nearby?lat={latitude}&lng={longitude}&km={radius}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| lat | double | Latitude of the search origin |
| lng | double | Longitude of the search origin |
| km | double | Search radius in kilometres (default: 5) |

Example — locations within 5km of Dublin city centre:
```
GET /locations/nearby?lat=53.3456&lng=-6.2619&km=5
```

### Get nearby locations ranked by score
Returns locations within a given radius, sorted by Bayesian average score (best first).

A location with 1 perfect review will not outrank one with 100 strong reviews — new locations are anchored toward the global average until they have enough reviews to be trusted.

```
GET /locations/nearby/ranked?lat={latitude}&lng={longitude}&km={radius}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| lat | double | Latitude of the search origin |
| lng | double | Longitude of the search origin |
| km | double | Search radius in kilometres (default: 5) |

Example — ranked locations within 5km of Dublin city centre:
```
GET /locations/nearby/ranked?lat=53.3456&lng=-6.2619&km=5
```

Response fields per location:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Location ID |
| name | String | Location name |
| category | String | e.g. "bar", "restaurant" |
| address | String | Address |
| latitude | Double | Latitude (extracted from PostGIS Point) |
| longitude | Double | Longitude (extracted from PostGIS Point) |
| reviewCount | Integer | Total number of reviews |
| averageRating | Double | Plain average of all ratings (0 if no reviews) |
| bayesianScore | Double | Bayesian-adjusted score used for ranking |

### Send a friend request
```json
POST /friends
{
  "requesterId": "your-user-uuid",
  "receiverId": "other-user-uuid"
}
```

### Accept a friend request
```
PATCH /friends/{friendship-id}?receiverId={your-user-uuid}
```
> **Note:** `receiverId` is a temporary query parameter until Azure Entra ID auth is wired up, at which point the receiver's identity will be derived from their JWT token instead.

### Get a user's friends
```
GET /users/{id}/friends
```
Returns a list of `User` objects who have an accepted friendship with the given user. Friendships are bidirectional — the user may have been either the requester or the receiver.

### Get a user's feed
```
GET /users/{id}/feed
```
Returns all reviews posted by the user's accepted friends, ordered newest first. Queries both directions of the friendship (the user may have sent or received each friend request).

### Upload a profile picture
```
POST /users/{id}/profile-picture
Content-Type: multipart/form-data

file: <image file>
```
Uploads the image to Azure Blob Storage, saves the permanent URL to the user's `profilePic` field, and returns:
```json
{ "url": "https://<account>.blob.core.windows.net/<container>/<blob>" }
```

### Upload a standalone image
```
POST /api/images/upload
Content-Type: multipart/form-data

file: <image file>
```
Returns a permanent public URL for the uploaded image. Only image content types (jpeg, png, gif, webp, etc.) are accepted.

### Delete an image
```
DELETE /api/images/{blobName}
```
Deletes the blob with the given name from Azure Blob Storage. Returns a confirmation message. No-ops silently if the blob does not exist.

---

## What's Next

| Feature | Notes |
|---------|-------|
| Azure Entra ID authentication | Wire up JWT validation; derive user identity from token rather than request body/params |
| Location cover images | Blob storage infrastructure already in place |
| Input validation | Add `@Valid` annotations and proper 400 responses for malformed requests (e.g. missing required fields, rating out of range) |
