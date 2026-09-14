# assessment.md - OLA BUDDY

**Student:** Ong Jin . **Course:** MGMT6110 . **Problem Set 2**

**User Sentence:** A resident of the OLA condominium opens this screen to access the OLA BUDDY app, and knows it is working when he/ she is able to filter between the tabs, relying on its backend data to make daily decisions and to access the community. 

**Live Link:** https://mgmt-6110-problem-set-2-jin.vercel.app/

---
## Front End Criteria
```
```
### Front End Criteria 1. A resident who enters the link can understand the purpose of OLA BUDDY almost immediately

**Why it matters:** OLA Buddy is meant to help OLA residents access useful information about transport from OLA, local weather conditions, activity recommendations, and the resident community hub. A first-time visitor should be able to understand these main functions without needing instructions.

**How to test it:** A first-time user should be able to identify the app’s main purpose and describe its key functions within 30 seconds of opening the app and viewing the available tabs.

**Assessment:** Met

**Evidence:** I asked external users to explore the app without prior explanation. They were able to describe its main functions, including transport, weather, activity recommendations, and the community section, within about 20–30 seconds.
```
```
### Front End Criteria 2. A resident can complete OLA Buddy’s core tasks without instructions

**Why it matters:** The core jobs of OLA Buddy are to help residents get directions from OLA, check live bus arrivals, view current weather and air-quality information, and use the OLA Hub. These tasks should be intuitive enough that a first-time user does not need a tutorial.

**How to test it:** 
Without receiving any instructions:
-	A first-time user can open “Directions From OLA”, enter a destination, select a result, and obtain route information.
-	A first-time user can access live bus arrival timings from the transport section.
-	A first-time user can navigate to the Weather & Activities screen and view the weather, air quality, and recommended activities.
-	A first-time user can access the OLA Hub, create a new post under an appropriate category, and view resident home-business listings such as bakeries.

**Assessment:** Met.

**Evidence:** I asked friends and family who had not used the app before to try these tasks without guidance. They were able to complete the main functions independently and did not require me to explain how to navigate or use the features.
```
```
### Front End Criteria 3. The screen remains usable on phone and laptop. 

**Why it matters:** Residents may use OLA Buddy while leaving home, travelling, or sitting at home on a laptop. The product should therefore remain functional and readable across both mobile and desktop screen sizes.


**How to test it:** Open the deployed app on both a typical mobile-width screen and a laptop-width screen. The main navigation, destination search, maps, live transport information, weather information, and primary controls should remain readable and usable without horizontal scrolling, overlapping elements, or inaccessible buttons.

**Assessment:** Part Met. 

**Evidence:** The app remains functional and readable on both mobile and laptop, and the main controls are still accessible on a smaller screen. However, the mobile layout requires more vertical scrolling and does not present as much useful information at a glance as the desktop version, so the mobile experience could still be optimised further.
```
```
### Front End Criteria 4. Every live claim is supported by real data and its source is visible to the user

**Why it matters:** Residents may make decisions based on bus arrivals, weather, PSI, and route information. If these claims are unsupported or their sources are unclear, users may lose trust in the product or be misled.

**How to test it:** Compare the live values shown in the app against the corresponding upstream data sources. Bus timings, weather, air quality, route times, and disruption information should be supported by live data. The screen should also clearly identify the source of this information near the relevant live data or in a visible attribution area.

**Assessment:** Met. 

**Evidence:** I asked external users to identify the source of the directions, bus arrival, weather, and air-quality information. They were able to do so without guidance because the relevant data sources were clearly stated near the live information displayed in the app.
```
```
### Front End Criteria 5. Users have an obvious way to correct some of the most obvious mistakes they might make (e.g. keying in the wrong address)

**Why it matters:**  A resident may search for the wrong destination, choose the wrong stop, or select the wrong route. They should be able to correct the mistake without refreshing or restarting the app.

**How to test it:** After selecting an incorrect destination, route, or stop, the user can change or clear the selection and try again from the same screen without restarting the application.

**Assessment:** Part Met. 

**Evidence:** Users can correct an incorrect destination by editing or deleting the current text and entering a new one. However, the app does not provide a dedicated clear or “X” button, so correcting an entry takes more effort than it should.
```
```
### Front End Criteria 6. Important live information is visible without unnecessary navigation

**Why it matters:** OLA residents may open the app shortly before leaving home, so important information such as route details, bus arrivals, weather, and air quality should be quick to access without requiring multiple navigation steps.


**How to test it:** Starting from the main screen, check how many interactions are required to reach key live information such as directions, bus arrivals, weather, and air quality. The most important information should be accessible within one or two clear interactions.

**Assessment:** Met.

**Evidence:** Most important information, such as the main directory and directions features, bus arrival timings, weather conditions, and air-quality information are reachable within 1-2 interactions once the users are familiarised with the interface.
```
```
---
## Back End Criteria
```
```
### Back End Criteria 1. User is able to obtain live information they require quickly from the back-end API.

**Why it matters:** Users may rely on the app to generate directions or check real-time bus arrivals so they can make near-term travel decisions.


**How to test it:** A user should be able to obtain the required output, such as live bus arrivals at a nearby stop or directions to Sengkang MRT, within 20 seconds of making the request.

**Assessment:** Part Met

**Evidence:** During testing, live bus arrival information and route results were returned within 60 seconds under normal usage conditions, allowing users to access time-sensitive information without noticeable delay. This is acceptable,  but on hindsight, I should have set the cache to 20 seconds especially for more real-time updates for bus arrivals. 
```
```
### Back End Criteria 2. Empty data is handled as a valid state to the consumer

**Why it matters:** “No current bus arrival” is different from “the service failed.” Residents need to know which situation they are in.

**How to test it:** Trigger or find a successful API response containing no relevant result. The app should show an empty-data message rather than an error, blank area, or fake fallback value.

**Assessment:** Part Met.

**Evidence:** When bus-arrival data is unavailable after midnight, the app displays: “No data records were returned for this request from the official database.” This correctly distinguishes an empty response from a service failure, but it could be more useful by explaining that bus services may have ended for the night rather than leaving the user uncertain about why no data was returned.
```
```
### Back End Criteria 3. Invalid user input is rejected safely

**Why it matters:** An invalid destination or malformed request should not cause the backend to crash, return misleading data, or send a meaningless request upstream.

**How to test it:** Enter an invalid destination such as “Lousy Venue” into the destination search. The system should return no matching result, remain stable, and avoid producing route data for an invalid location.

**Assessment:** Met.

**Evidence:** When “Lousy Venue” was entered, the search returned “No data records were returned for this request from the official database.” Pressing the search button did not trigger an error, crash the application, or produce any false route information.
```
```
### Back End Criteria 4. One failed service does not bring down unrelated features

**Why it matters:** OLA Buddy depends on several external APIs. If one service fails, residents should still be able to use unrelated features that depend on other services.

**How to test it:** Make one upstream service unavailable and check that unrelated sections of the app still load and function normally.

**Assessment:** Met	

**Evidence:** During testing, the weather service temporarily failed because the upstream API rate limit was exceeded from the same IP address. Despite this, the transport, routing, and other live-data features continued to work normally, showing that a failure in one integration did not bring down unrelated parts of the app.
```
```
### Back End Criteria 5. Credentials are unreachable from the page and repository

**Why it matters:** LTA and OneMap credentials must remain private even though the deployed app is public.

**How to test it:** Search the GitHub repository, inspect browser source, and inspect browser network responses. No credential, password, token, or part of one should be visible.

**Assessment:** Met

**Evidence:** I checked the GitHub repository and found no LTA or OneMap credentials, passwords, or access tokens exposed. The required secrets are stored only as Vercel environment variables, while the browser communicates with my own `/api/` serverless functions.
```
```
---
### Assess the collaboration, not the tool
```
```
## Q1. Where did the agent make you faster, and by how much?
The agent made me significantly faster in the production stage of the project, especially in writing the code for the application, creating the serverless API functions, and connecting those APIs to the features I wanted in OLA Buddy. The overall design-build-test-fix-deploy cycle was heavily accelerated because I could describe the intended behaviour and then have the agent generate the implementation quickly. Even if I were already an experienced coder, I estimate that building the same minimum viable product manually would have taken me at least a few days. With the agent, I was able to reach a working version within a much shorter period of time. The main task it accelerated was production work rather than product judgement: I still had to decide what the app should do, which data sources to trust, what users should see, and whether the output was good enough to keep.
```
```
## Q2. Where did it cost you time, and whose fault was that?
The biggest cost of time came when the **agent produced something plausible but not actually useful**. For example, I asked for routing functionality, but it generated a route-network style map instead of clear directional instructions. This was partly due to the agent’s interpretation and partly because my prompt was not specific enough.

I also lost time when I **hit token or usage limits** and had to pause before continuing. That was not a product-design issue, but it interrupted the build-test-fix cycle and delayed troubleshooting. A further cost came from **debugging the generated product**. Several elements such as buttons, filters, search functions and images initially behaved incorrectly or inconsistently, so I had to spend time identifying and correcting those issues. Some of this was due to the agent producing an incomplete implementation, but some was also caused by me asking for too many features in a single prompt. In hindsight, I would have worked in smaller increments and tested each feature before adding the next one.
```
```
## Q3. Did it ever hand you something that looked right and was not?
Yes. The agent often produced interfaces that looked polished at first but were not always useful in practice. For example, it initially showed nearby MRT/LRT stations as simple buttons, but they did not provide enough detail or meaningful interaction. I had to refine the feature so users could click in and get more useful information. It also tended to overinclude names, addresses and labels, which looked complete but sometimes made the interface cluttered. This taught me to judge features by usefulness, not appearance alone.
```
```
## Q4. What did you have to know in order to supervise it?
I had to understand how a resident would actually use the app to catch features that looked polished but were not genuinely useful. For example, I knew that simply showing four nearby MRT/LRT station names was not enough; a resident needs to be able to click into them and access useful information before those buttons add real value.
I also drew on my experience reviewing digital banking interfaces to judge whether the app was intuitive, clear and functional from a user’s perspective. On the technical side, I had to understand which APIs were available, what data each one could provide, and their limitations, so that I could tell whether the agent was extracting the right information and making full use of the available data.
```
```
## Q5. Which decisions did you keep, and should you have kept more or fewer?
I kept the main product decisions: what OLA Buddy should do, who it was for, which APIs to trust, what information should appear on each screen, how long data should be cached, and how the app should behave when data was loading, empty, refused or unreachable. I also decided not to add further API features, such as carpark information after a user selects a destination, because I felt this would overcomplicate the product.
In hindsight, I should have kept even tighter control over some user-facing decisions. For example, I initially accepted some agent-generated empty-state and error messages before considering whether they were appropriate for residents. At the same time, I could have used the agent more for ideation and feature exploration, rather than relying mainly on my own experience and assumptions about what residents would find useful.
```
```
## Q6. Now scale it up: what does this mean for a team of thirty?
If thirty people were working with AI agents on a product the organisation depended on, I would require a formal human review before any major feature is deployed. Given the manpower available, I would not allow an agent to independently decide things such as user-facing failure messages, rule-based recommendations, or other product decisions that affect trust and usability. I would split the work across teams, then require cross-team reviews so that each team checks another team’s output. Each team should include at least one strong coder who can inspect the implementation beyond the prompts, together with people who understand the business and user needs. Testing would also be critical, including positive and negative test cases, failure scenarios and volume testing before release. The key lesson for me is that, at scale, the biggest risk is not obviously bad code, but many small agent-made decisions being accepted without anyone realising they were decisions at all.
```
```
