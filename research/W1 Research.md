# Research Report: Joel VG

### TLDR

React Native frontend, Java Spring Boot backend, Azure Services for most things

- **MVP Features:** User sign-up/login, location search & listing, reviews & ratings, photo uploads, friend connections, location recommendations, and geo-tracking with notifications.  
- **Optional Extensions:** Event crowd reporting, verified reviews & moderation, advanced filtering (vegan, wheelchair-friendly, friend-only), owner engagement, achievements & badges, sentiment/trend analysis, and accessibility flags.  
- **Azure Services:** Azure SQL Database (data), Blob Storage (photos), Maps API (geo), Notification Hubs (push alerts), Cognitive Services – Text Analytics (sentiment), Content Moderator (moderation), Microsoft Entra ID (secure login), Azure Functions (serverless triggers).  
- **Security:** JWT-based authentication for secure API access.  
- **Goal:** Launch MVP with core social, geo, and review functionality; add extensions to enhance engagement, analytics, and inclusivity once stable.

## Overview

These are the features I believe we should add to our app. I believe these are the most important and useful ones to add.
Since we are doing it with microsoft I have also appended a related service I could find on azure that might help or that we can use with that section to make it work.

**Technical Requiements:**
- Have a reliable storage of user data (photos, reviews, ratings). 
- Geo location services to identify user's locations and suggest relevant places.  
- Social network modeling for friend connections and recommendations.  
- Real time notifications and event reporting.

---

## Feature List

### MVP Features

| Feature | Description | Azure Integration |
|---------|------------|----------------|
| User Sign up/Login | Sign up with username + email/password; store profiles | Azure SQL Database, Microsoft Entra ID (B2C)|
| Location Listing & Search | Show nearby locations filtered by type (restaurant, bar, club) | Azure Maps API |
| Reviews & Ratings | Be able to write text reviews, rate locations etc. | Azure SQL Database |
| Photo Uploads | Users can attach images to reviews | Azure Blob Storage |
| Friend / Connections | Ability to add friends to view their activity | Azure SQL Database |
| Location Recommendations | Suggest locations based on friend's activity | Azure Maps API + SQL queries |
| Geo Tracking & Notifications | Notify if the user is near  a spot reccomended by their friend | Azure Maps API + Azure Notification Hubs |

### Extras (Optional)
Enhancements for advanced user engagement after MVP:

| Feature | Description | Azure Integration |
|---------|------------|----------------|
| Event Capacity Reporting | Users report crowd sizes at venues | Azure SQL Database |
| Verified Reviews & Moderation | To be able to sort and flag inappropriate or fake reviews | Azure Content Moderator |
| More Filtering Options | Filter by vegan, wheelchair-friendly, etc.  | Azure Cognitive Search + Maps API |
| Owner Engagement | Business owners respond to reviews | Azure SQL Database |
| Achievements / Badges | Makes the app fun and users can try to collect achievements with their friends | Azure Functions + SQL triggers |
| Sentiment Analysis | Show trends in reviews over time | Azure Cognitive Services – Text Analytics |
| Accessibility Flags | Highlight wheelchair access, quiet seating, etc. | Azure SQL + Maps API |

---

## Technical Architecture & Azure Integration

| Project Requirement | Azure Service | Tech Stack Implementation | Purpose |
|--------------------|---------------|-------------------------|---------|
| API / Backend | Azure App Service | Java Spring Boot | REST API for business logic (checking permissions, storing data, calculating recommendations, etc.)|
| User Data & Social | Azure SQL Database | Java / React | Relational storage for users, friends, reviews |
| Photo Storage | Azure Blob Storage | Java / React | High-resolution image storage |
| Geo-Spatial Data | Azure Maps API | React / Java | Map rendering, distance calculations, geofencing |
| Proximity Alerts | Azure Notification Hubs | Java / React | Push notifications near recommended locations |
| Sentiment Analysis | Azure Cognitive Services / Text Analytics | Java | Tag reviews as positive/negative |
| Search & Filtering | Azure Cognitive Search | Java / React | Vegan / visited by friends filters |
| Identity/Login | Microsoft Entra ID (B2C) | Java / React | Secure user sign-up, passwords, social login |
| Serverless Triggers | Azure Functions | Java | Achievement unlocks, notifications, event handling |
| Content Moderation | Azure Content Moderator | Java | Automatic detection of inappropriate content |

**Backend Language:** Java  
**Frontend Language:** React Native

---

## Other Technical Notes

### Data Storage
- **Azure SQL Database:** Store structured data like users, reviews, friend connections, and location metadata.  
- **Azure Blob Storage:** Store images; save Blob URLs in SQL for reference.

### Geo-Location Services
- **Azure Maps API:** Retrieve and display nearby locations, calculate distances, and implement geofencing.

### Notifications & Real-Time Updates
- **Azure Notification Hubs:** Push notifications for nearby locations recommended by friends.

### Scalability & Extensions
- **Azure Functions:** Serverless processing for achievements, trends analysis triggers, and crowd reports.  
- **Azure Cognitive Services – Text Analytics:** Process review content for trends.

### Frontend Implementation
- React components for user profiles, reviews, maps, notifications, and social interactions.  
- Use React hooks for fetching APIs, managing real-time updates, and state management.

### Backend Implementation
- Java Spring Boot REST APIs for CRUD operations: Users, Locations, Reviews, Photos.  
- Security via Json Web Token based authentication.  
- Optimize data retrieval for geo-location queries (nearest locations, friend recommendations).

---

## Feature Priority Table

| Feature | Priority | Notes |
|---------|----------|-------|
| User Registration/Login | 1 | Required for any interaction |
| CRUD for Reviews (Text/Stars) | 1 | Core content generation |
| Location Listing & Search | 1 | Core functionality |
| Photo Upload Integration | 2 | Enhances engagement |
| Geo-Tagging & Map Discovery | 2 | Visual and location-based discovery |
| Activity Feed (Friends' Posts) | 2 | Social network core |
| Friend Connections | 2 | Requirement for reccomendations |
| Geo-Tracking & Notifications | 3 | UX enhancement |
| Event Capacity Reporting | 3| Extension after MVP |
| Verified Reviews & Moderation | 4 | Optional but recommended |
| Sentiment & Accessibility Flags | 4 | Analytical / inclusion features |
| Owner Engagement | 4 | Business interaction |
| Achievements / Badges | 4 | Extra feature |

---

## Summary

**MVP** ensures that users can register, review locations, upload photos, and interact socially. 
**Extensions** like trend analysis, accessibility flags, and achievements enhance engagement once the core functionality is stable.  
**Microsoft's Azure services** provide scalable infrastructure for storage, APIs, real-time notifications, content moderation, and analytics.
**Java/React** stack ensures maintainable backend logic and a responsive, modern frontend.
