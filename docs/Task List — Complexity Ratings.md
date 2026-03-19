---
title: Task List — Complexity Ratings
project: Microsoft Project (CS335)
updated: 2026-03-19
---

# Task List — Complexity Ratings

> Used for planning, poker / sprint planning. Ratings are from the perspective of an average team member — not the person most familiar with the area.
> **E = Easy** (a few hours), 
> **M = Medium** (half a day to a day), 
> **H = Hard** (multiple days, unknowns involved)

---

## Database

| #    | Task                                                  | Difficulty | Week | Notes                                                        |
| ---- | ----------------------------------------------------- | ---------- | ---- | ------------------------------------------------------------ |
| DB-1 | Install PostgreSQL locally + enable PostGIS extension | M          | 3    | Each team member needs this before any local testing works   |
| DB-2 | Run the schema SQL (create all 4 tables)              | E          | 3    | Script is ready in `database/` — just needs to be run        |
| DB-3 | Verify PostGIS geo queries work (e.g. ST_Distance)    | M          | 4    | Test that coordinates can be stored and queried by proximity |
| DB-4 | Add `bio` and `profile_pic` columns to users table    | E          | 4    | Deferred — not needed yet                                    |
| DB-5 | Add `score` column to locations table                 | E          | 6    | Needed for ranking feature                                   |
| DB-6 | Migration strategy (how schema changes are shared)    | M          | 3    | versioned SQL scripts in the repo is simplest                |

---

## Backend

| #     | Task                                                          | Difficulty | Week | Notes                                                                                      |
| ----- | ------------------------------------------------------------- | ---------- | ---- | ------------------------------------------------------------------------------------------ |
| BE-1  | Fix DB connection (configure `application.properties`)        | E          | 3    | Each person needs to set their local PostgreSQL credentials — currently crashes on startup |
| BE-2  | Azure Entra ID — app registration on Azure portal             | M          | 3    | Done once, shared config. Prerequisite for BE-3                                            |
| BE-3  | Add Entra ID token validation to Spring Boot (SecurityConfig) | H          | 3    | Validates JWT tokens from Azure. Blocks all auth-protected endpoints                       |
| BE-4  | GET /users / POST /users / GET /users/{id}                    | E          | 3    | Basic CRUD in place                                                                        |
| BE-5  | GET /locations / POST /locations / GET /locations/{id}        | E          | 3    | Basic CRUD in place                                                                        |
| BE-6  | GET /reviews / POST /reviews / GET /reviews/{id}              | E          | 3    | Basic CRUD in place                                                                        |
| BE-7  | GET /locations/{id}/reviews (reviews for a location)          | E          | 4    | Filtered query — small addition to ReviewController                                        |
| BE-8  | GET /users/{id}/reviews (reviews by a user)                   | E          | 4    | Same pattern as BE-7                                                                       |
| BE-9  | Friend endpoints: send request, accept, list friends          | M          | 5    | POST /friends, PATCH /friends/{id}, GET /users/{id}/friends                                |
| BE-10 | GET /users/{id}/feed (reviews from friends)                   | H          | 5    | Joins users → friendships → reviews. Most complex query so far                             |
| BE-11 | Proximity search — locations within X km (PostGIS)            | H          | 4    | Uses ST_DWithin. Needs PostGIS working end-to-end first                                    |
| BE-12 | Location score/ranking calculation                            | H          | 6    | Formula TBD — depends on reviews being in place                                            |
| BE-13 | Add bio + profile_pic to User model                           | E          | 4    | Minor model update                                                                         |

---

## Frontend

| # | Task | Difficulty | Week | Notes |
|---|---|---|---|---|
| FE-1 | Get Expo app running on simulator / phone | E | 3 | Scaffolded but not confirmed running for all team members |
| FE-2 | Agree on folder/file structure | E | 3 | Should mirror the backend areas: auth, profile, locations, reviews, feed |
| FE-3 | Sketch 3 core screens (Login, Profile, Feed) | E | 3 | Even on paper — needed before building |
| FE-4 | Write up what info is needed from backend | E | 3 | e.g. "Profile needs: username, bio, review count, list of reviews" |
| FE-5 | Login screen + Azure Entra ID (MSAL) integration | H | 3 | Microsoft Authentication Library for React Native — significant setup |
| FE-6 | Profile screen (view your own profile) | M | 4 | Needs BE-4 and auth token to identify the user |
| FE-7 | Add location screen (name, category, map pin) | M | 4 | Needs BE-5 |
| FE-8 | Location detail page (info + reviews) | M | 4 | Needs BE-7 |
| FE-9 | Write review screen (rating + text) | M | 4 | Needs BE-6 |
| FE-10 | Map view screen (show locations on a map) | H | 4 | Azure Maps or react-native-maps — needs research first |
| FE-11 | Home feed screen (recent reviews from friends) | M | 5 | Needs BE-10 |
| FE-12 | Friend request screen | M | 5 | Needs BE-9 |
| FE-13 | Photo upload on review | H | 5 | Azure Blob Storage — extension feature |

---

## Integration / Cross-cutting

| # | Task | Difficulty | Week | Notes |
|---|---|---|---|---|
| INT-1 | Connect frontend to backend API (base URL config, fetch helpers) | M | 4 | Needed before any screen can talk to the backend |
| INT-2 | End-to-end test: create user → add location → write review | M | 4 | First vertical slice — proves the full stack works together |
| INT-3 | Send sprint plan to mentors (Dominic & Victor) | E | 3 | Action item from Meeting 2 (March 12) — share this doc or the timeline |
| INT-4 | Everyone: get project cloned and running locally | E | 3 | Backend needs DB credentials; frontend needs Node + Expo CLI |

---