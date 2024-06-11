// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
"use strict";

const functions = require("firebase-functions");
const { WebhookClient } = require("dialogflow-fulfillment");
const { Card, Suggestion } = require("dialogflow-fulfillment");
const axios = require("axios"); // Import axios
const xml2js = require("xml2js"); // Import xml2js

const appId = "E367BC65D52A40D52B9899D89";
const geocodeApiKey = "6661ead19d23c605660077cpm618847";

// This is necessary to map stop IDs to titles since there's no way to look up in the TriMet API
const stopMap = {
  "Hatfield Government Center MAX Station": "9848",
  "Hillsboro Central/SE 3rd TC MAX Station": "9846",
  "Tuality Hospital/SE 8th Ave MAX Station": "9843",
  "Washington/SE 12th Ave MAX Station": "9841",
  "Fair Complex/Hillsboro Airport MAX Station": "9838",
  "Hawthorn Farm MAX Station": "9839",
  "Orenco MAX Station": "9835",
  "Quatama MAX Station": "9834",
  "Willow Creek/SW 185th Ave TC MAX Station": "9831",
  "Elmonica/SW 170th Ave MAX Station": "9830",
  "Merlo Rd/SW 158th Ave MAX Station": "9828",
  "Beaverton Creek MAX Station": "9822",
  "Millikan Way MAX Station": "9826",
  "Beaverton Central MAX Station": "9824",
  "Beaverton TC MAX Station": "9821",
  "Sunset TC MAX Station": "9969",
  "Washington Park MAX Station": "10120",
  "Goose Hollow/SW Jefferson St MAX Station": "10118",
  "Providence Park MAX Station": "9758",
  "Library/SW 9th Ave MAX Station": "8333",
  "Pioneer Square South MAX Station": "8334",
  "Yamhill District MAX Station": "8336",
  "Oak/SW 1st Ave MAX Station": "8337",
  "Skidmore Fountain MAX Station": "8338",
  "Old Town/Chinatown MAX Station": "8339",
  "Rose Quarter TC MAX Station": "8340",
  "Convention Center MAX Station": "8341",
  "NE 7th Ave MAX Station": "8342",
  "Lloyd Center/NE 11th Ave MAX Station": "8343",
  "Hollywood/NE 42nd Ave TC MAX Station": "8344",
  "NE 60th Ave MAX Station": "8345",
  "NE 82nd Ave MAX Station": "8346",
  "Gateway/NE 99th Ave TC MAX Station": "8347",
  "E 102nd Ave MAX Station": "8348",
  "E 122nd Ave MAX Station": "8349",
  "E 148th Ave MAX Station": "8350",
  "E 162nd Ave MAX Station": "8351",
  "E 172nd Ave MAX Station": "8352",
  "E 181st Ave MAX Station": "8353",
  "Rockwood/E 188th Ave MAX Station": "8354",
  "Ruby Junction/E 197th Ave MAX Station": "8355",
  "Civic Drive MAX Station": "13450",
  "Gresham City Hall MAX Station": "8356",
  "Gresham Central TC MAX Station": "8357",
  "Cleveland Ave MAX Station": "8359",
  "PSU South/SW 6th & College MAX Station": "10293",
  "PSU Urban Center/SW 6th & Montgomery MAX Station": "7774",
  "SW 6th & Madison MAX Station": "13123",
  "Pioneer Courthouse/SW 6th Ave MAX Station": "7777",
  "SW 6th & Pine MAX Station": "7787",
  "NW 6th & Davis MAX Station": "9299",
  "Union Station/NW 6th & Hoyt MAX Station": "7763",
  "SE Main St MAX Station": "13124",
  "SE Division St MAX Station": "13125",
  "SE Powell Blvd MAX Station": "13126",
  "SE Holgate Blvd MAX Station": "13127",
  "Lents/SE Foster Rd MAX Station": "13128",
  "SE Flavel St MAX Station": "13129",
  "SE Fuller Rd MAX Station": "13130",
  "Clackamas Town Center TC MAX Station": "13132",
  "SE Park Ave MAX Station": "13720",
  "Milwaukie/Main St MAX Station": "13721",
  "SE Tacoma/Johnson Creek MAX Station": "13722",
  "SE Bybee Blvd MAX Station": "13723",
  "SE 17th Ave & Holgate Blvd MAX Station": "13724",
  "SE 17th Ave & Rhine St MAX Station": "13725",
  "Clinton St/SE 12th Ave MAX Station": "13726",
  "OMSI/SE Water MAX Station": "13727",
  "South Waterfront/S Moody MAX Station": "13728",
  "Lincoln St/SW 3rd Ave MAX Station": "13729",
  "Parkrose/Sumner TC MAX Station": "10572",
  "Cascades MAX Station": "10574",
  "Mt Hood Ave MAX Station": "10576",
  "Portland Int'l Airport MAX Station": "10579",
  "Interstate/Rose Quarter MAX Station": "11508",
  "Albina/Mississippi MAX Station": "11509",
  "Overlook Park MAX Station": "11510",
  "N Prescott St MAX Station": "11511",
  "N Killingsworth St MAX Station": "11512",
  "Rosa Parks MAX Station": "11513",
  "N Lombard TC MAX Station": "11514",
  "Kenton/N Denver Ave MAX Station": "11515",
  "Delta Park/Vanport MAX Station": "11516",
  "Expo Center MAX Station": "11498",
};

const locationSpecific = {
  "portland state university": "Go Vikings!",
  "peninsula park": "Don't forget to stop and smell the roses!",
  "international rose test garden": "Don't forget to stop and smell the roses!",
  "expo center": "Let me know if there's any fun conventions going on!",
  "pioneer courthouse square": "Take a look at Mile Post Sign for me!",
  "portland art museum": "Get ready to be inspired by the amazing exhibits inside."
};

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

process.env.DEBUG = "dialogflow:debug"; // enables lib debugging statements

exports.dialogflowFirebaseFulfillment = functions.https.onRequest(
  (request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log(
      "Dialogflow Request headers: " + JSON.stringify(request.headers)
    );
    console.log("Dialogflow Request body: " + JSON.stringify(request.body));

    function welcome(agent) {
      agent.add(`Welcome to my agent!`);
    }

    function fallback(agent) {
      agent.add(`I didn't understand`);
      agent.add(`I'm sorry, can you try again?`);
    }

    function getArrivals(agent) {
      const stopName = agent.parameters.stops; // Get the stop name from the user's request
      const stopId = stopMap[stopName]; // Find the stop ID from the stopMap

      if (!stopId) {
        agent.add(
          `I couldn't find the stop ID for ${stopName}. Please try another stop.`
        );
        return;
      }

      return axios
        .get(
          `https://developer.trimet.org/ws/V1/arrivals/locIDs/${stopId}/appID/${appId}`
        ) // Replace with your API URL
        .then((response) => {
          // Parse the XML response
          return xml2js.parseStringPromise(response.data, {
            explicitArray: false,
          });
        })
        .then((parsedResult) => {
          const arrivals = parsedResult.resultSet.arrival;
          const queryTime = parsedResult.resultSet.$.queryTime;

          if (!arrivals) {
            agent.add(
              `There are no upcoming arrivals for ${stopName} at the moment.`
            );
            return;
          }

          // Ensure arrivals is an array
          const arrivalList = Array.isArray(arrivals) ? arrivals : [arrivals];

          if (arrivalList.length > 0) {
            let responses = [];
            arrivalList.forEach((arrival) => {
              const route = arrival.$.shortSign;
              const estimated =
                parseInt(arrival.$.estimated) || parseInt(arrival.$.scheduled); // Use estimated if available, otherwise use scheduled
              const minutes = Math.ceil((estimated - queryTime) / 60000); // Convert milliseconds to minutes
              responses.push(`${route} arriving in ${minutes} minutes`);
            });
            agent.add(
              `The next arrivals at ${stopName} are: ` +
                responses.join(", ") +
                `.`
            );
          } else {
            agent.add(
              `There are no upcoming arrivals for ${stopName} at the moment.`
            );
          }
        })
        .catch((error) => {
          console.error(`Error fetching arrivals: ${error}`);
          agent.add(
            `I couldn't fetch the arrivals for ${stopName} at the moment. Please try again later.`
          );
        });
    }

    function getAlerts(agent) {
      const stopName = agent.parameters.stops; // Get the stop name from the user's request
      const stopId = stopMap[stopName]; // Find the stop ID from the stopMap
      const line = agent.parameters["max-lines"];

      if (!stopId && !line) {
        agent.add(
          `Please provide a valid stop name, stop ID, or MAX line name.`
        );
        return;
      }

      if (!stopId) {
        return axios
          .get(`https://developer.trimet.org/ws/v2/alerts&appId=${appId}`) // Replace with your API URL
          .then((response) => {
            const alerts = response.data.resultSet.alert.filter(
              (alert) =>
                alert.route.some((route) => route.type === "R") &&
                alert.route.some((route) =>
                  route.desc.toLowerCase().includes(line.toLowerCase())
                )
            );

            if (alerts && alerts.length > 0) {
              let responses = [];
              alerts.forEach((alert) => {
                const routeInfo = alert.route
                  .map((route) => `${route.route}: ${route.desc}`)
                  .join(", ");
                responses.push(`Alert for ${routeInfo}: ${alert.desc}`);
              });
              agent.add(
                `Here are some alerts on the ${line} line: ` +
                  responses.join(" ") + ` Safe travels out there!`
              );
            } else {
              agent.add(`There are no alerts at the moment. Safe travels!`);
            }
          })
          .catch((error) => {
            console.error(`Error fetching alerts: ${error}`);
            agent.add(
              `I couldn't fetch the alerts at the moment. Please try again later.`
            );
          });
      }

      return axios
        .get(
          `https://developer.trimet.org/ws/v2/alerts?locId=${stopId}&appId=${appId}`
        ) // Replace with your API URL
        .then((response) => {
          const alerts = response.data.resultSet.alert.filter((alert) =>
            alert.route.some((route) => route.type === "R")
          );
          console.warn(alerts);

          if (alerts && alerts.length > 0) {
            let responses = [];
            alerts.forEach((alert) => {
              const routeInfo = alert.route
                .map((route) => `${route.route} ${route.desc}`)
                .join(", ");
              responses.push(`Alert for ${routeInfo}: ${alert.desc}`);
            });
            agent.add(
              `Here are some alerts for ${stopName}:` + responses.join(", ")
            );
          } else {
            agent.add(`There are no alerts for ${stopName} at the moment.`);
          }
        })
        .catch((error) => {
          console.error(`Error fetching alerts: ${error}`);
          agent.add(
            `I couldn't fetch the alerts for ${stopName} at the moment. Please try again later.`
          );
        });
    }

    function getCoordinates(location) {
      const geocodeUrl = `https://geocode.maps.co/search?q=${location}&api_key=${geocodeApiKey}`;
      console.warn(geocodeUrl);

      return axios
        .get(geocodeUrl)
        .then((response) => {
          if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { lat, lon };
          } else {
            throw new Error("No results found");
          }
        })
        .catch((error) => {
          console.error(
            `Error fetching coordinates for location: ${location}`,
            error
          );
          throw new Error("Could not fetch coordinates");
        });
    }

    function getCoordinatesIntent(agent) {
      const location = agent.parameters.any; // Get the location from the user's request

      if (!location) {
        agent.add("Please provide a location.");
        return;
      }

      return getCoordinates(location + ` Oregon`)
        .then((coords) => {
          agent.add(
            `The coordinates for ${location} are latitude: ${coords.lat}, longitude: ${coords.lon}.`
          );
        })
        .catch((error) => {
          console.error(
            `Error fetching coordinates for location: ${location}`,
            error
          );
          agent.add(
            `I couldn't fetch the coordinates for ${location} at the moment. Please try again later.`
          );
        });
    }

    function findStops(agent) {
      const location = agent.parameters.any; // Get the location from the user's request

      return getCoordinates(location + ` Oregon`)
        .then((coords) => {
          const { lat, lon } = coords;
          const stopSearchRadius = 5000; // Radius in feet to search for stops

          const trimetStopsURL = `https://developer.trimet.org/ws/V1/stops/ll/${lat},${lon}/feet/${stopSearchRadius}/appId/${appId}`;

          return axios
            .get(trimetStopsURL)
            .then((response) => {
              return xml2js.parseStringPromise(response.data);
            })
            .then((parsedResult) => {
              const locations = parsedResult.resultSet.location;
              const maxLocations = locations.filter((location) =>
                location.$.desc.includes("MAX")
              );

              if (maxLocations && maxLocations.length > 0) {
                const closestStop = maxLocations[0];
                const stopName = closestStop.$.desc;

                agent.add(`The closest stop to ${toTitleCase(location)} is ${stopName}.`);
              } else {
                agent.add(
                  `No stops found within ${stopSearchRadius} feet of ${location}.`
                );
              }
            })
            .catch((error) => {
              console.error(`Error fetching TriMet stops: ${error}`);
              agent.add(
                `There was an error fetching the stops for the location. Please try again later.`
              );
            });
        })
        .catch((error) => {
          console.error(`Error fetching coordinates: ${error}`);
          agent.add(
            `There was an error fetching the coordinates for the location. Please try again later.`
          );
        });
    }

    function planTrip(agent) {
      const stops = agent.parameters.any; // Get the stops from the user's request
      if (stops.length < 2) {
        agent.add(`Please provide two stops.`);
        return;
      }

      const firstStop = stops[0];
      const lastStop = stops[1];
      console.log("stops");
      console.log(firstStop);
      console.log(lastStop);

      // Fetch coordinates for both stops
      return Promise.all([
        getCoordinates(firstStop + ` Oregon`),
        getCoordinates(lastStop + ` Oregon`),
      ])
        .then(([firstStopCoord, lastStopCoord]) => {
          // Construct the coordinates string
          const firstStopCoordStr = `${firstStopCoord.lat},${firstStopCoord.lon}`;
          const lastStopCoordStr = `${lastStopCoord.lat},${lastStopCoord.lon}`;

          const tripPlannerURL = `https://developer.trimet.org/ws/V1/trips/tripplanner/fromCoord/${firstStopCoordStr}/toCoord/${lastStopCoordStr}/mode/T/appId/${appId}`;
		  console.log(tripPlannerURL);
        
          return axios
            .get(tripPlannerURL)
            .then((response) => {
              return xml2js.parseStringPromise(response.data);
            })
            .then((parsedResult) => {
              let responses = [];
              const itinerary =
                parsedResult.response.itineraries[0].itinerary[0];
              if (itinerary) {
                const fare = itinerary.fare[0].regular[0];
                const duration = itinerary["time-distance"][0].duration[0];
                itinerary.leg.forEach((leg, legIndex) => {
                  const mode = leg.$.mode;
                  const duration = leg["time-distance"][0].duration[0];
                  let from = leg.from[0].description[0];
                  let to = leg.to[0].description[0];

                  if (legIndex === 0) {
                    from = toTitleCase(firstStop);
                  }

                  if (legIndex === itinerary.leg.length - 1) {
                    to = toTitleCase(lastStop);
                  }

                  responses.push(
                    `${mode.toLowerCase()} from ${from} to ${to} in ${duration} mins`
                  );
                });
                if (responses.length > 0) {
                  const specificStatement =
                    locationSpecific[lastStop.toLowerCase()] || "";
                  agent.add(
                    `Here's your trip: ` +
                      responses.join(", then ") +
                      `. The total time for this trip is about ${duration} minutes. Fare for this trip is $${fare}. ${specificStatement}`
                  );
                }
              } else {
                console.log("No legs found for this itinerary.");
              }
            })
            .catch((error) => {
              console.error(`Error fetching trip planner data: ${error}`);
              agent.add(
                `Sorry, I couldn't find a trip between these locations. There may be no transit service within the maximum specified distance or at the specified time, or your start or end point might not be safely accessible. Can I help you plan a different trip?`
              );
            });
        })
        .catch((error) => {
          console.error(`Error fetching coordinates: ${error}`);
          agent.add(
            `I could not find one of your locations, please try planning a different trip.`
          );
        });
    }

    // Run the proper function handler based on the matched Dialogflow intent name
    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Default Fallback Intent", fallback);
    intentMap.set("GetAlertsIntent", getAlerts);
    intentMap.set("GetArrivalsIntent", getArrivals);
    intentMap.set("FindStopsIntent", findStops);
    intentMap.set("PlanTripIntent", planTrip);
    intentMap.set("GetCoordinatesIntent", getCoordinatesIntent);
    agent.handleRequest(intentMap);
  }
);
