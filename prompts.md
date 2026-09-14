# prompts.md - OLA BUDDY - Condominium App

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
