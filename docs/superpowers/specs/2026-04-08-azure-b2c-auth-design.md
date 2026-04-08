# Microsoft Entra External ID Auth — Design

**Date:** 2026-04-08
**Branch:** feature/azure-b2c-auth

> **Note:** Azure AD B2C is no longer available for new tenants (deprecated May 2025). We're using Microsoft Entra External ID — the direct replacement. Same architecture, different portal path and endpoints (`ciamlogin.com` instead of `b2clogin.com`).

---

## What we're doing

We're adding real authentication to the app using Microsoft Entra External ID. Right now the backend is completely open — anyone can hit any endpoint with no login required. That needs to change.

The plan is: users sign up and log in through a Microsoft-hosted page (we don't build the login form ourselves, Microsoft does). After they log in, Microsoft gives the app a token. The app attaches that token to every API call, and the backend checks it's real before doing anything.

We're going with email + password only for now. We can add Google or Microsoft account login later through the Azure portal without touching any code.

---

## How it all fits together

```
Microsoft Entra External ID
  → hosts the login/signup page
  → checks the user's email and password
  → hands back a signed JWT token

React Native App
  → opens the Entra External ID login page in a browser
  → gets the token back when the user logs in
  → stores it and attaches it to every API request

Spring Boot Backend
  → checks every incoming token is actually from our External ID tenant
  → reads who the user is from the token
  → if it's their first login, creates a user row in the database automatically

PostgreSQL Database
  → users table gets one new column: azure_oid
  → this is the ID Microsoft assigns each person — we use it to link a token to a user row
```

The backend never touches passwords at all. It just checks the token is genuine and reads what's inside it.

---

## Azure setup (portal stuff)

Before writing any code we need to set up a few things in the Azure portal:

1. Create an External ID external tenant — this is basically our own little Microsoft login system
2. Register two apps inside it — one for the backend API, one for the mobile app
3. Create a "Sign up and sign in" user flow — this is the page users will actually see when they log in
4. Set up a redirect URI so the app knows where to go after login

---

## Backend changes

### New dependency
We add `spring-boot-starter-oauth2-resource-server` to `pom.xml`. This is what gives Spring Security the ability to understand and validate JWTs. Without it, Spring has no idea what a token even is.

### Two new lines in `application.properties`
We point Spring at our External ID tenant's public keys via the issuer URI. On startup, Spring auto-discovers the JWK endpoint and downloads the public keys, then uses them to verify every token that comes in. We don't write any verification logic ourselves — Spring handles it.

### `SecurityConfig.java` gets replaced
Right now it just says "let everything through." The new version says "every request needs a valid token — if there's no token or it's fake, return 401." CORS and CSRF config stays basically the same.

### `User.java` gets a new field — `azureOid`
This is the unique ID Microsoft assigns each B2C user (the `sub` claim in the token). We store it in our users table so we can answer the question: "this token belongs to who exactly in our database?"

### New query in `UserRepository.java`
```java
Optional<User> findByAzureOid(String azureOid);
```
Simple lookup — give me the user with this Azure ID.

### New `AuthController.java`
One endpoint:
```
POST /auth/me
Authorization: Bearer <token>
```
This is the first thing the frontend calls after every login. The backend reads the token, gets the Azure OID, looks it up in the database:
- If the user already exists → return them
- If it's their first ever login → create a new user row and return them

Safe to call every time. Idempotent.

### Database migration
New file: `database/migrations/V002__users_add_azure_oid.sql`

Just adds the one column:
```sql
ALTER TABLE users ADD COLUMN azure_oid VARCHAR(255) UNIQUE;
```

---

## Frontend changes

### New packages
```
expo-auth-session
expo-crypto
```
`expo-web-browser` is already in `package.json` so we're good there.

### `context/AuthContext.tsx` — new file, most important piece
This is a global store for the user's login state. Any screen in the app can call `useAuth()` and get:

| Thing | What it is |
|---|---|
| `token` | The JWT — we attach this to every API call |
| `user` | Our database user object (id, username, email, etc.) |
| `login()` | Opens the Entra External ID login page |
| `logout()` | Clears everything and sends the user back to the login screen |
| `isLoading` | True while the app is checking if the user's already logged in |

On startup the context checks if there's a saved token from a previous session. If there is and it hasn't expired, the user skips the login screen automatically.

### `app/_layout.tsx` — updated
Wraps the whole app in the `AuthProvider`. Adds the gating logic:
- Still loading → show a loading screen
- No user logged in → redirect to login
- User is logged in → redirect to the tabs

### `app/(auth)/login.tsx` — replaced
The email/password form gets scrapped. Replaced with one button: "Sign in with Microsoft." Tapping it calls `login()` from the context, which opens the Entra External ID hosted page. Microsoft handles everything from there.

### `app/(auth)/signup.tsx` — deleted
Entra External ID's user flow handles sign up and sign in on the same hosted page. We don't need a separate signup screen anymore.

### Shared `api.ts` utility — new file
A small helper so every API call automatically gets the token attached. Screens just call it instead of writing the `Authorization` header every time.

---

## What happens when someone logs in for the first time

1. User taps "Sign in with Microsoft"
2. B2C login page opens in the browser
3. They enter their email and password (or create an account)
4. B2C redirects back to the app with a token
5. App calls `POST /auth/me` with that token
6. Backend reads the Azure OID from the token
7. Checks the database — no match found, so it creates a new user row
8. Returns the user object to the app
9. App saves the token to secure storage, puts the user in context
10. Root layout sees the user is set → navigates to the main tabs

Every login after the first one skips step 7 and just returns the existing user.

---

## How we test it (without needing everything connected at once)

**Step 1 — Entra External ID alone:** Run the user flow from the Azure portal. Check the login page appears and we get a token back. No code needed.

**Step 2 — Backend alone:** Copy that token into Postman. Hit the backend with it. Check we get 200 with a valid token and 401 without one. Check `POST /auth/me` creates a user in the database.

**Step 3 — Frontend alone:** Run the Expo app. Tap login. Check the Entra External ID page opens and we get redirected back with a token. Log the token to the console. Don't call the backend yet.

**Step 4 — Put it all together:** Run frontend and backend at the same time. Go through the full flow. Check the user gets created in the database and can hit protected endpoints.

---

## What we're not changing

- All existing endpoints stay the same — same URLs, same behaviour
- Azure Blob Storage — untouched
- PostGIS / location queries — untouched
- The database schema apart from the one new column

---

## Things to clean up after this branch

Once auth is in, a few existing endpoints should derive the user's identity from the token instead of trusting whatever the caller sends:

| Endpoint | Problem now | Fix |
|---|---|---|
| `PATCH /friends/{id}?receiverId=` | Caller passes their own ID — easy to fake | Read from token instead |
| `POST /reviews` | `user.id` comes from the request body | Read from token instead |
| `POST /locations` | `createdById` comes from the request body | Read from token instead |

These are follow-on tasks for after this branch is merged. Auth makes them a one-line fix each.
