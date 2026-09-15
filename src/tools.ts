const weatherTool = {
  functionDeclarations: [
    {
      name: "getWeather",
      description: "Gets the current weather for a city.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The name of the city."
          }
        },
        required: ["city"]
      }
    }
  ]
};


function getWeather(city: string) {
  return {
    city,
    temperature: 28,
    unit: "C",
    condition: "Sunny"
  };
}

getWeather('delhi')