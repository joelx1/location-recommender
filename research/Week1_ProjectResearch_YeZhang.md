# Week 1 Project Research - Ye Zhang

## User Stories

- As a user, I want to create an account so that I can use personalised features.
- As a user, I want to log in securely so that my information and activity are protected.
- As a user, I want to create and edit my profile so that I can personalise my account.
- As a user, I want to use my current location so that I can view nearby places.
- As a user, I want to search for places so that I can quickly find the place I am interested in.
- As a user, I want to view details of a place so that I can make better decisions.
- As a user, I want to add reviews for a place so that I can share my experience.
- As a user, I want to upload photos with my review so that other users can better understand the place.
- As a user, I want to follow other users so that I can receive recommendation through those I trust.

## MVP Features

### 1. Authentication

### Goal

Allow users to create an account and log in securely.

### Core Functions

- Users can sign up with an email address and confirm their password.
- Users can log in using their registered email and password.
- Users can log out of the application.
- The system should display error messages for invalid login details.
- Basic form validation should be included.

### Pages Needed

- Sign Up Page
- Log In Page

### UI Elements

- Email input
- Password input
- Confirm password input
- Submit button
- Error message area
- Link to switch between sign up and log in
- Link to social meida login

### 2. User Profile

### Goal

Allow users to create, view, and update their personal information in the app.

### Core Functions

- Create a user profile after sign up
- Edit username and profile image
- View profile information
- View personal reviews
- Display follower and following counts

### Pages Needed

- User Profile Page
- Edit Profile Page

### UI Elements

- Profile image
- Username
- Edit profile button
- Followers count
- Following count
- Review list section

### 3. View and Search Places

### Goal

Allow users to discover nearby places based on their current location.

### Core Functions

- Request location permission from the user
- Detect the user’s current location
- Show nearby places
- Search places by keyword
- Display places in a list and optionally on a map

### Pages Needed

- Home Page
- Explore Page

### UI Elements

- Search bar
- Use current location button
- Place cards
- Empty state for no results

### 4. Place Details and Reviews

### Goal

Help users evaluate a place through useful information and community feedback.

### Core Functions

- Open a place details page
- Show place name, address, category, rating and photos
- Display reviews
- Allow users to leave a rating
- Allow users to write a review
- Allow users to upload review photos

### Pages Needed

- Place Details Page
- Add Review Page

### UI Elements

- Place title
- Place image
- Rating display
- Review list
- Add review form
- Rating input
- Photo upload button
- Submit button

### 5. Follow Other Users

### Goal

Add a lightweight social feature that supports future friend-based recommendations.

### Core Functions

- View another user’s profile
- Follow a user
- Unfollow a user

### Pages Needed

- Public User Profile Page
- Following / Followers Page

### UI Elements

- Follow button
- Unfollow button
- User cards
- Followers count
- Following count

## MVP Pages

1. **Sign Up Page**  
   Lets new users create an account.

2. **Log In Page**  
   Lets returning users access their account.

3. **Profile Page**  
   Displays personal profile information and user activity.

4. **Home Page**  
   Shows nearby places, recent posts and search places.

5. **Place Details Page**  
   Shows full information about a selected place.

6. **Add Review Page**  
   Lets users submit a rating, written review, and optional photos.

7. **Public User Profile Page**  
   Displays another user’s public information and a follow button.

8. **Followers / Following Page**  
   Shows social connections in a list format.

## Nice-to-Have Features

- Save places to favourites
- Filter places by category, rating, or distance
- Friend interaction features such as likes or comments
- Time-based recommendation controls
- Notifications for new reviews or recommendations

## Tech Stack

- **Frontend:** React with Vite and Tailwind CSS
  - React is suitable for building a dynamic and component-based frontend.
  - Tailwind CSS helps speed up UI development and supports responsive design.
  - Vite offers significantly faster build times than traditional tools.

- **Backend:** Node.js with Express
  - Lightweight and easier to start with for REST API development.

- **Database:** PostgreSQL or Firebase
  - PostgreSQL is useful for structured relational data such as users, reviews, and relationships. Requires manual schema management and server hosting.
  - Firebase can reduce setup complexity and is easier to start with, but it may be less suitable for complex relational logic.

- **Authentication:** Firebase Authentication or Azure App Service Easy Auth
  - Firebase Authentication is easy to set up with SDKs for social login.
  - Azure App Service Easy Auth is deeply integrated if hosting on Azure App Service.

- **Image Storage:** Firebase Storage or Azure Blob Storage
  - Firebase Storage simplifies photo uploads for reviews. Security rules allow easy access control.
  - Azure Blob Storage can store files and photos, but it cannot store reviews or other structured data.

- **Maps Services:** Google Maps or Azure Maps
  - Google Maps is widely used and provides rich location and place search features.
  - Azure Maps may be a good option if the project is hosted within the Azure ecosystem.

## Scope Decision

For the first version, the following should be prioritise:

1. Authentication
2. User profile
3. Location-based place discovery
4. Place details
5. Ratings and reviews

The social layer should remain lightweight in the beginning. Advanced features such as filtering, saved lists, scheduling control, and friend interactions should be added only after the core product is stable.

## Next Steps

- Summary the MVP
- Decide the tech stack
- Create wireframes for the pages
- Define the database structure
- Project setup
