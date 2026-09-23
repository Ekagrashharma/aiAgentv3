
import "dotenv/config";
import * as readline from "node:readline/promises";
import { generateText, ModelMessage, ToolSet } from "ai";
import { google } from "@ai-sdk/google";
import { tools } from "./tools/index.js"
import { error } from "node:console";

// TODO : make the agent limitation for tools

const messages: ModelMessage[] = [];

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  while(true){
    const userInput = await terminal.question("You: ");
    if (userInput.trim().toLowerCase() === "exit") break;

    messages.push({ role: "user", content: userInput });

    console.log(messages.length)
    const result = await generateText({
        model: google("gemini-3-flash-preview"),
        prompt: messages,
        tools,
        });
        
        console.log("Agent:", result.text);
        
        messages.push(...result.responseMessages)
      }
      terminal.close()
    }
main().catch(console.error)
