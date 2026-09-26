import "dotenv/config";
import * as readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { generateText, ModelMessage, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { Laminar } from "@lmnr-ai/lmnr";

Laminar.initialize({
  projectApiKey: process.env.LMNR_API_KEY,
});

export async function runAgent(prompt: string, history: ModelMessage[] = []) {
  const messages: ModelMessage[] = [...history, { role: "user", content: prompt }];

  const result = await generateText({
    model: google("gemini-3-flash-preview"),
    prompt: messages,
    stopWhen: stepCountIs(5),
  });

  return {
    text: result.text,
    toolCalls: result.toolCalls,
    toolResults: result.toolResults,
    steps: result.steps,
    messages: [...messages, ...result.responseMessages],
  };
}

async function main() {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let messages: ModelMessage[] = [];

  while (true) {
    const userInput = await terminal.question("You: ");
    if (userInput.trim().toLowerCase() === "exit") break;

    console.log(messages.length);
    const result = await runAgent(userInput, messages);
    console.log("Agent:", result.text);
    messages = result.messages;
  }

  terminal.close();
}


  main().catch(console.error);