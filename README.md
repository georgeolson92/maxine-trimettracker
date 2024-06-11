# Maxine, the transit guide

‘Maxine’ is a virtual transit assistant that helps the user plan a trip on Portland’s MAX and streetcar metro systems. The purpose of the application is to provide users with detailed routes including stops, transfers, and estimated travel times. Additional information includes total duration, the fare for the trip, and transfers. The application also provides alerts for different MAX routes and stops. You can even find the closest MAX station to a given location. The app aims to enhance the commuting experience by offering accurate and user-friendly transit information in a quick and easy manner.

Test demo can be found here: [Dialogflow Bot](https://bot.dialogflow.com/eeaf8336-c188-480f-a00f-6c7cf4b3d6cc)

## Interaction Model
This application contains 6 total intents. Some of them are simply for the chat agent to introduce itself or help guide the user, but I will focus on four of the custom intents that provide important functionality to the application:

### Find Stops - finds the closest MAX station to a given location
Sample utterances:
1. What is the closest station to Portland State University?
2. What is the closest MAX stop to Peninsula Park?
3. What is the closest MAX station to Providence Park?
4. What is the closest stop to 901 N Rosa Parks Way?
5. What is the closest stop to Arbor Lodge?
6. Can you find the closest stop to Woodlawn?
7. Is there a stop near Goose Hollow?
8. Can you find the closest MAX stop to Old Town?
9. Is there a max stop near Beaverton?
10. Can you find the closest station to Moda Center?
11. Is there a station near Nob Hill?
12. Is there a MAX station near the Pearl?
13. Can you find a stop by Piedmont?
14. Can you find a MAX station by Cedar Hills?
15. Are there any MAX stations near Eliot?

### Get Alerts - gets alerts for a given stop (by name or ID) or MAX line
Sample utterances:
1. Are there any alerts on the blue line?
2. Can you tell me any alerts for the red line?
3. Are there any alerts for the yellow line?
4. Can you tell me any alerts at stop number 9830?
5. Can you tell me any alerts at Quatama MAX Station?
6. Are there any alerts at stop number 9838?
7. Are there any alerts at Hatfield Government Center MAX Station?
8. Are there any alerts at the Tuality Hospital/SE 8th Ave MAX Station?
9. Do you have any alerts for the green line?
10. Are there any alerts on the orange line?
11. Can you tell me any alerts at the Beaverton TC MAX Station?
12. Are there any alerts for the Hollywood/NE 42nd Ave TC MAX Station?
13. Can you tell me any alerts at the Gateway/NE 99th Ave TC MAX Station?
14. Are there any alerts for the PSU South/SW 6th & College MAX Station?
15. Show me alerts at the SE Park Ave MAX Station?

### Get Arrivals - gets arrivals for a given stop (by name or ID)
Sample utterances:
1. Check the next arrival at SW 6th & Pine MAX Station
2. Check the next arrival at stop number 9299
3. When are the next arrivals at stop number 7777?
4. When are the next arrivals at E 162nd Ave MAX Station?
5. When is the next arrival at stop number 9824?
6. When is the next arrival at Merlo Rd/SW 158th Ave MAX Station?
7. What time is the next arrival at Hatfield Government Center MAX Station?
8. When does the next train arrive at stop number 9848?
9. Check the arrivals at Library/SW 9th Ave MAX Station
10. When is the next arrival at stop number 8333?
11. When is the next arrival at NE 7th Ave MAX Station?
12. What time is the next arrival at stop number 8342?
13. When does the next train arrive at the Beaverton Central MAX Station?
14. When is the next arrival at stop number 9824?
15. Check the next arrival at Old Town/Chinatown MAX Station

### Plan Trip - plans a trip between two given locations
Sample utterances:
1. I want to plan a trip that goes from Providence Park to the Moda Center
2. I want to plan a trip from Peninsula Park to Portland State University
3. Plan a trip from Washington Park to the Oregon Convention Center
4. Plan a trip between Beaverton TC and Gresham Central TC
5. I need to plan a trip from Lloyd Center to Clackamas Town Center
6. How do I get from Goose Hollow to Portland State University?
7. Plan a trip from Rockwood to Pioneer Square
8. Plan a trip between SE Division St and SE Holgate Blvd
9. Plan a route from Goose Hollow to Gateway/NE 99th Ave TC
10. I want to plan a trip from Orenco MAX Station to Sunset TC
11. How can I get from Tuality Hospital to SE 17th Ave & Rhine St?
12. Plan a trip between PSU Urban Center and Hillsboro Central
13. I need a trip planned from Milwaukie to the Portland Library
14. Plan a trip from SE Flavel St to the Rose Quarter
15. Plan a route from Hatfield Government Center to Portland Int'l Airport

## Fulfillment
In this section, I will outline the logic that drives the fulfillment of this Dialogflow application. This pseudocode provides a high-level overview of the steps and processes involved in handling user intents and interacting with external APIs to provide responses.

### Initialize Application:
Set up environment variables for API keys.
Initialize mappings for stop names to stop IDs.
Define location-specific messages.
### Handle Requests:
When a request is received, identify the intent based on user input.
### Welcome Intent:
Respond with a welcome message introducing the assistant, Maxine.
### Fallback Intent:
Respond with a message indicating that the input was not understood.
Get Arrivals Intent:
Retrieve the stop name from user input.
Map the stop name to its corresponding stop ID.
If the stop ID is found:
Fetch arrival times for the stop using the TriMet API.
Parse the API response to extract arrival information.
Respond with the next arrivals at the specified stop.
If the stop ID is not found:
Respond with a message indicating that the stop was not found.
### Get Alerts Intent:
Retrieve the stop name and/or line from user input.
If a stop ID or line is provided:
Fetch alerts for the specified stop or line using the TriMet API.
Parse the API response to extract alert information.
Respond with the alerts for the specified stop or line.
If neither is provided:
Respond with a message asking for a valid stop name, stop ID, or line name.
### Get Coordinates Intent:
Retrieve the location from user input.
If a location is provided:
Fetch the coordinates of the location using the Geocode API.
Respond with the latitude and longitude of the location.
If no location is provided:
Respond with a message asking for a location.
###  Find Stops Intent:
Retrieve the location from user input.
Fetch the coordinates of the location using the Geocode API.
Use the coordinates to search for nearby stops within a specified radius using the TriMet API.
Parse the API response to extract stop information.
Respond with the closest stop to the specified location.
###  Plan Trip Intent:
Retrieve the list of stops from user input.
If at least two stops are provided:
Plan a trip between the first and last stop using the TriMet API.
Respond with the planned trip details.
If fewer than two stops are provided:
Respond with a message asking for two stops.
### Error Handling:
For each API call, handle errors gracefully.
Respond with appropriate error messages if an API call fails or if data is not found.

## Persona
Maxine is always polite, cheerful, and eager to assist. She makes users feel comfortable asking for help. She is well-versed in all aspects of the TriMet transit system and provides accurate, up-to-date information. She delivers information in a concise, straightforward manner, ensuring users get what they need quickly. Maxine always goes the extra mile (quite literally) to help users plan their trips, find stops, and understand alerts. Maxine will also offer personalized responses based on specific destinations the user is traveling to, providing recommendations on local sights and attractions.

## Review
General Impressions: The aspect of this assignment that I found most successful was my ability to work with a complex third-party API to create some genuinely exciting functionality. The resulting voice assistant is highly useful and something I can envision using frequently as a commuter on the MAX. However, the complexity of this application has made the code somewhat messy and less modular than I would prefer. With additional time, I would like to refactor the code to improve modularity. For instance, much of the data, such as stop IDs and locations, is currently stored directly in the fulfillment index.js file. Ideally, this data would be managed in a database. Additionally, the functionality for finding locations by name is quite fragile and prone to errors when retrieving coordinates to send to TriMet’s API. I would like to enhance the flexibility and robustness of location matching to improve reliability.

Time: This project took a total of two weeks to complete. Initially, I aimed to create a basic alert and arrival retrieval functionality. However, I soon expanded the scope to utilize TriMet’s trip planner endpoint, aiming to develop a more robust voice assistant. The most time-consuming aspect was parsing information from the TriMet API. The API responses were in XML format for most endpoints, requiring conversion to JSON to extract information for the fulfillment part. In contrast, implementing the second API for geocoding was much easier due to the simpler structure of the requests and responses. Additionally, I encountered issues where adding multiple responses to the agent caused some responses to break, which required careful debugging and adjustment. In the end, I decided to carefully craft a single response for each intent before adding them to the agent in order to avoid further issues.

Future Work: While I have incorporated some elements of the Portland Streetcar into this project, I have not yet fully utilized it for the alerts and station-finding segments. Ideally, I would like to expand Maxine's capabilities to include comprehensive information about the Portland Streetcar. Additionally, I aim to enhance Maxine to provide detailed information about bus routes, enabling users to specify their preferred method of transportation. This expansion would make Maxine a more versatile and comprehensive transit assistant.









