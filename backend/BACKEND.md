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

> **Note on Spring Boot version:** Downgraded from 4.0.3 to 3.2.5 — hibernate-spatial was not available on Maven Central for Hibernate 7, which Spring Boot 4 bundles. 3.2.5 is a stable, widely supported release and resolves all dependencies cleanly.

---

## Project Structure
```
src/main/java/com/example/LocationReviewApp/
├── model/          → Database entity classes (User, Location, Review, Friendship, FriendshipStatus)
├── repository/     → Database query interfaces
├── controller/     → REST API endpoints
├── dto/            → Data Transfer Objects (LocationRequest, FriendRequest)
├── config/         → Security + GeoJSON serialization configuration
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
| profilePic | String | Optional, stores a URL (Azure Blob Storage — not yet implemented) |
| createdAt | Instant | Set automatically on creation |

### Location
Represents a place that can be reviewed (pub, restaurant, cafe etc.).

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Auto-generated primary key |
| name | String | Required |
| category | String | e.g. "bar", "restaurant", "cafe" — required |
| address | String | Optional |
| coordinates | Point | PostGIS geography(Point, 4326) — stored as GeoJSON, accepts lat/lng via LocationRequest DTO |
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
| createdAt | Instant | Set automatically on creation |

### Friendship
Represents a friendship between two users. Friendships are directional at the request stage (one user sends, one receives) but are treated as bidirectional once accepted.

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Auto-generated primary key |
| requester | User (FK) | The user who sent the friend request |
| receiver | User (FK) | The user who received the friend request |
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

### Locations
| Method | URL | Description |
|--------|-----|-------------|
| GET | /locations | Get all locations |
| GET | /locations/{id} | Get location by ID |
| POST | /locations | Create a new location |
| DELETE | /locations/{id} | Delete a location |
| GET | /locations/{id}/reviews | Get all reviews for a location |
| GET | /locations/nearby?lat=&lng=&km= | Get locations within a given radius |

### Reviews
| Method | URL | Description |
|--------|-----|-------------|
| GET | /reviews | Get all reviews |
| GET | /reviews/{id} | Get review by ID |
| POST | /reviews | Create a new review |
| DELETE | /reviews/{id} | Delete a review |

### Friends
| Method | URL | Description |
|--------|-----|-------------|
| POST | /friends | Send a friend request |
| PATCH | /friends/{id}?receiverId= | Accept a friend request |

---

## Error Responses

The API returns standard HTTP status codes. Error responses include a `message` field describing the problem (requires `server.error.include-message=always` in `application.properties`).

| Status | Meaning | Example |
|--------|---------|---------|
| 200 OK | Request succeeded | — |
| 404 Not Found | The requested resource does not exist | User/location/review not found |
| 403 Forbidden | The caller is not permitted to perform this action | Trying to accept a friend request you didn't receive |
| 409 Conflict | The request conflicts with existing data | Sending a duplicate friend request |
| 500 Internal Server Error | Unexpected server error | — |

---

## Configuration

The app is configured via `src/main/resources/application.properties`. This file is **not committed to the repository** — copy `application.properties.example` and fill in your own values.

### Key properties

```properties
# PostgreSQL connection
spring.datasource.url=jdbc:postgresql://localhost:5432/locationdb
spring.datasource.username=your_username
spring.datasource.password=your_password

# Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.spatial.dialect.postgis.PostgisPG95Dialect

# Show full error messages in API responses
server.error.include-message=always
```

> **ddl-auto warning:** `update` is safe for local development — Hibernate will create or alter tables automatically. Do **not** use `create` or `create-drop` against the shared Azure database as this will wipe existing data.

---

## How to Run Locally

### Prerequisites
- Java 17+ installed
- PostgreSQL installed and running with PostGIS extension enabled
- IntelliJ IDEA

### Setup
1. Clone the repository
2. Open in IntelliJ
3. Copy `application.properties.example` to `application.properties` and fill in your PostgreSQL credentials
4. Run `Application.java`
5. Backend starts on `http://localhost:8080`

### Database Setup
Create a PostgreSQL database called `locationdb`, then enable the PostGIS extension by running this once:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```
Tables are created automatically on first run via Hibernate.

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

### Get all reviews for a location
```
GET /locations/{id}/reviews
```

### Get all reviews by a user
```
GET /users/{id}/reviews
```

### Get nearby locations
Returns all locations within a given radius of the provided coordinates.
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

---

## What's Next

| Feature | Notes |
|---------|-------|
| Azure Entra ID authentication | Wire up JWT validation; derive user identity from token rather than request body/params |
| Photo uploads | Review photos, profile pictures, and location cover images via Azure Blob Storage |
| Migrate to shared database | Switch from local PostgreSQL to the shared Azure Database for PostgreSQL (Flexible Server) — update `application.properties` accordingly and set `ddl-auto=validate` |
| Input validation | Add `@Valid` annotations and proper 400 responses for malformed requests (e.g. missing required fields, rating out of range) |
