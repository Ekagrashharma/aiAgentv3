import { tool } from "ai";
import { z } from "zod";

export const weatherTool = tool({
    description:
    "Get the current weather for a city. Use this when the user asks about the current weather or temperature of a city.",

    inputSchema: z.object({
    city:  z.string()
            .describe("The name of the city to get the weather for"),
    }),

    execute: async ({ city }) => {
    return {
        city,
        temperature: 28,
        unit: "C",
        condition: "Sunny",
    };
    },
});