# **_Week 1 Research — Jack Duffin_**

We discussed that we’d do our own independent research and merge what we found together shortly before our second meeting on Thursday the 12<sup>th</sup> of March. This is my contribution to the team’s research on features. We also mentioned further research by also looking into Microsoft Azure features, but I didn’t have as much time to research/write up about them as I would have preferred.

# Section 1 - Features

Made a basic feature list, that’s split it into features we need (Essentials) and features that we can add in the event we still have time (Extensions). These extensions can vary in size and time, and we can tier them later to decide which ones we want to give a higher priority to adding to the project.

**Essential Features — The bare bones that we need to have a functional app that meets the project features**

**1\. User Authentication (User sign up / login)**

- Standard practice, each user should have an account associated with them
- I would suggest implementing this early, preferably first, and test the implementation of feature works without error.
- There are many libraries we can use to handle it; Passport.js, bcrypt, Auth0, to name a few possible options.

**2\. User Profile**

- Once we’ve established the user’s account we can let them create and modify their personal profile
- At a minimum we should have the account username, bio, profile photo, and posts/reviews, preferably friends/followers too. However, we can expand this to include other non-essentials such as achievements earned, if we add that extension.
- Implementation should be easy to create a small mock-up early into the project, we can even start with just basic text for reviews and implement photos later into development.
- In terms of similar apps outside of letterbox, we could base the design of the users’ profiles to be like those found on Instagram or Yelp.

**3\. Add a Location (Geotagging)**

- Crucial for our app, we need to be able to mark a location with its exact coordinates on the map
- Early in, we should decide if users manually add these coordinates, or if we will automatically track their location when they take a photo. We could allow for both options if we have the time. User experience would be better if we go automatic, but implementation would be more time consuming

**4\. Reviews**

- The app’s core purpose, ideally, we want to allow the user to save a string of text about the place, set a star rating of their choice, and attach a picture of the location.
- Early implementation we can skip the photos, but we should be able to store text and user score (their stars) of the location in a database that links users and locations

**5\. Map View**

- We should show locations as pins on a map, like Google Maps but with a heavier emphasis on places of interest to the user.
- To start we can use normal pins, but if time allows, we can expand this to pins being sized on popularity of the locations, or colour grading based on location category (e.g. red for bars, blue for restaurants, etc)
- Development should be worked on simultaneously with feature 3’s geotagging due to their similarity and reliance on one another.

**6\. User/Home Feed**

- The central hub of our app, this is where users will see reviews for places in their local area. We can start with general reviews that are a mix of friends and other users, then expand to add filtering to just friends or filter to see reviews on a specific category e.g. restaurants.
- Early implementations can be getting the most recent reviews stored in the database, then expanded to mix in reviews from friends/family. If time allows further expansion, we can then implement filters.

**7\. Social Network**

- Users should be able to send/accept friend/follow requests from other users
- Users should be able to go through each other’s profiles their posts and reviews.
- These connections will influence the user’s feed, so it is important we implement this feature with caution as it will impact the app’s data model.
- Possible extensions could include post tagging, location sharing, chat and grouping features. These could be further expanded to include the ability to set a location ping so that a user knows where to meet up.

**8\. Location Ranking / Score**

- Each location should be ranked or scored based on the reviews it receives from users. This user-based score should dictate its prevalence in users’ recommended feeds.
- These reviews are relevant to local business to improve their location and to promote healthy competition, we can take the Samuel scenario (2) into account where a bad review is considered by a business into how it can better itself.
- Early implementation should only take the overall average user score, however in future we should account for average review over time or a specific period, review bombing, etc.

**9\. Location Owner**

- The property owners should be able to have a separate account type dedicated to them and their location.
- Basic implementation, owners should be able to reply to the reviews received by users to their location. It is important that we ensure only owners can respond to reviews, to reduce congestion and to ensure transparency is provided to users. It is also important that owners can only respond to reviews for their location and not others.
- (Extension) They should be able to customise the locations page, e.g. opening and closing times, provide menus/any product descriptions.

**10\. Photo, Media & General Storage**

- Users should be able to upload their photos, and we need a place to reliably store this and all other relevant data for our app.
- Some possible solutions include Cloud storage (AWS S3 / Firebase Storage), CDN for fast loading, and Image compression.

**Extensions — only implement once we have Essentials (at a basic level at a minimum)**

Addressed sample features/extensions that were provided first, then added some of my own (19-24), only added a handful as it’s important to establish the app’s priorities.

**11\. Proximity Alerts/ Notifications**

- User receives a notification if near a location their friends have been to and rate highly
- Other notifications could include, a friend posts a review, a business owner replies to your review/complaint, someone liked your review (would require another like rating system)
- We would have to evaluate the parameters that cause the notification when to trigger, as poor parameters would result in the user getting flooded by notifications and ruining their experience with the app.
- We would also have to allow the user to turn off at their discretion as it will drain their battery and some users may have privacy concerns due to constant location tracking.

**12\. Event Capacity/Crowd Reporting**

- Allow users to see the live capacity of a location. Users can use this information to see if a popular restaurant is fully booked so that they can go and find an alternative.
- (Extension) Prompt the user with a location similar to the one they are viewing if the location they are viewing is at high capacity.

**13\. Verified Reviews / Moderation**

- Prevent fake user reviews and spam.
- Basic implementation: We would have a simple report button, that owners can see reports and can verify their validity. However, owners can abuse this power to remove any negative feedback, so further implementation should address this flaw.
- Automated system is for basic moderation, e.g. remove user posts containing hate speech or discrimination.
- Reviews can be verified with user receipts/ owner confirmations.

**14\. Location filtering**

- Allow users to sort their recommend feed by (restaurant-only, vegan-only, only visited by {friend}, friends only, etc)
- Plenty room for options we can give users

**15\. Owner Engagement**

- Discussed briefly in other sections, but we should allow owners of these areas to be more involved in the app.
- Allow owners to establish accounts to claim locations, update details, or run events.

**16\. In-App Achievements**

- Allow users to be rewarded for their app usage, these can be awarded for various reasons, from total friends counts, reviews submitted, milestones such as first review, or visiting a location outside of your country, etc
- These keep users engaged and interested in the app.

**17\. Accessibility Flags**

- Allow users to be more aware of the accessibility of the locations in the area.
- Users can filter for wheelchair accessibility, quiet seating, etc
- Provides a friendlier experience for users of all backgrounds.

**18\. Sentiment Analysis**

- Portray how a service or location’s opinion has changed over time.

**19\. Search and Discovery**

- Users should be able to easily search for specific locations or categories of locations
- Filters could include friend’s recommendations, specific dishes, ratings, etc

**20\. Smart recommendations**

- Users should get personalized recommendations based off their own previous history, trending locations, etc

**21\. Lists/Collections/Groups**

- Users set collections on the locations they visited
- Like Letterboxd lists

**22\. Check-ins/Friends Nearby**

- Users can check in when they arrive at a location. Users can share this to find friends that are nearby.

**23\. Event Discovery**

- Users can see upcoming events such as a artist performing at their local pub
- Users can save and share these events to their friends.

**24\. Bookmark Locations**

- Users can save their favourite locations or places they would like to visit in future

# Section 2 - Microsoft Azure

Short list of Azure services that could be useful to use for our app:

**1\. Azure Maps**

- Essential for our project, Microsoft’s version of Google Maps that we can use to display map, search location, etc. This would be most ideal for covering any geo related development in our project as it’s provided to us by Microsoft
- Some example features; maps for displaying locations, geolocation, distance calculations
- If we do a web implementation it has JavaScript SDK for web development

**2\. Azure App Service**

- Is a Platform-as-a-Service (PaaS) that enables us to build, deploy, and scale web applications, APIs, and mobile backends quickly.
- Easy GitHub deployment

**3\. Azure SQL Database**

- Relation database that’s familiar with the coursework we’ve done on SQL.
- Presuming we go relational for reviews, locations, users, friends, etc, they will all map cleanly to tables.
- Automatic backups will help reduce corrupt/missing data

**4\. Azure Active Directory B2C**

- User authentication allowing users to sign up, log in, use their Google/Microsoft login
- Secure authentication that handles password security

**5\. Azure Notification Hubs**

- Send notification to users and is compatible with Android, IOS and web notifications

**6\. Azure Cognitive Services (**

- Automatically detects harmful content (Content moderation)
- Flags offensive text / hate speech
- Has Text, Image and Video Moderation

# Section 3 - References

A list of some of the references I used:

**Authentication & User Identity (Libraries & Services)**

- Microsoft Docs. _Passport.js – Official documentation for Passport authentication middleware_. [https://www.passportjs.org/docs/](https://www.passportjs.org/docs/?utm_source=chatgpt.com) (includes strategies for different login flows)
- Auth0 Docs. _Auth0 official documentation and quickstart guides_. [https://auth0.com/docs/](https://auth0.com/docs/?utm_source=chatgpt.com) (covers identity management, login flows, SDKs)
- Auth0 Docs. _Auth0 overview – identity and authentication platform_. [https://auth0.com/docs/get-started/auth0-overview](https://auth0.com/docs/get-started/auth0-overview?utm_source=chatgpt.com) (concepts and use cases

**Maps, Geolocation & Location Features**

- Microsoft Azure. _Azure Maps Documentation_. [https://learn.microsoft.com/en-us/azure/azure-maps/](https://learn.microsoft.com/en-us/azure/azure-maps/?utm_source=chatgpt.com) (official docs for maps, geolocation, routing, and location APIs)
- Microsoft Azure. _Azure Maps product page_ — maps, APIs, and SDK info. [https://azure.microsoft.com/en-us/products/azure-maps](https://azure.microsoft.com/en-us/products/azure-maps?utm_source=chatgpt.com) (overview of capabilities).
- Microsoft Docs. _Azure Maps authentication methods_ — Shared Key, Microsoft Entra ID, SAS tokens for secure API access. [https://learn.microsoft.com/en-us/azure/azure-maps/azure-maps-authentication](https://learn.microsoft.com/en-us/azure/azure-maps/azure-maps-authentication?utm_source=chatgpt.com) (details for map authentication).

**App UX, Ratings, Reviews & Feedback Research**

- Olsson, J., _et al._ (2022). _What factors affect UX in mobile apps?_ Systematic mapping study analyzing app reviews and factors affecting user experience. Journal of Systems and Software[. https://doi.org/10.1016/j.jss.2022.111462](.%20https://doi.org/10.1016/j.jss.2022.111462)
- _Listening to Users’ Voice: Automatic Summarization of Helpful App Reviews_ — framework for ranking and summarizing user feedback to help with release planning. arXiv preprint. [https://arxiv.org/abs/2210.06235](https://arxiv.org/abs/2210.06235?utm_source=chatgpt.com)
- _Finding the Needle in a Haystack: On the Automatic Identification of Accessibility User Reviews_ — research highlighting the importance of analyzing user reviews for accessibility issues. arXiv preprint. [https://arxiv.org/abs/2210.09947](https://arxiv.org/abs/2210.09947?utm_source=chatgpt.com)

**UX Principles & Feature Design (High‑Level Guidance)**

- Jafton. _The importance of user experience (UX) in mobile app success._ [https://www.jafton.com/insights/the-importance-of-user-experience-in-mobile-app-success](https://www.jafton.com/insights/the-importance-of-user-experience-in-mobile-app-success?utm_source=chatgpt.com) (discusses key UX priorities like simplicity, feedback, onboarding)
- Medium — _Complete PassportJS Guide_ (practical overview of how Passport.js integrates into a Node.js/Express app; useful context for your auth recommendations). https://medium.com/@sylneyshii/complete-passportjs-guide-f8576f3994e2 (tutorial overview)