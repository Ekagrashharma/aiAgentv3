
import "dotenv/config";

import { generateText, stepCountIs} from "ai";
import { google } from "@ai-sdk/google";
import { tools } from "./tools/index.js"

// TODO : make the agent limitation for tools



async function main(
  userMessage: string
) {

  const {text} = await generateText({
    model: google("gemini-3-flash-preview"),
    prompt: userMessage,
    tools
  });

  console.log(text);
}
main("hello , give me the bareilly weather  ")
