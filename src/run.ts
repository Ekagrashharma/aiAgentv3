
import "dotenv/config";

import { generateText, stepCountIs, tool } from "ai";
import { google } from "@ai-sdk/google";
import { tools } from "./tools/index.js"

// TODO : make the agent limitation for tools



async function main(
  userMessage: string
) {

  const {text} = await generateText({
    model: google("gemini-3-flash-preview"),
    prompt: userMessage,
    stopWhen: stepCountIs(2),
    tools
  });

  console.log(text);
}
main("current date ")


<<<<<<< HEAD

=======
// make a tool and make it dynamic
>>>>>>> 5406552 (free)
