# Frontend Folder Structure

This document proposes a basic frontend folder structure for the React Native and Expo application.

The purpose of this structure is to keep the project organised from the beginning and make teamwork easier. It is only an initial version, so it can still be adjusted later as the project grows.

## Proposed Structure (Type-based Structure)

```text
app/       # contains the main screens and routing structure
  (auth)/          # contains authentication-related screens
    login.tsx
    signup.tsx
  (tabs)/       # contains the main tab-based screens
    home.tsx
    search.tsx
    feed.tsx
    profile.tsx
  screens/      # other screens inside app
    place/      # contains pages related to individual locations
      [id].tsx
    friend/      # contains pages related to other users
      [id].tsx
    edit-profile.tsx
    write-review.tsx
  _layout.tsx      # used for shared layout and navigation setup

components/     # reusable UI components
  common/    # for shared components used across multiple screens
  ui/    # shared UI components

assets/    # contains static files
  images/
  icons/

constants/     # contains shared constant values used across the project

services/     # contains frontend logic for backend communication and API calls

utils/      # contains helper functions and reusable utility logic

hooks/      # custom hooks

```

### Resources

https://www.tricentis.com/learn/react-native-project-structure

https://expo.dev/blog/expo-app-folder-structure-best-practices
