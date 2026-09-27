# adversarial_collaboration.md
Ong Jin, Group 4
predictions.md committed at 26/09/26 at 12am; first comment for this set on my board at 27/09/26 11PM

## The four-way table
### 1. Found by both
- Error Prevention: Error statement from a failed search entry does not adequately educate the consumer on what is the error and how to workaround it | raised by AU | my severity 2, theirs
  2

### 2. Found by them, missed by me
- Help users recognise, diagnose and recover from Error: A new "rubbish entry" search on the direction map search bar after a previous successful search does not erase the old entry | raised by RK, AU and MN | Severity 3 | arbiter NOT TAKEN
- Consistency and Standards: Contradictions between weather tab and air quality findings towards rule based recommendations | Raised by MN | Severity 3 | Arbiter NOT TAKEN
- Match between system and real world: Search directions results were good but some steps were vague and unhelpful, leaving directions incomplete | Raised by RK and AU | Arbiter NOT TAKEN
- User Control and Freedom: App does not have a back button to allow users to revert to last action | Raised by RK | Arbiter NOT TAKEN
     
### 3. Found by me, not by them
- Rule based recommendations based on weather does not take into account time of day | my severity 3
- Directions could be better, providing two way search, coming home to OLA and leaving from OLA | my severity 2
- After typing a search, users should be able to delete their search result by pressing X | my severity 2
- Confusing label for direction search for Bike/ Cycling | my severity 2
- Platform does not allow users personalisation or to pin their most searched results for easy use when returning | my severity 2
  
### 4. Found by both, rated differently
- Help and Documentation: Lack of guidance in main page of app on what this app will do and how it will help them | Raised by AU | my severity 2, theirs 3 | Arbiter TAKEN

## My predictions, checked
- Expected finding 1: Aesthetic and Minimalist Design: I expect them to spot this as my website has 3 screens and is full of details/ capability as i had tried my best to include more functionalities for condo residents. To me, this HELD, as one of my teammates returned to say it is hard to tell at a glance what the platform can do.
  
- Expected finding 2: Match between the system and the real world: I expected them to spot this as my map only allows users to map from OLA to a destination, and is not flexible and aligned to capabilities in the real world. The result is CANNOT TELL, as many of them explored using the search bar, but no one mentioned specifically that there was an issue with the search engine being built this way.
  
- Expected finding 3: Help and Documentation: They should be able to see that nowhere in my app/ website has a help function for users to navigate better. This Held, as one of my classmates picked up exactly this and gave it a severity of 3.

- The heuristic I named as my product's worst: Visibility of System Status: connected well to multiple APIs, but what is lacking is that the platform is not integrated with the current time, allowing time based recommendations for activities. For this, it was not specifically mentioned or called out by my teammates, so i would classify this as CANNOT TELL. 
  
- The finding that would show my evaluation was wrong: This was the finding that there was no help or guide for users, as my classmate rated this to be of a higher severity than me.

## Q1. Where was confirmation bias in my own evaluation?
Confirmation bias appeared most clearly in how I assessed Help and Documentation. Because I built the product and already understood what each tab and function was supposed to do, I assumed that most of the app would also be intuitive to a first-time user. This led me to focus more on whether individual functions worked than on whether the purpose of the product was immediately clear. My groupmate's feedback showed that a new user could open the app and still be unsure whether it was mainly a transport tool, weather tool, or resident platform. My familiarity with the product therefore caused me to underestimate the importance of first-time orientation.

## Q2. Which prediction broke, and what did it teach me?
My prediction about Match Between the System and the Real World did not receive clear support. I expected my groupmates to identify the one-way nature of the directions feature, where routes are primarily designed from OLA to another destination, as a usability problem. Although several groupmates explored the search and directions feature, none specifically raised this limitation. This taught me that issues which appear important from the developer's perspective may not be the problems that users notice first. Instead, they focused on more immediate problems such as value proposition understandability, vague directions, stale search results and browser navigation behaviour.

## Q3. Which groupmate finding did I nearly dismiss, and what did the evidence say?
I initially considered the lack of guidance on the main page to be a relatively minor issue because the three main tabs appeared understandable to me. However, AU rated the problem as severity 3 because every first-time user encounters the page before understanding what OLA Buddy is meant to do. The evidence therefore suggested that I had underestimated the impact of the issue. Although I viewed additional guidance mainly as optional help documentation, the groupmate's observation showed that the problem begins even before a user attempts a task.

## Q4. What did I revise, which heuristic does it serve, and how do I know it worked?
My original project before the fixes was as shown in this link: https://mgmt-6110-problem-set-2-evlyp55cv-group-4-2d54.vercel.app?_vercel_share=TTWyiY65WUcNt1eEihhe3qMAYf8xv2Gj
I revised several issues raised during the peer evaluation: 
- For the search bar problem, I changed the Directions screen so that a failed new search no longer leaves the previous successful destination and route displayed as if they are current. This serves a Heuristic fix to Help Users Recognize, Diagnose and Recover from Errors. I verified it by first searching for a valid destination, then entering an invalid search and checking that the previous result disappeared and a clear error state was shown.
- For the Weather and Activities section, I revised the recommendation logic so that weather and air-quality conditions no longer produce contradictory advice. This serves Heuristic 4 of Consistency and Standards. I checked that the outdoor-exercise recommendation and the activity recommendation now give compatible advice under the same conditions.
- I also revised the bus-arrival panel so that users can see when the data was last updated and can obtain refreshed arrival information. This serves Heuristic 1 - Visibility of System Status. I checked that the timestamp changes when fresh data is retrieved and that the panel no longer presents an old value without indicating its age.
- I added a short explanation near the top of the main page describing what OLA Buddy is for and what residents can do with it, while changing the page layout to aid in this storytelling. This serves Heuristic 10, Help and Documentation. I verified it by opening the site as a first-time visitor and checking that the purpose of the product could be understood before interacting with any of the tabs.

## Q5. What did my users give me that I could not have found myself?
1. My users gave me a first-time perspective that I was not able to reproduce as the developer of the product. Because I already knew how the app was structured, I naturally understood what the tabs meant, how the search worked and what information the recommendations were based on. My groupmates instead exposed issues that only became obvious when approaching the product without that prior knowledge.
2. Secondly, they gave me volume testing, using their precious time to help me explore the various functionalities, which i sometimes feel abit lazy to do so myself. Examples included stale search results remaining after a failed search, vague route instructions, contradictory recommendations and the lack of an explanation of what OLA Buddy actually does. I realised that i was too casual with my build outcomes, and trusted the results too much to notice such fatal flaws in the product.
   
## Q6. Did the AI help me confirm, or help me falsify?
The AI was most useful when it helped me falsify or challenge my initial assumptions. For each proposed repair, I asked the AI to act as a sceptical developer and argue against the change before any code was written. For example, for bus arrivals, AI challenged the idea that a manual refresh button alone would not fully solve a finding about supposedly "live" data, and for the fix on map routing, AI also told me that extracting very deterministic outcomes from backend API and following the data rigidly could affect user experience, as a user might need to read data that has not been arranged in a consumable format. 
