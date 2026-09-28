# prompts.md - OLA BUDDY - Condominium App (have updated to include prompts for Problem Set 5)

**Student: Ong Jin** . **Course: MGMT6110** . **Problem Set 2**

**User Sentence:** 

**Live Link:** https://mgmt-6110-problem-set-2-jin.vercel.app/

---

## Prompt 1 - the master prompt
```
ROLE: You are a senior full-stack developer working in this existing Vite + React project.

GOAL: Create an app called OLA Buddy with a curated logo. This will provide OLA Executive Condominium residents (S544651 ) 2 screens:

SCREEN 1 — Directions From OLA
Create a modern and mobile-friendly transport and directions screen.

Main feature:
Provide a destination search box that allows residents to search for locations anywhere in Singapore.
The starting point should always be OLA Executive Condominium.
Use the OneMap Search API to resolve the user's destination into coordinates.
Use the OneMap Routing API to calculate directions from OLA Executive Condominium to the selected destination.
Where appropriate, allow the user to view public transport, walking, driving or cycling routes.
Display the resulting route clearly on a map together with useful information such as estimated travel time and distance.
Nearby public transport section:
Below the directions section, show a map of the nearby MRT, LRT and bus stops around OLA Executive Condominium, extending approximately as far as Sengkang MRT.
Use real upstream data rather than hard-coded transport information.
Show nearby bus stops and the services available from each stop.
When a bus stop is selected, show live arrival timings for the available bus services.
Where available, show useful live information such as estimated arrival time and bus occupancy/load.
Allow the user to select a bus service and view the sequence of bus stops served by that route.
Show transport delays or disruptions only if they are explicitly supported by the upstream data. Do not infer or fabricate delays.

Use:
OneMap Search API for destination search.
OneMap Routing API for route calculation.
LTA DataMall Bus Stops data for bus-stop locations.
LTA DataMall Bus Arrival API for live bus arrival information.
LTA DataMall Bus Routes data for the sequence of stops along each bus service.
All live upstream requests must go through my own serverless functions under api/.
Do not call these upstream APIs directly from browser-side React code.

SCREEN 2 — Weather & Things To Do
Create a weather and activity recommendation screen focused on Sengkang and the area around OLA Executive Condominium.
Weather section:
Display the current official two-hour weather forecast for the appropriate Singapore forecast area containing OLA Executive Condominium.
Display live temperature if available from the relevant official weather-station API.
Clearly state the forecast area and the source/update time where available.
Do not hard-code weather values.

Activity recommendations:
Based on the current weather conditions, recommend suitable categories of activities.

Examples:
Good weather: outdoor activities such as tennis, walking, cycling or visiting parks.
Rainy weather: indoor activities such as gym workouts, shopping malls, museums or indoor attractions.
For each recommendation category, suggest relevant nearby places for consideration where reliable location data is available.
The recommendation logic may be rule-based using the live weather result. For example:
Rain / thunderstorms → prioritise indoor activities.
Fair / partly cloudy → include outdoor activities.
Very warm conditions → favour shaded or indoor activities.
Do not use AI-generated claims about live conditions.
Recommendations must be based on the live weather data returned by the official API.
Use Singapore Government weather APIs through my own serverless functions under api/.

My screen should not show hard-coded transport, routing, weather, temperature, or activity-condition values. Static information such as the app name, OLA Executive Condominium name/postal code, labels, headings and resident name may remain hard-coded.

All other live information must come from:
LTA DataMall
OneMap
Singapore Government weather APIs on data.gov.sg

Every upstream API call must be made through my own serverless functions under api/.
Never call LTA DataMall, authenticated OneMap APIs, or data.gov.sg directly from browser-side React code.
Serverless API functions of my own:
api/onemap-search.js Calls: https://www.onemap.gov.sg/api/common/elastic/search

Purpose:
Accept a destination search term from the screen. Use OneMap Search API to resolve it into matching Singapore locations.
Return only the fields the screen needs, such as:
place/building name
address
postal code
latitude
longitude
Do not return the entire upstream response.
OneMap Search requires authentication.
Use server-side OneMap credentials stored only in Vercel environment variables:
ONEMAP_API_EMAIL
ONEMAP_API_PASSWORD
Use these credentials to obtain a OneMap access token from:
https://www.onemap.gov.sg/api/auth/post/getToken
Do not expose the email, password or access token to the browser.
The OneMap token expires, so handle token generation/reuse server-side rather than hard-coding a token into the project.

api/bus.js—accepts a BusStopCode query parameter, calls https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival and returns a simplified list: for each service, the ServiceNo and the minutes until each of the next two buses, worked out from the EstimatedArrival timestamps.
Use: LTA_ACCOUNT_KEY only on the server.

api/weather.js Calls: https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast
This endpoint does not require a credential for this project.
Purpose: Find the official forecast area containing OLA Executive Condominium. Read the forecast from: data.items[0].forecasts matching the correct area.

api/temperature.js Calls: https://api-open.data.gov.sg/v2/real-time/api/air-temperature
This endpoint does not require a credential for this project. Purpose to retrieve the latest available air-temperature readings.
api/health.js—reports whether the credential is configured (keyConfigured) and whether the upstream answered, including the HTTP status it returned. It must never print the credential or any part of it. It must report the health of each external integration separately.
whether required credentials are configured whether the upstream service answered the HTTP status returned by the upstream whether the service is healthy
It must NEVER return, print or log:
LTA_ ACCOUNT_KEY
ONEMAP_API_EMAIL
ONEMAP_API_PASSWORD
OneMap access tokens any substring or transformed representation of those credentials
On the screen, replace the hard-coded value with the live one, and decide what the user sees in each of these four cases: the data is loading, the data is empty, the upstream refused, and the upstream is unreachable. I want four different sentences, not one spinner.

OUTPUT: Both functions at api/ in the PROJECT ROOT, siblings of package.json, never inside src/. If this project has a server entry file, register the same two routes there too, because that is the shape the preview can answer. If it has no server file, skip
that and tell me so rather than inventing one. Make sure package.json contains "type": "module". BEFORE the fetch, if the credential is missing or empty, return 503 with a message naming the variable, and do not call the upstream at all. A missing variable is sent as the word "undefined" and looks exactly like a wrong credential, so stop it early. AFTER the fetch, check response.ok before reading the body. A refusal often has an
empty body, so calling .json() on it throws and my function dies with a 500 instead of telling me what happened. On a non-2xx reply, return the upstream status and a
one-line reason in your own JSON. Cache the response for 60 seconds with Cache-Control: s-maxage=60, stale-while-revalidate=120, matching how often the source actually changes.
In the footer, credit the source in the exact form the provider's licence asks for.

GUARDRAILS: Never write the credential into any file, comment or README. Never create a variable whose name starts with VITE_. Never call the upstream from browser code; every call happens inside api/. Never print the credential, or any part of it, in a response or a log. No new npm packages. No database, no login. Leave every screen I already have working exactly as it is.

CONTEXT: Deployed on Vercel from GitHub. The credential lives only in a Vercel environment variable named LTA_ACCOUNT_KEY, ONEMAP_API_EMAIL, ONEMAP_API_PASSWORD.
```
**What came back:** Edited 23 files. First version of app was created with 2 screens as specified. 

**What i changed next and why:** I started testing the app functionality to see if it works and if there were further changes required.  

---
## Prompt 2 - Immediate Visual Fixes
```
This prompt is to improve the visual quality of the app:
- remove the "anchorvale S544651" and the address from the top bar to streamline the app.
- make the filter between the two screens more sophisticated
- Make the map clearer to read such that the words dont overlap each other.
- For the Neighorhood transit map, dont need to include the words below on "Cheng Lim LRT and Sengkang MRT corridor"
- or the rule based activities, any way to make the recommendations more fun looking with some visuals like cute logos or pictures?
Change nothing else that i did not ask you to.
```
**What came back:** 6 files touched. The fix was deployed

**What i changed next and why:** Continued to test the app for more items that needed to be fixed.

---
## Prompt 3 - Visual Fixes
```
Some prompts for visual fixes:
- Remove "Fixed Resident Starting Point" from the directions header.
- Fix the OLABuddy logo at the bottom of the App as "OLA" is missing.
- Make sure the images appearing in the activity advice are working. It is currently not functioning for punggol waterway point.
Change nothing else.
```
**What came back:** 4 files touched. The fixes were deployed successfully.

**What i changed next and why:** I proceeded to push code to github and then to vercel, as i wanted to ensure that the code works with the backend APIs once i added environment variables in vercel. 

---
## Prompt 4 - Directions guide error
```
The directions search bar is not functioning. It should allow the user to search for a location, and instead of showing a route geometry, should show detailed directions of how to get to the location by public transport, car, bike and walking. For the Popular from OLA areas, standardise it to a single location that works with OneMap (e.g. Sengkang MRT, Jewel Changi Airport), without mentioning any brackets after the location name. Change nothing else.
```
**What came back:** 4 files touched. Routing functionality deployed correctly now.

**What i changed next and why:** Nothing. Moved on to further enhance my app.

---
## Prompt 5 - Search bar fix
```
Please run a check to make sure that the "search" button on where would you like to go from OLA is working. Change nothing else.

```
**What came back:** No Change. There was no error to begin with.

**What i changed next and why:** Nothing. Moved on to further enhance my app.

---
## Prompt 6 - visual changes
```
Remove the cheng lim LRT (SW1) box on the OLA Executive Condomium app. Change nothing else.

```
**What came back:** Two files touched.

**What i changed next and why:** Nothing. Moved on to further enhance my app as there are no noticeable issues related to an empty state.

---
## Prompt 7 - searchbar fixes
```
After typing and hitting the search button for the location or after selecting a location via the dropdown list (e.g. Sengkang MRT), the drop down list should not still hover for the user. Please fix this. Change nothing else.

```
**What came back:** 1 files touched. Updated correctly.

**What i changed next and why:** Nothing. Moved on to further enhance my app.

---
## Prompt 8 - Enhancements to MRT/LRT details for usefulness
```
For the 4 nearest LRT and MRT stations, when user hovers or clicks onto the button, could you display the LRT and MRT route details for the user? Change nothing else.

```
**What came back:** 3 files touched.

**What i changed next and why:** Went to test the new functionality and was pleased with the initial result, but wanted to finetune further.

---
## Prompt 9 - further finetune from prompt 8
```
Can you change the writing from "Click/ Hover Route" to "Click to pin Route Details". Change nothing else.

```
**What came back:** 1 files touched. Edited such that the wordings have changed. 

**What i changed next and why:** Nothing. Moved on to further enhance my app.

---
## Prompt 10 - Enhancement to screen 2
```
Can you add a small “Air Quality & Haze” section to Screen 2. For a consumer, the most useful things are:
24-hour PSI and its category (whether conditions are Good / Moderate / Unhealthy / Very Unhealthy / Hazardous)
a simple “Should I exercise outdoors?” recommendation
Note: keep it the same format as the official 2-hour forecast/ live air temperature boxes.
Change nothing else.

```
**What came back:** 3 files touched. New section added - pleased with the addition as it helps users monitor air quality.

**What i changed next and why:** Nothing. Moved on to further enhance my app.

---
## Prompt 11 - search bar issues
```
When i click into the search bar for directions, it automatically populates singapore management university (admin building). Please remove this. Change nothing else.

```
**What came back:** 1 files touched. Fix deployed and works well now.

**What i changed next and why:** Nothing. Moved on to further enhance my app.

---
## Prompt 12 - Adding screen 3 for more features of OLA BUDDY
```
Add a new screen 3 with the same look and feel.
This screen is called "OLA Hub"
This is where the condo residents have a light forum/ community feed that they can use to post for lost and found, recommendations, events, buy/sell/giveaway, and to advertise their expertise (e.g. tennis coaching).
There is a separate section below that provides a space for home cafes/ bakeries owned by residents: each offering will include:
For the home cafés/bakeries section, each post could include:
business name
what they sell
photos
price range
pickup/delivery details
operating days
contact method
“Resident-run” badge
The app should also show a user interface of a resident that has already logged into his account with initials OJ. This is because only residents should be able to use the forum and have access to this community.
Change nothing else.

```
**What came back:** 11 files touched. New screen was created based on my prompt. 

**What i changed next and why:** Went to test the results to see if it was satisfactory and to enhance further. 

---
## Prompt 13 - Name censorship
```
Remove all mentions of "Ong Jin" from OLA Hub and change it to Jack Ong. Remove unit numbers from the app's top bar as well and only show resident name. Change nothing else.

```
**What came back:** 1 file touched. successfully deployed

**What i changed next and why:** Nothing. Moved on to further test my app.

---
## Prompt 14 - Changing dimensions of buttons to fit to app screen
```
Change the filters between screens to make them fit within an iphone 15 pro max, it currently exceeds the horizontal width. Change nothing else.

```
**What came back:** 1 file touched. The filters work fine now in the app version.

**What i changed next and why:** Nothing. Moved on to further enhance my app.

---
## Prompt 15 - User experience enhancement while changing tabs.
```
Make sure that when you filter between the 3 screens, the user view will always start from the top of the page again. Change nothing else.

```
**What came back:** 1 file touched. Filtering experience fixed.

**What i changed next and why:** Nothing. Moved on to push code to github after i accepted the current state of the build.

---

# Problem Set 4 Prompts

---
## Prompt 1 - Fixing the directional routing 
```
ROLE: You are a sceptical senior developer and usability reviewer working in my existing project. Before you write any code, your job is to argue against the repair I propose.
CONTEXT:
Live address: https://mgmt-6110-problem-set-2-jin.vercel.app/
Who the product is for, and what it does for them: A condo app for residents to use for transport, weather and activity recommendations, with a residents hub forum and listing of home bakeries.
The finding, in its six lines:
Where: They were exploring the search function under "Where would you like to go from OLA. After typing in a search destination, they realised that the directions are available from the backend API, but this routing directions listed were vague and not direct, providing entries such as "alight at the nearest stop" instead of providing definitive direction support with the actual name of stops to alight and where to head to.
Which heuristic: Match Between the System and the Real World.
Screen or system: Screen, because the route response already carries each leg with its stop and station names.
Severity, and why — 3, driven by whether it damages the product's credibility, since a visitor who spots vague directions stop trusting the entire product.
The evidence behind it: 2/3 groupmates raised this.
The repair I propose: Every step that the directory proposes should only mention the real location it happens at, read off the backend API with no hallucination, and provide all required names to guide users to the actual destination with no gaps and vague comments.
GOAL: Argue against my repair.
Does it solve the problem the finding describes, or a problem I already believed I had? Say which, and why.
Does the problem belong to the screen or to the system, and does my repair sit in the right half?
Name one heuristic this repair could break while it serves the one above, and how.
Propose the smallest alternative that would make the same thing true.
Tell me exactly what to do on the live address to check that the repair worked.
OUTPUT: Your arguments first, as a numbered list. Then stop. Write no code until I reply with the repair I have chosen.
GUARDRAILS: Do not tell me the repair is good. If you have no strong reason to doubt it, say so plainly instead of inventing one. When I do ask you to build, change only what the repair needs. Do not remove Disqus or the privacy notice, and do not break /api/health.

```
**What came back:** 
Does it solve the problem the finding describes, or a problem you already believed you had?
It solves the problem the finding describes at its core, but your wording overreaches into an idealized "zero-interpolation / full-completeness" problem that conflicts with how OneMap's payload is actually structured.
What the finding actually caught: In src/components/DirectionsScreen.tsx (lines 334–390), the app fetches /api/onemap-route and saves the payload into routeResult, and then never passes routeResult into <DetailedDirections /> (lines 633–637). Instead, DetailedDirections.tsx calls generateDetailedDirections(destination) in src/utils/directionsHelper.ts, which falls into a hardcoded else block (lines 206–245) for any non-preset destination and prints the exact offending string: "Alight at the nearest station and walk to [Destination]".
Where your proposed repair overreaches: Demanding that "every step… should only mention the real location it happens at, read off the backend API with no hallucination, and provide all required names… with no gaps" assumes OneMap's API returns human-ready names for every leg endpoint. In reality, on your live /api/onemap-route?destLat=1.304&destLng=103.8318&routeType=pt endpoint, OneMap returns from.name: "Origin" on the first WALK leg, to.name: "Destination" on the final WALK leg, and streetName: "Pathway" inside steps. If you strictly print only what comes off the backend API with zero client-side substitution, you replace "Alight at the nearest station" with "Walk from Origin to OPP BLK 313 CP" and "Walk from ORCHARD MRT STATION to Destination".
Does the problem belong to the screen or to the system, and does your repair sit in the right half?
The problem is 85% screen and 15% system, and a purely screen-side repair will fail at certain hours of the day unless you also touch one line in the system half:
Why it is mostly Screen: /api/onemap-route already returns the full OpenTripPlanner plan.itineraries[0].legs array for pt (containing mode, routeShortName, routeLongName, from.name, from.stopCode, to.name, to.stopCode, duration, distance, and intermediateStops) and route_instructions / route_summary for drive, cycle, and walk. The screen (DirectionsScreen.tsx → DetailedDirections.tsx) simply drops routeResult on the floor.
Why part of it is System (which your screen-only diagnosis misses): Look at api/onemap-route.js lines 94–97:
const now = new Date(); followed by now.getHours(). Vercel serverless functions execute in UTC, not Singapore Time (Asia/Singapore, UTC+8). When a user in Singapore tests your app between 8:00 AM and 1:30 PM SGT, api/onemap-route.js queries OneMap Transit for 00:00 to 05:30 AM, when Singapore MRT/LRT trains are closed for maintenance. During those hours, OneMap either returns no transit itinerary or routes residents onto night walks/buses.
Mode mismatch at the Screen/System boundary: DirectionsScreen.tsx only calls /api/onemap-route for the single active travelMode, whereas DetailedDirections.tsx simultaneously renders time/distance badges on all 4 mode tabs (pt, drive, cycle, walk) and an optional 4-mode comparison grid.
Name one heuristic this repair could break while it serves Match Between the System and the Real World, and how.
Heuristic broken: Aesthetic and Minimalist Design (Nielsen #8).
How: While a pt itinerary has a manageable 4 to 7 legs, OneMap's drive, cycle, and walk responses return raw turn-by-turn route_instructions arrays containing 25 to 45 micro-maneuvers for a single trip (e.g., "Head East On Anchorvale Road (55m)", "Turn Right To Stay On Anchorvale Road (136m)", "Turn Left To Stay On Anchorvale Road (221m)"), and pt legs include up to 15 intermediateStops plus raw agency codes ("FERRY:67379", "SBST BUS 372"). Rendering every intermediate name and raw turn instruction "with no gaps" floods the card with dozens of repetitive rows, pushing the Neighborhood Transit Map and Live Bus Arrivals far below the fold.
Propose the smallest alternative that would make the same thing true.
Fix the timezone in api/onemap-route.js: Format date and time in Asia/Singapore timezone (defaulting late-night 00:00–05:45 SGT queries to 08:00:00 SGT so MRT/LRT transit legs always return).
Pass routeResult, routeState, and routeUpstreamStatus from DirectionsScreen.tsx into DetailedDirections.tsx.
Parse routeResult.routeData for the active mode in DetailedDirections.tsx / directionsHelper.ts:
For pt (routeData.plan.itineraries[0]): Map each leg in legs into a step showing the actual transit service (routeShortName / routeLongName), exact boarding stop name and code (from.name + from.stopCode, substituting "OLA Executive Condominium" only when from.name === "Origin"), exact alighting stop name and code (to.name + to.stopCode, substituting destination.name when to.name === "Destination"), stop count (intermediateStops.length), and real itinerary duration, distance, and fare.
For drive, cycle, and walk (routeData.route_instructions & routeData.route_summary): Use route_summary.total_time and total_distance for the header, and map route_instructions into named street steps (consolidating consecutive micro-segments on the same road if needed so the list stays scannable).
Show DataStateNotice while routeState is 'loading', 'refused', or 'unreachable' so slow or failed API responses are stated honestly rather than silently masked by the static template.
Tell me exactly what to do on the live address to check that the repair worked.
Open https://mgmt-6110-problem-set-2-jin.vercel.app/ in Chrome and open DevTools → Network (filter by onemap-route).
In the "Where would you like to go from OLA?" search box, type a destination that is not one of the hardcoded Sengkang/Jewel presets—for example, click the ION Orchard tag or type VivoCity and select the first dropdown result.
Wait for /api/onemap-route?destLat=...&destLng=...&routeType=pt to return 200 OK and inspect its JSON preview under routeData.plan.itineraries[0].legs.
Compare the UI's Step-by-Step Directions card against that network payload:
Verify that every step displays the exact boarding stop name/code (e.g., OPP BLK 313 CP (67379) or CHENG LIM LRT STATION (SW1)), bus/train line (Bus 372, North East Line (NE), North South Line (NS)), and exact alighting station name/code (SENGKANG STN EXIT C (67689), DHOBY GHAUT MRT STATION (NE6), ORCHARD MRT STATION (NS22)) from legs[].
Verify that the phrase "Alight at the nearest station and walk to…" no longer appears anywhere on the page.
Verify that the total duration (min), distance (km), and fare ($2.07) on the active card match itineraries[0].duration, summed leg distances, and itineraries[0].fare.
Click the Car / Taxi, Bike / Cycling, and Walking tabs one by one; confirm each triggers /api/onemap-route?...&routeType=drive|cycle|walk and updates the steps to show the actual road names from route_instructions (starting from ANCHORVALE ROAD and ending at the destination road) rather than generic placeholders.

**What i changed next and why:** Created a new prompt based on feedback from Google AI Studio.

---
## Prompt 2 - Fixing the directional routing 
```
Keep the same structure to ensure that the readability and user experience is good, but make sure every step generated by the directory should only mention the real location it happens at, reading off the backend API data. Provide important required names to guide users to the actual destination with no gaps and vague comments (such as alight at the nearest station). Change nothing else.
```
**What came back:** 4 files edited. The fix was deployed keeping existing UI but making the directional guide more relevant and direct.

**What i changed next and why:** Nothing. Moved on to other fixes.

---
## Prompt 3 - Fixing the search engine (wrong entry after correct entry issue)  
```
ROLE: You are a sceptical senior developer and usability reviewer working in my existing project. Before you write any code, your job is to argue against the repair I propose.
CONTEXT:
 Live address: https://mgmt-6110-problem-set-2-jin.vercel.app/
 Who the product is for, and what it does for them: A condo app for residents to use for transport, weather and activity recommendations, with a residents hub forum and listing of home bakeries.
The finding, in its six lines:
 Where: They were exploring the search function under "Where would you like to go from OLA. After typing in a search destination such as compass one, a result came back. After a successful search, they canceled the entry and proceeded to type a “rubbish entry” which led to an error. However, the previous search result for compass one  remained, which gave a false sense that the search might be working. 
Which heuristic: Help users recognise, diagnose and recover from errors.
 Screen or system:  Screen, the search response already distinguishes a successful match from a zero-result search, so the page has enough information to clear the previous result and show a no-result state without requiring new backend data.
 Severity, and why — 3 - driven by impact. A resident could believe the visible directions belong to the new search when they actually belong to the previous destination.
The evidence behind it: 3/3 groupmates raised this.
The repair I propose: When a search returns no matching destination, the previous destination and travel-time results should no longer remain as if they were current, and the page should clearly show that no match was found.
GOAL: Argue against my repair.
 Does it solve the problem the finding describes, or a problem I already believed I had? Say which, and why.
 Does the problem belong to the screen or to the system, and does my repair sit in the right half?
 Name one heuristic this repair could break while it serves the one above, and how.
 Propose the smallest alternative that would make the same thing true.
 Tell me exactly what to do on the live address to check that the repair worked.
OUTPUT: Your arguments first, as a numbered list. Then stop. Write no code until I reply with the repair I have chosen.
GUARDRAILS: Do not tell me the repair is good. If you have no strong reason to doubt it, say so plainly instead of inventing one. When I do ask you to build, change only what the repair needs. Do not remove Disqus or the privacy notice, and do not break /api/health.

```
**What came back:** 
Your repair does address the problem the finding describes, rather than a separate problem you already believed you had. The reported failure is specifically that an unsuccessful new search leaves the previous successful result visible, creating ambiguity about which destination the directions belong to. Clearing or replacing that stale result when the new search fails directly targets that failure. I do not have a strong reason to doubt the repair on scope.

This belongs primarily to the screen, and your repair is in the correct half. According to the finding, the search response already distinguishes success from a zero-result response. That means the system apparently knows the new search failed; the UI is simply continuing to display stale success-state content. The screen should react to the failed result by removing or invalidating the old destination and travel-time information. You would only need a system-side change if the backend could not reliably tell the difference between “no match” and other failure states.

The repair could create a Heuristic 1 — Visibility of System Status problem if you clear the old result too aggressively. Suppose the user presses Search and the existing directions disappear immediately while the new request is still loading. For several seconds they may see an empty panel without knowing whether the app is loading, broken, or has already determined there is no result. Do not make “clear stale result” synonymous with “blank the interface with no status.” The sequence needs to distinguish loading from no match.

The smallest alternative is not to redesign the search flow; just invalidate the stale result when the new search definitively fails. Keep the current successful-search behaviour unchanged. When the response is confirmed as zero-result, hide the previous destination/travel-time result and replace that area with a clear message such as “No matching destination found. Try another place name or spelling.” There is no need to add a new page, modal, backend endpoint, or broader search redesign.

Check it on the live address with this exact sequence: Open the live OLA Buddy site and go to the Directions/search area. Search for a valid destination such as “Compass One” and confirm that its destination and travel-time/directions results appear. Then replace the search text with an obviously invalid string, for example “asdfghjkl999xyz”, and submit it. Wait until the search request has finished. The repair passes only if the Compass One result is no longer presented as the current result, the page clearly states that no match was found, and there is no moment after the failed request completes where the stale Compass One directions still appear to belong to the invalid query. Finally, search for “Compass One” again to confirm normal successful searches still work.

**What i changed next and why:** Revised the prompt to make the fix.

---
## Prompt 4 - Fixing the search engine (wrong entry after correct entry issue)  
```
Fix only the stale-search-result issue in the Directions search.
Current problem: If a user first searches for a valid destination such as “Compass One”, the destination, route and travel-time results appear correctly. If the user then enters an invalid/rubbish destination and the new search returns no match, the previous successful result remains visible. This can make the user think the old directions belong to the new search.
Required fix:
- When a new search finishes with no matching destination, clear or hide the previous destination, route, and travel-time result.
- Show a clear no-result message instead, such as: “No matching destination found. Please try another place name or spelling.”
- Do not clear the existing result merely because a new search has started; preserve an appropriate loading state while the request is in progress.
- Successful searches must continue working exactly as they do now.
Guardrails:
- Make the smallest possible change needed for this issue only.
- Treat this as a frontend/screen-state fix unless the existing API genuinely cannot distinguish a successful result from a no-result response.
- Do not redesign the search flow or change unrelated UI, styling, navigation, APIs, data sources, or business logic.
- Do not modify or remove Disqus.
- Do not modify or remove the privacy notice.
- Do not break /api/health.
- Preserve all existing working functionality.

```
**What came back:** 1 file touched. The stale-search-result issue in the Directions search has been resolved with a minimal frontend state update:

**What i changed next and why:** Nothing. 

---
## Prompt 5 - Fixing contradiction in weather and air quality -> safe to exercise recommendations
```
ROLE: You are a sceptical senior developer and usability reviewer working in my existing project. Before you write any code, your job is to argue against the repair I propose.
CONTEXT:
Live address: https://mgmt-6110-problem-set-2-jin.vercel.app/
Who the product is for, and what it does for them: A condo app for residents to use for transport, weather and activity recommendations, with a residents hub forum and listing of home bakeries.
The finding, in its six lines:
Where: They were exploring the weather and activities function under and noticed contradictions between weather tab and air level tab towards rule based recommendations. While the live forecast read “Light Rain,” the exercise card said “Yes, Safe to Exercise Outdoors – jogging can proceed,” while the card directly below said “Rainy Weather: Prioritising Indoor & Sheltered Activities.” The same screen therefore gave two opposite recommendations for the same weather condition.
Which heuristic: Consistency and Standards.
Screen or system:  both pieces of advice are already based on the same weather condition displayed on the page, so the visible recommendations can be made consistent without requiring new data.
Severity, and why — 3 - driven by trust impact. Contradictory advice on the same screen makes it difficult to know which recommendation to follow and reduces confidence in the advisory feature.
The evidence behind it: 1/3 groupmates raised this.
The repair I propose: The rule based recommendation should take into account both weather conditions and air quality. If the weather if bad, but air quality is good, maybe mention as so under the “should I exercise outdoors tab” Not safe to exercise outdoors. With a short explanation that despite good air quality, rain will make it hard for outdoor workouts. 


```
**What came back:** 
Your repair directly addresses the contradiction in the finding, but the wording you propose is slightly too strong. The actual problem is that one card says outdoor exercise is safe while another says rainy weather means indoor or sheltered activities should be prioritised. Making both recommendations consider the same weather and air-quality inputs would remove that contradiction. However, saying “Not safe to exercise outdoors” just because it is raining may overstate what the available evidence supports. Rain may make outdoor exercise less suitable without necessarily making it unsafe.

The problem is only partly a screen issue if you change the decision rule itself. If both cards already receive the same weather and air-quality data but apply different frontend conditions, then this can be fixed at the screen/UI logic level. But if the app currently has separate recommendation logic for weather and air quality, combining them into one coherent recommendation is effectively a rule/system-logic change. The repair should therefore stay limited to reconciling the existing recommendation logic rather than introducing new data or a broader recommendation engine.

This repair could create a Heuristic 2 — Match Between the System and the Real World problem if the language becomes too absolute. A user may reasonably understand light rain as inconvenient rather than inherently unsafe. If the app says “Not safe to exercise outdoors” whenever rain appears, the recommendation may no longer match real-world expectations. A more defensible message would separate the two dimensions: “Outdoor exercise not recommended due to rain. Air quality is currently suitable for outdoor activity.”

The smallest alternative is to introduce one clear precedence rule using the data you already have. If weather conditions are unsuitable for outdoor exercise, the exercise card should not recommend jogging even when air quality is good. Instead, it should acknowledge both conditions, for example: “Air quality is good, but current rain makes indoor or sheltered exercise preferable.” The activity card below should then make a consistent indoor/sheltered recommendation. No broader redesign is needed.

To test the repair on the live address: Open the Weather/Activities tab and identify the displayed weather condition and air-quality status. When the weather condition is rainy and air quality is good, check that the “Should I exercise outdoors?” card no longer says outdoor exercise can proceed while the activity recommendation says to stay indoors. Both cards should now be logically consistent, while still explaining that air quality itself is acceptable. Refresh the page once and confirm the same inputs still produce compatible recommendations. If the live weather is not rainy when you test, you cannot fully reproduce this exact finding from the production site at that moment, so the rainy-condition case should also be tested through whatever local/mock condition your existing project already supports.

**What i changed next and why:** Changed the prompt

---
---
## Prompt 6 - Fixing contradiction in weather and air quality -> safe to exercise recommendations
```
Fix the inconsistency between the weather and the outdoor-exercise recommendation in the Weather/Activities section.
Current problem:
When the live weather shows a condition such as “Light Rain”, the app can simultaneously display:
“Yes, Safe to Exercise Outdoors”
“Rainy Weather: Prioritising Indoor & Sheltered Activities”
These two recommendations contradict each other even though they are based on the same current conditions.
Required fix:
Make the “Should I exercise outdoors?” recommendation consider both the current weather condition and the air-quality status.
If air quality is good but the weather is rainy or otherwise unsuitable for outdoor exercise, do not recommend proceeding with an outdoor workout.
Clearly explain both factors instead of using an overly absolute safety statement.
For example, the message could say: “Air quality is good, but current rain makes indoor or sheltered exercise preferable.”
Ensure the activity recommendation below gives advice that is logically consistent with the exercise recommendation.
Guardrails:
Make the smallest possible change needed to resolve this contradiction.
Reuse the weather and air-quality data the app already has; do not add new APIs or data sources.
Do not redesign the Weather/Activities page.
Do not change unrelated recommendation logic.
Do not change transport, forum, bakery/café, or other unrelated functionality.
Preserve the existing styling unless a tiny text/state change is required.
Do not remove or modify Disqus.
Do not remove or modify the privacy notice.
Do not break /api/health.
Preserve all existing working functionality.
```
**What came back:** 1 file touched. Filtering experience fixed.

**What i changed next and why:** The contradiction between the outdoor-exercise recommendation and the weather-based activity advice has been resolved in WeatherScreen.tsx

---
---
## Prompt 7 - Bus Arrival Timestamp improvements
```
ROLE: You are a sceptical senior developer and usability reviewer working in my existing project. Before you write any code, your job is to argue against the repair I propose.
CONTEXT:
 Live address: https://mgmt-6110-problem-set-2-jin.vercel.app/
 Who the product is for, and what it does for them: A condo app for residents to use for transport, weather and activity recommendations, with a residents hub forum and listing of home bakeries.
The finding, in its six lines:
  Arrival times carry no time taken and never refresh
 1 · Where — Same address, the LIVE ARRIVAL TIMINGS panel for bus stop 67429, Cheng Lim Stn Exit B.
 2 · What you did, what you saw — I read "Next Bus 5 min" beside a "Live 60s Cache" badge at about 10.50 pm, left the tab open and came back ten minutes later to the same 5 min, with no time taken shown, no refresh control, and only one request made all along.
 3 · Which heuristic — 1, Visibility of System Status.
 4 · Screen or system — Screen, because each arrival arrives with a full clock time (11.01 pm for the next 110) that the panel discards.
 5 · Severity, and why — 3, driven by whether it damages the product's standing out of proportion, since the badge says "Live" while the number ages and a resident who misses that bus will not believe the panel again.
 6 · The repair — The panel shows the clock time each bus is due and when the reading was taken, refreshes itself while the page is open, and says "Live" only while it is.The evidence behind it: 1/3 groupmates raised this.
The repair I propose: Update the bus arrival timings to show timestamp of data as of time. Also provide a modern looking refresh button for the user to click refresh to retrieve fresh data for bus arrivals and update the timestamp. 
GOAL: Argue against my repair.
 Does it solve the problem the finding describes, or a problem I already believed I had? Say which, and why.
 Does the problem belong to the screen or to the system, and does my repair sit in the right half?
 Name one heuristic this repair could break while it serves the one above, and how.
 Propose the smallest alternative that would make the same thing true.
 Tell me exactly what to do on the live address to check that the repair worked.
OUTPUT: Your arguments first, as a numbered list. Then stop. Write no code until I reply with the repair I have chosen.
GUARDRAILS: Do not tell me the repair is good. If you have no strong reason to doubt it, say so plainly instead of inventing one. When I do ask you to build, change only what the repair needs. Do not remove Disqus or the privacy notice, and do not break /api/health.

```
**What came back:**
Your repair only partially solves the finding. Adding a timestamp and a manual refresh button addresses the “how fresh is this data?” problem, but it does not fully address the fact that the panel claims to be “Live” while the data can remain stale for ten minutes. The original finding explicitly says the panel should refresh itself while open and only say “Live” while it is actually live. A manual refresh leaves the burden on the user and does not fully make that finding false.

The problem is not purely screen-side if you want the data to auto-refresh. Showing the full arrival time and a “last updated” timestamp is a screen change because the API already returns that information. But automatically fetching fresh data every 60 seconds is behaviour involving repeated requests and therefore sits partly in the system/data-fetching logic. Your proposed manual refresh button stays mostly on the screen side, but that is also why it falls short of the original repair.

A manual refresh button could create a Heuristic 7 — Flexibility and Efficiency of Use problem if it becomes necessary for normal use. For time-sensitive bus arrivals, users should not have to remember to press Refresh repeatedly just to keep the information current. A refresh button is useful as a secondary control, but relying on it as the main freshness mechanism makes routine use less efficient.

The smallest alternative is to keep the current panel, add a visible “Last updated at HH:MM:SS” timestamp, show the actual clock arrival time where available, and automatically re-fetch the bus timings on the same 60-second cadence implied by the existing “Live 60s Cache” label. You can still include a small manual refresh button as an extra control, but it should not replace automatic refresh. If automatic refresh fails or stops, the interface should no longer imply that the data is live.

To test it on the live site: Open the LIVE ARRIVAL TIMINGS panel for bus stop 67429, Cheng Lim Stn Exit B. Note the displayed next-bus timing, the full expected arrival time, and the “Last updated” time. Leave the tab open for at least 2–3 minutes without clicking anything. The timestamp should advance and the arrival timing should update automatically when fresh data is fetched. Then click the manual refresh button, if you keep one, and confirm the timestamp updates again and a fresh request is made. Finally, leave the tab open long enough to verify that the panel does not continue showing an unchanged old value while still presenting itself as “Live.”

**What i changed next and why:** Changed the prompt based on feedback.

---
---
## Prompt 8 - Bus Arrival Timestamp improvements
```
Fix only the bus arrival freshness / live-status issue in the LIVE ARRIVAL TIMINGS panel.
Current problem:
- The panel can show something like “Next Bus 5 min” beside a “Live 60s Cache” badge.
- If the page is left open, the displayed arrival timing can remain unchanged for several minutes.
- The user cannot tell when the data was last fetched.
- The API already provides the actual clock arrival time, but the panel mainly shows the relative countdown.
Required fix:
- Show a clear “Last updated at HH:MM:SS” timestamp for the bus arrival data.
- Show the actual expected clock arrival time for each bus where that data is already available, while keeping the relative countdown if useful.
- Automatically refresh the bus arrival data while the panel is open, using a sensible interval consistent with the existing 60s cache behaviour.
- Add a small modern-looking Refresh button so the user can manually request fresh data as well.
- When the user manually refreshes, update the arrival timings and the “Last updated” timestamp.
- Only present the data as “Live” while the app is actually refreshing/fetching current arrival data appropriately.
- Avoid overlapping duplicate requests if an automatic refresh and manual refresh happen at nearly the same time.
Guardrails:
- Make the smallest possible change needed for this issue.
- Reuse the existing bus-arrival API and existing data fields. Do not add a new API or data source.
- Do not redesign the bus arrival panel.
- Do not change unrelated transport logic, route finding, weather, OLA Hub, forum, bakery/café, or other functionality.
- Preserve existing styling except for the minimal UI needed for the timestamp and refresh control.
- Do not remove or modify Disqus.
- Do not remove or modify the privacy notice.
- Do not break /api/health.
- Preserve all existing working functionality.
Please also make sure any automatic refresh interval is cleaned up properly when the user leaves the page/component, so it does not keep making unnecessary requests.
```
**What came back:** 1 file touched. The bus arrival freshness and live-status updates have been implemented in BusArrivalSection.tsx:

**What i changed next and why:** Nothing. 

---
---
## Prompt 9 - Help and Guidance for the app.
```
ROLE: You are a sceptical senior developer and usability reviewer working in my existing project. Before you write any code, your job is to argue against the repair I propose.
CONTEXT:
 Live address: https://mgmt-6110-problem-set-2-jin.vercel.app/
 Who the product is for, and what it does for them: A condo app for residents to use for transport, weather and activity recommendations, with a residents hub forum and listing of home bakeries.
The finding, in its six lines:
  Arrival times carry no time taken and never refresh
 Where: https://mgmt-6110-problem-s..., on the first screen, at the top of the page.
 What I did, what I saw: I opened the page for the first time. It shows "OLA Buddy", an address, and a search box asking where I would like to go, but nothing says what this product is, who it is for, or what it can do for me. I scrolled the whole page and still could not tell whether it was a transport tool, a residents' noticeboard or something wider — there are tabs for Directions, Weather and OLA Hub, and no explanation of what sits behind any of them.
 Which heuristic: 10, Help and Documentation.
 Screen or system: Screen. Everything needed to explain the product is a matter of wording on the page.
 Severity, and why: 3, driven by how often it happens. Every first-time visitor meets this before anything else, and someone who cannot tell what a product does has no reason to trust the answers it gives or to come back to it.
 
 
The repair I propose: A line near the top says what OLA Buddy is for and what a resident can do with it, so a first-time visitor knows what they are looking at before they type anything
GOAL: Argue against my repair.
 Does it solve the problem the finding describes, or a problem I already believed I had? Say which, and why.
 Does the problem belong to the screen or to the system, and does my repair sit in the right half?
 Name one heuristic this repair could break while it serves the one above, and how.
 Propose the smallest alternative that would make the same thing true.
 Tell me exactly what to do on the live address to check that the repair worked.
OUTPUT: Your arguments first, as a numbered list. Then stop. Write no code until I reply with the repair I have chosen.
GUARDRAILS: Do not tell me the repair is good. If you have no strong reason to doubt it, say so plainly instead of inventing one. When I do ask you to build, change only what the repair needs. Do not remove Disqus or the privacy notice, and do not break /api/health.
```
**What came back:**
Your repair directly solves the problem the finding describes. The issue is that a first-time visitor cannot tell what OLA Buddy is, who it is for, or what the three main areas are meant to do. Adding one concise explanatory line near the top addresses that exact first-visit orientation problem. I do not see a strong reason to doubt the repair on scope.

This is clearly a screen problem, and your repair sits in the right half. No new backend data, API, account state, or recommendation logic is required. The product already has a defined purpose; the problem is simply that the interface does not communicate it. A small text addition on the landing area is enough.

The repair could create a Heuristic 8 — Aesthetic and Minimalist Design problem if the explanation becomes too long. If you add a paragraph describing transport, weather, activities, forums, bakeries, APIs, and everything else, the top of the page may become more cluttered and harder to scan. The fix should orient the user without turning the landing screen into documentation.

The smallest alternative is a single concise subtitle directly under “OLA Buddy.” For example: “Your condo companion for transport, weather and activities, resident discussions, and local home-bakery listings.” That gives a first-time visitor enough context without adding a modal, onboarding flow, help page, or extra navigation.

To test it on the live site: Open the live address in an incognito/private window so you approach it as a first-time visitor. Before clicking any tab or typing into the search box, check whether the top of the page now tells you what OLA Buddy is for and what a resident can do with it. Then confirm the description is visible without requiring scrolling, is short enough to scan quickly, and does not interfere with the existing Directions, Weather, or OLA Hub controls. Finally, check that Disqus, the privacy notice, and /api/health still work as before.

**What i changed next and why:** Built a prompt to get this fixed.

---
---
## Prompt 10 - Help and Guidance for the app.
```
Fix only the first-time orientation / Help and Documentation issue on the OLA Buddy landing screen.
Current problem:
A first-time visitor sees the title “OLA Buddy”, the condo address, and the search box, but there is no short explanation of what the product is, who it is for, or what the main tabs do. This can make the app feel unclear before the user interacts with it.
Required fix:
- Add one short explanatory line near the top of the page, directly under or close to the “OLA Buddy” title.
- The line should clearly explain that OLA Buddy is for condo residents and that it helps with:
  - transport/directions,
  - weather and activity recommendations,
  - resident discussions/forum,
  - home bakery/café listings.
- Keep the wording concise so the top of the page does not become cluttered.
Suggested wording:
“Your condo companion for transport, weather and activities, resident discussions, and local home-bakery listings.”
Guardrails:
- Make the smallest possible change needed for this issue only.
- Do not add a new onboarding flow, modal, help page, or tutorial.
- Do not redesign the page.
- Do not change the existing tab structure, search, transport, weather, recommendation, forum, or bakery/café functionality.
- Preserve the existing styling as much as possible; only add minimal styling needed for the new subtitle.
- Do not remove or modify Disqus.
- Do not remove or modify the privacy notice.
- Do not break /api/health.
- Change nothing else.
```
**What came back:** 1 file touched. Filtering experience fixed.

**What i changed next and why:** Nothing. Moved on to push code to github after i accepted the current state of the build.

---
