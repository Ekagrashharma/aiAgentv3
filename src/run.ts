
import "dotenv/config";

import { generateText, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";

import { weatherTool } from "./tools/weatherTool.js";


async function main() {
  const result = await generateText({
    model: google("gemini-3-flash-preview"),

    prompt: "What's the weather in Delhi?",

    tools: {
      getWeather: weatherTool,
    },

    stopWhen: stepCountIs(2),
  });

  console.log(result.text);
}

main().catch(console.error);

<<<<<<< HEAD

=======
// make a tool and make it dynamic
>>>>>>> 5406552 (free)
