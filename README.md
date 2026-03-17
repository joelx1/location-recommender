# LocationReviewApp — Backend

## What This Is
This is the Spring Boot backend for the location review and recommendation app (Name Pending) — a location review platform where users can discover, add, and review places.

## Tech Stack
- **Java 17+** — programming language
- **Spring Boot 4** — backend framework
- **PostgreSQL 18** — database
- **Spring Security** — authentication (Azure Entra ID to be configured)
- **Spring Data JPA** — database access layer

## Project Structure
```
src/main/java/com/example/LocationReviewApp/
├── model/          → Database entity classes (User, Location, Review)
├── repository/     → Database query interfaces
├── controller/     → REST API endpoints
├── config/         → Security configuration
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

### Locations
| Method | URL | Description |
|--------|-----|-------------|
| GET | /locations | Get all locations |
| GET | /locations/{id} | Get location by ID |
| POST | /locations | Create a new location |
| DELETE | /locations/{id} | Delete a location |

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
- PostgreSQL installed and running
- IntelliJ IDEA

### Setup
1. Clone the repository
2. Open in IntelliJ
3. Edit `src/main/resources/application.properties` with your PostgreSQL password
4. Run `Application.java`
5. Backend starts on `http://localhost:8080`

### Database Setup
- Create a PostgreSQL database called `locationdb`
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
  "createdBy": { "id": "your-user-uuid" }
}
```

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

## What's Next
- Azure Entra ID authentication
- Nearby location search using coordinates
- Friendship endpoints
- Review photo upload via Azure Blob Storage
