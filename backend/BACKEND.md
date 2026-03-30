# LocationReviewApp — Backend

## What This Is
This is the Spring Boot backend for the location review and recommendation app (Name Pending) — a location review platform where users can discover, add, and review places.

## Tech Stack
- **Java 17+** — programming language
- **Spring Boot 3.2.5** — backend framework (downgraded from 4.0.3 — hibernate-spatial was not available on Maven Central for Hibernate 7, which Spring Boot 4 bundles. 3.2.5 is a stable, widely supported release and resolves all dependencies cleanly)
- **PostgreSQL** — database
- **PostGIS** — geographic extension for PostgreSQL, used for storing and querying location coordinates
- **Spring Security** — authentication (Azure Entra ID to be configured)
- **Spring Data JPA + Hibernate Spatial** — database access layer with spatial support

## Project Structure
```
src/main/java/com/example/LocationReviewApp/
├── model/          → Database entity classes (User, Location, Review)
├── repository/     → Database query interfaces
├── controller/     → REST API endpoints
├── dto/            → Data Transfer Objects (e.g. LocationRequest)
├── config/         → Security + GeoJSON serialization configuration
└── Application.java → App entry point
```

## API Endpoints

### Users
| Method | URL | Description |
|--------|-----|-------------|
| GET | /users | Get all users |
| GET | /users/{id} | Get user by ID |
| POST | /users | Create a new user |
| DELETE | /users/{id} | Delete a user |
| GET | /users/{id}/reviews | Get all reviews by a user |

### Locations
| Method | URL | Description |
|--------|-----|-------------|
| GET | /locations | Get all locations |
| GET | /locations/{id} | Get location by ID |
| POST | /locations | Create a new location |
| DELETE | /locations/{id} | Delete a location |
| GET | /locations/{id}/reviews | Get all reviews for a location |

### Reviews
| Method | URL | Description |
|--------|-----|-------------|
| GET | /reviews | Get all reviews |
| GET | /reviews/{id} | Get review by ID |
| POST | /reviews | Create a new review |
| DELETE | /reviews/{id} | Delete a review |

## How to Run Locally

### Prerequisites
- Java 17+ installed
- PostgreSQL installed and running with PostGIS extension enabled
- IntelliJ IDEA

### Setup
1. Clone the repository
2. Open in IntelliJ
3. Edit `src/main/resources/application.properties` with your PostgreSQL credentials
4. Run `Application.java`
5. Backend starts on `http://localhost:8080`

### Database Setup
- Create a PostgreSQL database called `locationdb`
- Enable the PostGIS extension by running this once in your database:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```
- The tables will be created automatically on first run

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
Note: coordinates are stored internally as a PostGIS geography(Point, 4326) column and returned as GeoJSON. Callers always send plain latitude/longitude numbers.

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

### Get closest locations to specified location
```
GET /locations/nearby?lat=[x1]&lng=[x2]&km=[x3]
```
#### Query Parameters

| Parameter | Type  | Description               |
|----------|-------|---------------------------|
| `x1`    | double | Latitude of the location  |
| `x2`    | double | Longitude of the location |
| `x3`     | double | Radius in kilometers      |

#### Example Request
latitude: 53.3456  
longitude: -6.2619  
radius: 5km  

```
GET /locations/nearby?lat=53.3456&lng=-6.2619&km=5
```

## What's Next
- Azure Entra ID authentication
- Friendship endpoints
- Review photo upload via Azure Blob Storage
