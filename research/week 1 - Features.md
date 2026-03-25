# Week 1 Research — Jack James

---

## Section 1 — Features


tried to put together a proper feature list. Split it into stuff we definitely need (MVP) and stuff that would be cool if we have time.

since we have weekly thursday calls. we're basically doing Scrum. 1 week sprints, thursday = sprint review. Makes sense to use that structure going forward rather than trying to plan everything upfront (waterfall won't work here, (Requirements might change mid-project).

---

### MVP Features — stuff we need to actually have an app

**1. User Auth (sign up / login)**

- obvious one, nothing works without this
- lots of libraries handle it (Firebase Auth, Supabase, JWT etc)
- main decisions: what do we collect at sign up, how do we handle sessions
- do this first i think, everything else depends on it
- complexity: medium but low risk

**2. User Profile**

- name, bio, maybe a profile pic eventually
- also where you'd see someone's review history
- needed for the social side — when you see a review you want to know who left it
- complexity: easy, mostly just read/write to a users table

**3. Add a Location (geo-tagged)**

- core of the whole app, need to be able to add bars, restaurants etc with coordinates
- the geo part is where it gets interesting, need to pull lat/long somehow (either user pins it on a map or we use an API to look it up from an address)
- do users add locations manually or do we pull from an existing source like Azure Maps / OpenStreetMap? pulling from existing is better long term but adds complexity
- complexity: medium — form is easy, geo stuff needs research

**4. Map View**

- show locations as pins on a map
- kind of essential given how geo-heavy this project is supposed to be
- Azure Maps has useful features, not too bad to set up
- ties directly with feature 3, should be worked on together
- complexity: medium

**5. Write + Read Reviews**

- literally what the app does
- text input + star rating → store in DB → show on location page
- needs to be linked to both a user AND a location in the DB
- photos can wait
- complexity: medium

**6. Friend Connections**

- send/accept friend requests
- without this the social layer doesn't exist
- data model needs a friendships table — need to think about this carefully during design week
-  bit complex (get all reviews from people I'm friends with) but manageable
- complexity: medium-hard, 

**7. Friend Feed (home screen)**

- what you see when you open the app — recent reviews from friends
- basically just: get reviews where user_id is in my friends list, order by date
- depends on friend connections being done first
- complexity: medium once social layer is in

**8. Location Ranking / Score**

- locations should have a score that goes up and down, not just a static average
- relevant to the Samuel scenario (bad review → venue takes note)
- simple average? weighted by recency? upvote/downvote model?
- can layer this on top once reviews are working
- complexity: medium

---

### Extensions — only if MVP is solid

**9. Photo Uploads**

- big UX improvement, a photo of a dish beats a paragraph of text
- needs blob/object storage (Azure Blob Storage)
- file size limits, formats etc need handling
- complexity: medium-hard

**10. Proximity Alerts**

- walk past somewhere a friend loved → get a notification
- high impact feature, probably the most "wow" thing in the brief
- but: needs background location (battery drain, privacy), push notifications, geofencing logic
- definitely not MVP, but worth keeping in mind so we don't make it impossible later
- complexity: hard

**11. Owner Responses**

- venue owners can reply to reviews (Samuel scenario)
- needs a separate "owner" account type and a way to link them to a location
- complexity: medium

**12. Location Filtering**

- filter by category, dietary stuff, "only places (friend) has been"
- mostly a UI thing on top of existing queries, as long as we tag data correctly from the start
- complexity: medium

**13. Verified Reviews / Moderation**

- prevents fake reviews and spam
- could start really simple (just a report button) and not go full moderation tooling
- counter in reports column, checked manually, more reports = needs to be checked throughly
- complexity: simple version is easy,

**14. Sentiment Analysis**

- show how opinions on a place change over time (graph of average score trending down etc)
- busy times and peak hours
- actually a cool feature but needs decent amount of historical data to be meaningful
- Azure AI Services has a text analytics API if we want to do proper sentiment rather than just score averages
- complexity: medium-hard, extension only

---

### Priority table

|Feature|MVP / Extension|Complexity|
|---|---|---|
|User auth|MVP|Medium|
|User profile|MVP|Low|
|Add location (geo)|MVP|Medium|
|Map view|MVP|Medium|
|Write/read reviews|MVP|Medium|
|Friend connections|MVP|Medium-Hard|
|Friend feed|MVP|Medium|
|Location ranking|MVP|Medium|
|Photo uploads|Extension|Medium-Hard|
|Proximity alerts|Extension|Hard|
|Owner responses|Extension|Medium|
|Location filtering|Extension|Medium|
|Moderation|Extension|Hard|
|Sentiment analysis|Extension|Medium-Hard|

---

## Section 2 — Azure stuff

We've got Azure credit so we should actually use it. here's what I found that's relevant to us.

---

**Azure Maps**

- microsoft's version of google maps basically
- geocoding (address → coordinates), POI search, map rendering, routing
- has a javascript SDK for web
- relevant to us: displaying the map, searching for locations, eventually proximity stuff
- since we're on azure credit this is the obvious pick over google maps (which gets expensive)

**Azure Blob Storage**

- object storage, basically just a place to dump files
- relevant to us: profile pictures, review photos
- pattern is simple: upload file → get URL back → store URL in DB next to the review
- very straightforward to integrate, well documented

**Azure SQL Database**

- managed relational database (SQL Server / compatible with postgres syntax roughly)
- relevant to us: if we go relational like users, reviews, locations, friendships all map cleanly to tables
- familiar as we've done SQL coursework
- probably the safer/simpler default for a project this size

**Azure Cosmos DB**

- noSQL document database (like MongoDB)
- relevant to us: reviews nested in locations, social graph stuff  could be more natural in a document model
- Dominic said to wait on the DB decision for mentor input, and this is probably why — it's more powerful but more complex
- worth asking about in week 2

**Azure App Service**

- hosts our backend API (node, python, java etc)
- handles deployment, scaling, HTTPS — we don't need to manage a VM ourselves
- relevant to us: wherever our API lives, this is the easy way to host it

**Azure Static Web Apps**

- free hosting for static frontends (React etc)
- has built-in github actions integration so it auto-deploys when we push

**Azure Notification Hubs**

- push notifications to mobile devices
- relevant to us: proximity alerts extension — if a user walks past somewhere their friend reviewed
- extension only, but worth knowing it exists so we don't build ourselves into a corner

**Azure AI Services**

- pre-built AI APIs — sentiment analysis, text analytics, image stuff etc
- relevant to us: sentiment analysis extension, or the bio generation idea someone floated in the meeting
