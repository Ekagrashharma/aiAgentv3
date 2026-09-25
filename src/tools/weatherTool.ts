import "dotenv/config"
import { tool } from "ai";
import { z } from "zod";

const api = process.env.WEATHER_API_KEY

export const weatherTool = tool({
    description: "Get the current weather for a city. Use this when the user asks about the current weather or temperature of a city.",
    inputSchema: z.object({
        location : z.string().describe('city name ,e.g "tokyo"')
    }),
    execute: async ({ location }) => {
    // 1. Convert city name → latitude/longitude
    const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        location,
        )}&count=1&language=en&format=json`,
    );

    if (!geoResponse.ok) {
        throw new Error("Failed to find location");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
        throw new Error(`Could not find city: ${location}`);
    }

    const place = geoData.results[0];

    const { latitude, longitude, name, country } = place;

    // 2. Get weather using coordinates
    const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`,
    );

    if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather");
    }

    const weatherData = await weatherResponse.json();

    return {
      location: name,
      country,
      temperature: weatherData.current.temperature_2m,
      apparentTemperature:
        weatherData.current.apparent_temperature,
      humidity:
        weatherData.current.relative_humidity_2m,
      windSpeed:
        weatherData.current.wind_speed_10m,
      weatherCode:
        weatherData.current.weather_code,
      timezone: weatherData.timezone,
    };
  },
});

