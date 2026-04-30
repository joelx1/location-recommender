---
title: Placemark Microsoft Live Demo (8 min)
tags:
  - college
  - microsoft
  - cs335
  - presentation
  - live-demo
date: 2026-04-27
---

# Placemark Microsoft Live Demo (8 min)

> Live demo for the Microsoft mentor session. Different from the 8-min video presentation. This one is performed live in front of Dominic & Victor.

---

## Cast

| Role                              | Person                                               |
| --------------------------------- | ---------------------------------------------------- |
| presenter                         | Jack James                                           |
| presenter (auth, backend)         | Felix Azriel Elmido                                  |
| Phone / screen operator           | Joye Zhang (silent; drives the device on stage cues) |
| On standby for backend questions  | Jack Duffin, Joel VG                                 |
| On standby for frontend questions | Hamed, Joye                                          |

Joye watches Jack and Felix and reacts to **cue words** in their script (in **bold caps**) by changing the screen shown. The audience sees a phone screen-mirrored to the projector throughout.

---

## Time budget (8 min = 480 s)

| Block                                                      | Lead                            | Time |
| ---------------------------------------------------------- | ------------------------------- | ---- |
| 1. Cover slide + team                                      | Jack                            | 20 s |
| 2. The problem (slide)                                     | Jack                            | 30 s |
| 3. Architecture slide                                      | Felix                           | 50 s |
| 4. Live: sign in with Microsoft                            | Felix narrates, Joye drives     | 40 s |
| 5. Live: home map + friend activity                        | Felix narrates, Joye drives     | 40 s |
| 6. Live: search + place details                            | Jack narrates, Joye drives      | 40 s |
| 7. Live: write a review with a photo                       | Jack narrates, Joye drives      | 50 s |
| 8. Live: review appears in social feed (second test phone) | Felix narrates                  | 40 s |
| 9. **Standout: proximity notification**                    | Jack narrates, Felix on backend | 90 s |
| 10. Closing slide + team + thanks                          | Jack                            | 20 s |
| Buffer for mentor reactions                                |                                 | 60 s |

Total: 480 s with a 60 s buffer baked in. If the demo runs clean we leave time for one short question; if it stalls the buffer absorbs it.

---

## Stage setup

- Phone A (Joye holds, mirrored to projector). Logged out at start.
- Phone B (on the lectern, already logged in as a *different* test user "Alice"). Used for slide 8 to show the friend feed updating.
- Backend running live on Azure App Service (no laptop in the loop). Joel keeps a local backend warm on his laptop as a last-resort fallback in case App Service throws a 5xx mid-demo.
- Slides on laptop (cover + problem + architecture + closing only; the rest is live phone).
- Pre-seeded test data in Azure DB: 5 locations near the venue, 3 test accounts ("Alice", "Bob", "Sam") with reviews already written. Sam follows our demo user; Alice does not.

---

## Cue words (Joye's playbook)

When Joye hears one of these phrases from Jack or Felix, she performs the matching action on Phone A. Cue words are short, recognisable, and end every sentence so there is no ambiguity about timing.

| Cue word in script | Joye's action |
|---|---|
| "**SIGN IN**" | Tap Sign in with Microsoft |
| "**AUTHENTICATE**" | Continue through the Microsoft login screen |
| "**LANDED**" | Wait for the home map to load |
| "**FRIENDS NEARBY**" | Tap the friend-activity layer toggle |
| "**SEARCH**" | Tap the Search tab |
| "**TYPE COFFEE**" | Type "coffee" into the search box |
| "**OPEN PLACE**" | Tap the first result |
| "**ADD REVIEW**" | Tap the Add Review button on the place page |
| "**STARS**" | Tap 5 stars |
| "**TYPE BODY**" | Paste the prepared review text from the keyboard shortcut |
| "**PHOTO**" | Tap the camera icon and pick the prepared photo from the gallery |
| "**SUBMIT**" | Tap Submit |
| "**SOCIAL TAB**" | Switch to Phone B and tap the Social tab |
| "**PROXIMITY**" | Tap the Simulate proximity check button |
| "**NOTIFICATION**" | Hold the phone steady so the push notification banner is visible |

Joye should have the cue list printed on a small card. If a cue is missed, Jack repeats the phrase exactly.

---

## Script

### 1. Cover slide + team (Jack, 20 s)

> "We are Placemark, a CS335 group project mentored by Microsoft. The team is Jack James, Jack Duffin, Joel VG, Felix Azriel Elmido, Joye Zhang and Hamed. I'm Jack, on the database side; Felix will speak on auth; Joye is driving the phone today, and the rest of the team is on standby for questions."

---

### 2. The problem (slide) (Jack, 30 s)

> "The pitch in one sentence: when you pick a place to go, you don't read Yelp, you ask a friend. Placemark surfaces what your specific friends have rated highly, near you, in categories you yourself like. The standout feature, which we'll get to at the end, is a push notification when those three things line up in the real world."

---

### 3. Architecture slide (Felix, 50 s)

> "Three layers. A React Native app on the phone, a Spring Boot API in the middle, and Azure underneath. Authentication is Microsoft Entra External ID; the phone runs a PKCE OAuth flow, gets a JWT, and attaches that token to every backend call. The Spring Boot backend validates it on every request, so there is no password column in the database. Geo lives in PostgreSQL with PostGIS, photos in Azure Blob. Now let's actually see it."

*(Joye now holds Phone A up; Jack switches the projector input from his laptop to the phone mirror.)*

---

### 4. Live: sign in with Microsoft (Felix narrates, 40 s)

> "Phone is logged out. We tap **SIGN IN**, which kicks off the PKCE flow against our Entra tenant. We **AUTHENTICATE** with the Microsoft login. The token comes back, we store it in `expo-secure-store`, and we've **LANDED** on the home screen. Behind the scenes the app just hit our `auth/me` endpoint, which read the token's `azure_oid` claim, didn't find this user yet, and provisioned them automatically. Sign-up and sign-in are the same flow."

---

### 5. Live: home map + friend activity (Felix narrates, 40 s)

> "This screen is a map view. Pins are coming from `GET /locations/nearby`, which is a PostGIS `ST_DWithin` query within a 5km radius of our GPS position. If we toggle **FRIENDS NEARBY**, the map highlights pins that have been reviewed by people we follow. Right now we follow Sam, so Sam's reviews are the ones that light up. Alice's don't, because we don't follow Alice."

---

### 6. Live: search + place details (Jack narrates, 40 s)

> "Quick detour through search. We tap **SEARCH** and **TYPE COFFEE**. The backend runs a case-insensitive search across name and category. We **OPEN PLACE**, and the place page shows the average rating, the Bayesian-adjusted score, the number of reviews, and the friend reviews pinned at the top. The Bayesian score is what stops a brand new place with one 5-star review from outranking somewhere with a hundred genuine reviews."

---

### 7. Live: write a review with a photo (Jack narrates, 50 s)

> "Let's add a review. **ADD REVIEW**. We tap **STARS**, **TYPE BODY**, attach a **PHOTO**. The photo uploads to Azure Blob Storage; the backend stores the public URL on the review row. We **SUBMIT**. Notice the unique constraint on user-plus-location at the database level, so a user can edit their review but not write a second one. That's enforced in PostgreSQL, not in app code."

---

### 8. Live: feed update on a second phone (felix narrates, 40 s)

> "To prove the feed works against the live database and not just our own cache, here is a second phone, signed in as Sam, who follows our demo user. We tap the **SOCIAL TAB**. The review I just wrote on the first phone appears at the top of Sam's feed. Same Azure database, same backend, two devices, real-time enough for our purposes."

---

### 9. Standout: proximity notification (Jack narrates, Felix on backend, 90 s)

> "Final piece, this is the feature we're most proud of.
>
> The idea is simple: walk past a place a friend has rated 4 stars or higher, in a category you yourself rate 4 or higher, and the app tells you. Once per location per hour, no spam.
>
> All four conditions are evaluated in one SQL query: a PostGIS `ST_DWithin` for the 250-metre radius, a friend join on the friendships table covering both directions, a rating filter, a category subquery built live from the user's own review history, and a `NOT EXISTS` against a `notification_log` table for the cooldown. No stored preference table; the taste filter updates the moment you write a new review.
>
> For the demo, we trigger the check with a button instead of waiting on the GPS, but the SQL and the push are real. **PROXIMITY**.
>
> *(Felix, while we wait the half-second:)* The query just ran on Azure PostgreSQL, the backend matched a result, and Expo's push service is delivering the message.
>
> **NOTIFICATION**. There it is. We faked the pedometer, not the feature."

---

### 10. Closing (Jack, 20 s)

*(Switch projector back to slides for the closer.)*

> "Built by Jack James, Jack Duffin, Joel VG, Felix Azriel Elmido, Joye Zhang and Hamed. Mentored by Dominic and Victor at Microsoft. The repo, the report and the slides are linked on the cover. Happy to take questions."

---

## Failure modes and recovery

| If this breaks | Do this |
|---|---|
| Sign-in fails (Entra redirect URI / network) | Felix says: "we'll skip the live login and continue from a session we already have." Joye opens Phone B, which is already signed in. Continue from slide 5. |
| App Service unreachable (5xx, cold start) | Joel flips the phones' API base URL to his local laptop backend (already running, same DB) via the dev-build env switcher; Felix fills the 15-second gap by walking the architecture diagram in more depth. |
| Venue Wi-Fi drops | Joel tethers the phones to his personal hotspot; App Service URL is unchanged. |
| Push notification doesn't appear | Jack continues talking, Joye taps Simulate again. If still nothing, Jack pivots: "the database query did execute, here's the row in the `notification_log` table." |
| Wrong review text submitted | Ignore it; the demo is about the flow, not the prose. |
| Phone freezes | Felix says "let me show you the same flow on the second phone" and Joye hands him Phone B. |
| Mentor interrupts mid-flow | Pause, answer briefly, resume from the next cue word. Buffer absorbs it. |

---

## Pre-demo checklist (morning of)

- [ ] Both phones charged to 100% and on Do Not Disturb except for the test app
- [ ] Both phones have the dev build installed and signed in (Phone B) / signed out (Phone A)
- [ ] App Service backend warm and reachable; hit `/health` from Postman 30 min before to dodge cold-start latency
- [ ] Local laptop backend running as fallback, pointed at the same Azure DB
- [ ] Joel's hotspot ready in case venue Wi-Fi drops
- [ ] Azure DB seeded with venue locations, three test users, friend relationships
- [ ] "Simulate proximity check" button visible on the dev build
- [ ] Pre-prepared review text and photo loaded on Phone A
- [ ] Joye has the cue card printed
- [ ] Jack and Felix have done one full dry run earlier in the day
- [ ] Slides exported as PDF as a backup; can be presented from a phone if laptop fails
