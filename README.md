# Description
Develop an application that is similar to Letterboxd, but for physical locations such as bars, restaurants and social locations.

Users create a profile and can immediately start reviewing locations, such as writing about their experience, upload photos, send their friends places they should visit if they’re around a certain area.

There is a large emphasis on using geo-data to classify location (restaurant, club, bar etc.) and track the user’s physical location to see if they are beside a location that is highly recommended by their friends.

---

# Scenarios

## Scenario 1
Kate spends a weekend in Galway, enjoys a seaside restaurant, and shares her experience on the app. A month later, her friend visits Galway, notices Kate’s post about the same restaurant, tries it herself, and records her own experience.

## Scenario 2
Samuel goes to a club and complains that the spot was too crowded and poorly organized. He writes about his experience. The club organizers take note, and plan accordingly for their next event.

## Scenario 3
James doesn’t know what to get at a restaurant as there are a lot of good options to choose from. He checks the app, and notices that his sister highly recommends a dish. He trusts his sister’s judgement and enjoys the selection.

---

# Technical Objectives

- Figure out how to store data reliably such as users’ photos and textual recommendations.
- Utilize geo-data to figure out where the person is at a certain time and recommend locations. Think about whether the user wants recommendations in the first place, i.e. if they are at work, they are most likely not looking for a restaurant to go to.
- Think about how to model and design social networks for groups of friends.

---

# Possible Features & Extensions

- Proximity alerts if a user is near a highly-rated location their friends have been to.
- Event capacity and crowd reporting.
- Verified reviews and moderation tools to mitigate abuse and fake posts.
- Location filtering (restaurant-only, vegan-only, only visited by {friend}.)
- Engagement from owners.
- In-app achievements and micro-badges (First Dish, Crowd Reporter).
- Accessibility flags for wheelchair users, quiet seating etc.
- Sentiment analysis to show how opinions about a location or service have changed over time.
