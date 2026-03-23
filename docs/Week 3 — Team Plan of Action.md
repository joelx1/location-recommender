# Week 3 — What Everyone Needs to Do

**Goal for Thursday's meeting:** Have a working login and basic profile page to show — even just running on your own laptop is fine.

> Key advice from the mentors: don't try to build everything at once. Pick one small thing, get it fully working, then move to the next. That's what we're doing this week.

---

## Everyone — Do This

- [ ] Download the project from GitHub and make sure it opens and runs on your laptop
- [ ] Log into the Azure account (Microsoft's cloud platform) — just have a look around so you know what's there
- [ ] Write down every task you think you need to do in your area, then mark each one: Easy, Medium, or Hard — we need this for our planning session mid-week
- [ ] Have *something* to show on Thursday — a screenshot, a terminal output, anything that shows progress

---

## Backend

**Your job this week: Get a basic "create account" and "log in" working.**

- [x] Set up the project files and folder structure so it's ready to build on
- [x] Make it so anyone on the team can download and run the backend on their own laptop — write down any steps needed
- [x] Build the "create an account" feature — takes a username, email, and password, saves it
- [ ] Build the "log in" feature — checks if the username and password match
- [x] Build a way to look up a user's basic info (name, bio)
- [ ] Test it yourself by sending requests to it — you don't need an app screen for this, just test it directly

**By Thursday:** You should be able to create a fake account and pull back that user's info without needing a real app screen.

---

## Database

**Your job this week: Set up the tables where data will be stored, so the backend has somewhere to save things.**

- [x] Write out the structure for the main tables:
  - **Users** — stores name, email, password, bio, profile picture
  - **Locations** — stores place name, what type it is (bar, restaurant etc.), and where it is on the map
  - **Reviews** — stores who wrote it, which place it's about, the rating, and the text
  - **Friends** — stores who is friends with who, and whether the request was accepted
- [ ] Get this set up and running on your own laptop
- [x] Share it with the team through GitHub so backend can start building against it straight away
- [ ] Check that the map/location part (PostGIS — the bit that stores where places are) is working

**By Thursday:** The tables exist, are shared on GitHub, and the backend can connect to them.

---

## Frontend

**Hold off on building real screens this week as the backend isn't ready to connect to yet. If you build screens now you'll likely have to redo them.**

- [X] Get the app project set up and running on your phone or a phone simulator on your laptop
- [X] Agree on how the folders and files should be organised, and set that up
- [ ] Look into how maps work in React Native — what would we need to add a map to the app?
- [X] Sketch out (even on paper) the 3 main screens: Login, Profile page, Home Feed
- [ ] Write a short list of what information you'll need the backend to give you — so they know what to build

**By Thursday:** The app opens on a phone/simulator, the folder structure is sorted, and you've written up what you need from backend.

---

## Mid-Week — Planning Session (do this before Thursday, not the night before)

- [ ] Everyone brings their task list with Easy / Medium / Hard ratings
- [ ] As a group, go through them — figure out what needs to happen before something else can start
- [ ] Agree on who owns what going forward
- [ ] Someone sends a short plan to our Microsoft mentors (Dominic & Victor) — a few bullet points or a simple doc is fine

---

## What We're NOT Doing This Week

Leave these for later — touching them now will just create more work:

- Friends and friend requests
- The map screen
- Photo uploads
- Any real app screens (frontend — wait for backend to be ready first)

---

## Thursday — Quick Summary of What to Show

| Area | What to show |
|---|---|
| Backend | Create a user and look them up — tested directly, no app needed |
| Database | Tables set up, shared on GitHub, backend can connect |
| Frontend | App opens on a device, folders organised, list of what's needed from backend |
| Everyone | Task list with difficulty ratings, ready to discuss |
