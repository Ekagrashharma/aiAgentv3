import "dotenv/config"
import { tool } from "ai";
import { z } from "zod";

const api = process.env.WEATHER_API_KEY

export const weatherTool = tool({
    description: "Get the current weather for a city. Use this when the user asks about the current weather or temperature of a city.",
    inputSchema: z.object({}),
    execute: async () => {
        // make a function that take a data from api and give the response
            const response = await fetch(
                "https://api.open-meteo.com/v1/forecast?latitude=28.36&longitude=79.43&current=temperature_2m,weather_code,wind_speed_10m"
                    );
            const data = await response.json();
            return "29 degree calcius  in bareilly " 
        }, 
})
