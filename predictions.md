# predictions.md - OLA BUDDY

**Student:** Ong Jin . **Course:** MGMT6110 . **Problem Set 4**

**User Sentence:** A resident of the OLA condominium opens this screen to access the OLA BUDDY app, and knows it is working when he/ she is able to filter between the tabs, relying on its backend data to make daily decisions and to access the community. 

**Live Link:** https://mgmt-6110-problem-set-2-jin.vercel.app/

---
## Self Evaluation of OLA Buddy using the The 10 Heuristics
```
```
### 1. Visibility of System Status

**Issue Identified:** The OLA Buddy App offers many functions, which may make it overwhelming for users to identify and understand the app’s key benefit. This contrasts with other apps that are more basic and focused on a single screen or functionality. Additionally, the rule-based activity advice for residents under the “Weather and activities” tab should take the time of day into account. For instance, shopping centres should be excluded from the recommended list of activities when they are already closed. Otherwise, these recommendations may be misleading to users of the app.

**My rating:** 3 – Major Usability Problem. This mainly pertains to the second issue, where the rule-based activity advice may recommend that residents visit shopping malls even during midnight.

```
```
### 2. Match between the system and the real world

**Issue Identified:** For direction guides, users typically require two-way directions, both to and from a venue. Instead of always setting OLA as the starting point, the app could consider providing two-way mapping options for residents, allowing them to set both their starting and ending locations. Alternatively, the app could prompt users to indicate whether they are “returning to OLA” or “setting off from OLA”.

**My rating:** 2 – Minor Usability Problem. The map remains usable for its original intended purpose of mapping routes from OLA to other destinations.

```
```
### 3. User control and Freedom

**Issue Identified:** : After typing in a location they wish to travel to, users currently need to manually backspace using their keyboard to clear the entry. The app could provide a cross button as a shortcut for clearing the entire entry at once, giving users greater control and freedom to easily restart or change their search.

**My rating:** 2 – Minor Usability Problem. The map function remains usable for its intended purpose, and resolving this issue would only save users a couple of seconds.

```
```
### 4. Consistency and Standards 

**Issue Identified:** After closer scrutiny, the label “Bike/ Cycling” could be confusing or misunderstood. This is because there is no separate option for motorbikes as a mode of transport. As a result, some users may interpret “Bike/ Cycling” as referring to both motorbikes and bicycles, which could create the impression that both modes require the same travel time.

**My rating:** 2 – Minor Usability Problem. Motorcyclists should still be able to infer that they should follow the car/ taxi route rather than the bike/cycling route, although some confusion may still arise due to common transport conventions and terminology.
```
```
### 5. Error Prevention

**Issue Identified:** I tested the location search functionality in the system. In most cases, the search bar provides dropdown suggestions to help prevent users from entering invalid or incorrect locations. However, when a user enters a location that is too inaccurate for the system to generate a suggestion, the app displays a generic error message: “No data records were returned for this request from the official database.” This message may not clearly explain what went wrong or how the user should correct the error.

**My rating:** 2 – Minor Usability Problem. Users should still be able to infer that the location is unavailable for search on OneMap and troubleshoot the issue by retyping or correcting the venue.
```
```
### 6. Recognition Rather than Recall

**Issue Identified:** The location search bar allows users to manually type in the location they wish to visit. However, it does not provide an option for users to save or quickly access their “most searched” locations based on their individual accounts. Providing personalised frequently visited or previously searched locations would reduce the need for users to repeatedly recall and re-enter the same destinations.

**My rating:** 2 – Minor Usability Problem. Users can already see “most popular locations” pinned onto the search bar. However, this could be further improved by making the suggestions more personalised to each individual user.
```
```
### 7. Flexibility and Efficiency of use 

**Issue Identified:** Similar to the previous instance, the OLA Buddy app could allow greater personalisation for each user account by letting users save frequently visited locations such as their “work”, “home”, or “parents place”. This would allow returning users to access commonly used destinations more quickly, improving both convenience and overall efficiency of use.

**My rating:** 2 – Minor Usability Problem. The current location search function remains usable, but personalised saved locations could reduce repeated input and provide a smoother experience for returning users.
```
```
### 8. Aesthetic and Minimalist Design

**Issue Identified:** OLA Buddy contains a large amount of information and many functionalities, which may make the app feel overcrowded and increase complexity for users. In some instances, the interface also uses overly lengthy descriptions, such as “Browse lost and found, neighbour recommendations, upcoming events, buy/sell/giveaway, and resident coaching.” This level of detail may be unnecessary and can create visual clutter, making the interface less clean and concise.

**My rating:** 1. Cosmetic problem only
```
```
### 9. Help Users Recognize, Diagnose, and Recover from Errors

**Issue Identified:** For the directions search bar, when a user enters a location that is too inaccurate for the system to generate a suggestion, the app displays a generic error message: “No data records were returned for this request from the official database.” This message does not clearly explain the cause of the error or guide the user on how to resolve it. Instead, the app could provide a more actionable message such as “this location cannot be verified on OneMap, please try another name or an alternative venue instead”.

**My rating:** 12 – Minor Usability Problem. Users should still be able to infer that the location is unavailable for search on OneMap and troubleshoot the issue by retyping or correcting the venue.
```
```
### 10. Help and Documentation 

**Issue Identified:** For the OLA Buddy app, I have assumed that most functionalities are intuitive and easy to use. However, it may still be worthwhile to provide additional help or guidance for new users, particularly on how to navigate the forums, register their home bakery, and understand the backend APIs used by the app, including why these data sources can be trusted. Providing simple onboarding guidance or help documentation could make these features easier to understand and use.

**My rating:** 2 – Minor Usability Problem. Users may encounter some difficulty and may need to explore the app on their own before fully understanding how to use all of its functions.
