## Rough Technology Stack

**Backend:** Java + Spring Boot  
**Frontend:** React Native

|System Components|Azure Service|Alternative (Free Tier)|
|---|---|---|
|Backend API|Azure App Service|Render|
|Database|Azure Database for PostgreSQL|Supabase|
|Maps / Geo Services|Azure Maps|Mapbox|
|File Storage|Azure Blob Storage|AWS S3|
|Authentication|Azure Active Directory B2C|Firebase Authentication|
|Notifications|Azure Notification Hubs|Firebase Cloud Messaging|
|Monitoring|Azure Application Insights|Sentry|

---

# 1. Cloud Platform

## Microsoft Azure

Microsoft Azure can be used as the primary cloud platform for hosting and managing our application infrastructure.

Azure provides services for:

- backend hosting
    
- databases
    
- file storage
    
- authentication
    
- notifications
    
- monitoring and analytics
    

These services are integrated into one ecosystem, which simplifies system management.

Possible Azure services for the project include:

- **Azure Blob Storage** – storing images and uploaded files
    
- **Azure Active Directory B2C** – managing user authentication
    
- **Azure Notification Hubs** – sending push notifications
    
- **Azure Application Insights** – monitoring performance and errors
    

---

### Alternative Cloud Services

Some Azure services may have limited free tiers, so alternatives can be considered.

**File Storage**

- AWS S3 provides scalable object storage with a free tier.
    
- Suitable for storing user-uploaded images.
    

**Notifications**

- Firebase Cloud Messaging (FCM) is widely used and completely free.
    
- It supports Android, iOS, and web notifications.
    

**Authentication**

- Firebase Authentication offers easy user management.
    
- Supports email login, Google login, and social authentication.
    

**Monitoring**

- Sentry provides error tracking and debugging tools.
    
- The free tier supports small-scale applications.
    

---

### What a Cloud Platform Provides

A cloud platform provides infrastructure such as:

- servers for running applications
    
- databases for storing data
    
- storage systems for files
    
- networking and connectivity
    
- security and authentication services
    

Using cloud platforms avoids the need to maintain physical servers.

---

#  2. Backend Hosting (API Server)

The backend API handles communication between the frontend and the database.

It processes requests such as:

- user login and registration
    
- retrieving locations
    
- posting reviews
    
- calculating nearby locations
    

---

## Azure App Service

Azure App Service can host the backend API.

Advantages:

- fully managed infrastructure
    
- automatic scaling
    
- easy deployment from GitHub
    
- support for Java, Node.js, Python, and other runtimes
    

This makes it suitable for hosting a **Spring Boot backend application**.

---

### Alternative: Render

Render is a cloud platform that supports backend deployment.

Advantages:

- supports Java applications
    
- easy deployment directly from GitHub
    
- simple user interface
    
- free tier includes ~750 instance hours per month
    

Render also provides a **managed PostgreSQL database**, allowing both the API and database to be hosted on the same platform.

This makes it beginner-friendly for development and testing.

---

# 3. Maps and Geolocation

Location services are essential for the application because the app recommends places based on the user’s location.

---

## Azure Maps

Azure Maps provides mapping and geospatial services.

Capabilities include:

- displaying map tiles
    
- converting addresses to coordinates (geocoding)
    
- routing and navigation
    
- traffic information
    
- calculating distances between locations
    

These services allow the application to:

- show nearby locations on a map
    
- calculate distance between users and locations
    
- display recommended places.
    

---

### Alternative: Mapbox

Mapbox provides mapping APIs similar to Azure Maps.

Advantages:

- strong customization options
    
- easy integration with mobile apps
    
- free tier available for development
    

However, the free usage limit may restrict large-scale applications.

---

# 4. Database

The application requires a relational database to store structured data.

Example data stored includes:

- users
    
- locations
    
- reviews
    
- friendships
    
- ratings
    

---

## Azure Database for PostgreSQL

Azure Database for PostgreSQL provides a managed PostgreSQL database.

Advantages:

- automatic backups
    
- automatic scaling
    
- built-in security integration
    
- support for PostGIS extension
    

PostGIS allows the database to store **geospatial data and perform geo-queries**, which are required for calculating nearby locations.

---

### Alternative: Supabase

Supabase provides a managed PostgreSQL database with a generous free tier.

Advantages:

- built-in PostgreSQL support
    
- PostGIS extension available
    
- simple setup and dashboard
    
- suitable for development and small-scale projects
    

---

# 5. Backend

The backend will be implemented using:

**Java + Spring Boot**

Spring Boot is a framework that simplifies building backend applications and REST APIs in Java.

Spring Boot provides:

- built-in web server
    
- REST API development tools
    
- database integration through JPA
    
- dependency management
    
- structured application architecture
    

It is widely used for building scalable backend systems.

---

# 6. Frontend

The frontend will likely be developed using:

**React Native**

React Native allows developers to build mobile applications for both **Android and iOS** using JavaScript.

Advantages:

- cross-platform development
    
- large community support
    
- easy integration with REST APIs
    
- suitable for map-based and location-based applications
    

The frontend communicates with the backend via HTTP requests to REST API endpoints.

Example request:

GET /locations/nearby

The backend processes the request and returns data in JSON format, which the frontend displays to the user.



