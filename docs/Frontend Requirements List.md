# Frontend Requirements List

Based on MVP scope and database schema.

## 1. Sign Up / Login

Allow users to create an account and log in to the app.

### Frontend Needs

- submit sign up information
- submit login information
- receive authentication result
- store user session
- redirect authenticated users to the app

### Backend Data Needed

#### Sign Up

- `username`
- `email`
- authentication confirmation
- basic user info after successful registration: `user_id`, `username`, `email`

#### Login

- `email` (or external auth identity)
- authentication response
- basic user info after successful login: `user_id`, `username`, `email`

## 2. Home

Provide a quick access to search, show popular places and friend posts.

### Frontend Needs

- current location or selected city
- a list of popular places
- a preview of friend recent posts

### Backend Data Needed

#### Popular Places

Each place card should ideally include:

- `location_id`
- `location_name`
- `category`
- `address`
- `average_rating`
- `review_count`

#### Friend Post

- `review_id`
- `user_id`
- `username`
- `location_id`
- `location_name`
- `rating`
- `review_text`
- `created_at`

## 3. Feed

Show recent friend review activity in a simple social feed.

### Frontend Needs

Each card should show:

- friend username
- place name
- review text
- event time
- rating

### Backend Data Needed

- `review_id`
- `created_at`
- `user_id`
- `username`
- `location_id`
- `location_name`
- `review_text`
- `rating`

## 4. Search

Allow users to search for places and browse matching results.

### Frontend Needs

- a search input
- a list of matching places
- navigation from search results to place details

### Backend Data Needed

- `location_id`
- `location_name`
- `category`
- `address`
- `geo`
- `review_count`
- `average_rating`

## 5. Map View

Display locations visually on a map.

### Frontend Needs

- markers for locations
- basic data when a marker is selected
- navigation to place details

### Backend Data Needed

- `location_id`
- `location_name`
- `geo`
- `category`
- `address`

## 6. Place Details

Show full information about a place, including reviews and a social element.

### Frontend Needs

- place title
- place information
- average rating
- reviews count
- social summary based on friend reviews
- review list

### Backend Data Needed

#### Places Information

- `location_id`
- `location_name`
- `category`
- `address`
- `geo`
- `review_count`
- `average_rating`

#### Review List

- `review_id`
- `user_id`
- `username`
- `location_name`
- `created_at`
- `review_text`
- `rating`

#### Social Summary

- `friends_reviewed_count`

## 7. Write Review

Allow users to rate a location and submit a review.

### Frontend Needs

- select a location
- rating
- edit review text
- submit review

### Backend Data Needed

- `location_id`
- `rating`
- `review_text`
- `review_id`
- result response

## 8. Profile

Show the current user's information and their own activity.

### Frontend Needs

- username
- email
- own reviews
- follower and following counts

### Backend Data Needed

#### User Information

- `user_id`
- `username`
- `email`

#### Friendships

- `following_count`
- `followers_count`

#### Reviews

- `review_id`
- `created_at`
- `user_id`
- `username`
- `location_id`
- `location_name`
- `review_text`
- `rating`

## 9. Friend Profile

Allow users to view another user's profile and their activity.

### Frontend Needs

- username
- friend reviews
- follower and following counts
- friendship state

### Backend Data Needed

#### User Information

- `user_id`
- `username`

#### Friendships

- `following_count`
- `followers_count`
- `friendship_status`

#### Reviews

- `review_id`
- `created_at`
- `user_id`
- `username`
- `location_id`
- `location_name`
- `review_text`
- `rating`

## 10. Edit Profile

Allow users to update their information.

### Frontend Needs

- username
- email

### Backend Data Needed

- `user_id`
- `username`
- `email`

## 11. Friend Map (Can leave it for later version)

Show locations reviewed by friends on a map.

### Frontend Needs

- friend-related location markers
- basic friend and location info on selection

### Backend Data Needed

- `location_id`
- `location_name`
- `geo`
- `user_id`
- `username`

## 12. Extensions

### a. Bookmarked

This requires a `save_locations` table.

#### Frontend Needs

- a save function in feed and place details screens
- show saved places on profile
- show save activity from friends on place details and feed

### b. Extended Profile Data

This would include:

- bio
- profile picture

#### Frontend Needs

- show bio on profile screen
- show profile picture on profile and friend profile screens
- edit bio and profile picture

### c. Images

This would inculde:

- profile pictures
- review images
- location images

### d. Alerts

This can be considered later.
