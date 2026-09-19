# Stage 1 — Build a Gemini Tool-Calling Agent in TypeScript

## Goal

The goal of Stage 1 is not to build a full production agent.

The goal is to understand one fundamental loop:

```text
User message
    ↓
Gemini model
    ↓
Model decides whether a tool is needed
    ↓
Function call returned
    ↓
Your TypeScript program executes the function
    ↓
Tool result returned to Gemini
    ↓
Gemini generates the final answer
```

The most important idea is:

> Gemini does not directly execute your TypeScript function. Gemini only asks your application to execute a function. Your application is responsible for validation, execution, and returning the result.

---

# 1. What we are building

We will build a tiny chat program where the user can ask:

```text
What's the weather in Delhi?
```

Gemini will have access to one tool:

```text
getWeather(city)
```

For now, the weather function will return fake data.

Example:

```json
{
  "city": "Delhi",
  "temperature": 28,
  "unit": "C",
  "condition": "Sunny"
}
```

Gemini will then turn that data into a natural-language answer:

```text
The weather in Delhi is currently 28°C and sunny.
```

We deliberately use fake weather data first.

Why?

Because this stage is about learning the **tool-calling protocol**, not dealing with another external weather API, API keys, HTTP failures, rate limits, and network problems.

---

# 2. The architecture

At the beginning, your project looks like this:

```text
User
 │
 │ "What's the weather in Delhi?"
 ▼
TypeScript application
 │
 │ sends message + tool definition
 ▼
Gemini
 │
 │ returns function call
 │
 │ getWeather({ city: "Delhi" })
 ▼
TypeScript application
 │
 │ executes actual function
 ▼
getWeather("Delhi")
 │
 │ returns data
 ▼
TypeScript application
 │
 │ sends function result to Gemini
 ▼
Gemini
 │
 │ produces final text
 ▼
User
```

There are normally two model requests in this simple flow:

```text
Request 1:
User → Gemini

Response 1:
Gemini → function call

Local execution:
Your program → getWeather()

Request 2:
Your program → Gemini
with the function result

Response 2:
Gemini → final answer
```

---

# 3. Step 1 — Create the project

Open your terminal and choose the directory where you keep your projects.

Run:

```bash
mkdir gemini-tool-agent
cd gemini-tool-agent
```

## Why?

`mkdir` creates the project directory.

`cd` moves your terminal into that directory.

Everything we install and create from now on belongs to this project.

You can verify your current directory:

```bash
pwd
```

You should see something similar to:

```text
/home/ekagra/Code/gemini-tool-agent
```

The exact path depends on where you created the project.

---

# 4. Step 2 — Create package.json

Run:

```bash
npm init -y
```

This creates:

```text
package.json
```

Your project now looks like:

```text
gemini-tool-agent/
└── package.json
```

## Why do we need package.json?

`package.json` describes your Node.js project.

It keeps track of:

- project name
- version
- dependencies
- development dependencies
- scripts

For example, after installing packages it will contain things similar to:

```json
{
  "dependencies": {
    "@google/genai": "...",
    "dotenv": "..."
  },
  "devDependencies": {
    "@types/node": "...",
    "tsx": "...",
    "typescript": "..."
  }
}
```

Do not manually write the versions unless necessary.

Let npm manage them.

---

# 5. Step 3 — Install the Gemini SDK

Run:

```bash
npm install @google/genai
```

This installs Google's official Gemini SDK for JavaScript/TypeScript.

## Why?

Without the SDK, you would need to manually construct HTTP requests to the Gemini API.

The SDK gives us a JavaScript/TypeScript interface such as:

```typescript
const ai = new GoogleGenAI({
  apiKey
});
```

and:

```typescript
await ai.models.generateContent(...)
```

So instead of manually handling HTTP requests, headers, request bodies, and response parsing, we can work with the SDK.

---

# 6. Step 4 — Install dotenv

Run:

```bash
npm install dotenv
```

## Why?

Our Gemini API key should not be hard-coded inside TypeScript.

We will store it in:

```text
.env
```

For example:

```env
GEMINI_API_KEY=your_api_key
```

`dotenv` loads those values into:

```typescript
process.env
```

This lets our program access:

```typescript
process.env.GEMINI_API_KEY
```

---

# 7. Step 5 — Install TypeScript correctly

This is where your previous error happened.

You ran:

```bash
npx tsc --init
```

before installing TypeScript.

Because `tsc` was not installed locally, npm tried to find a package called:

```text
tsc
```

That package is not the TypeScript compiler.

The actual package is:

```text
typescript
```

So install it:

```bash
npm install -D typescript
```

We also want:

```bash
npm install -D tsx @types/node
```

Or install all three at once:

```bash
npm install -D typescript tsx @types/node
```

## Why these packages?

### typescript

Provides the TypeScript compiler:

```text
tsc
```

### tsx

Lets us run TypeScript files directly during development:

```bash
npx tsx src/index.ts
```

This is convenient because we don't have to manually compile every file first.

### @types/node

Provides TypeScript type definitions for Node.js APIs.

For example:

```typescript
process.env
```

comes from the Node.js environment.

---

# 8. Step 6 — Initialize TypeScript

Now that TypeScript is actually installed, run:

```bash
npx tsc --init
```

This creates:

```text
tsconfig.json
```

Now your project should look like:

```text
gemini-tool-agent/
├── node_modules/
├── package-lock.json
├── package.json
└── tsconfig.json
```

## Important lesson

When you run:

```bash
npx tsc
```

you want `npx` to use the TypeScript compiler installed in:

```text
node_modules/
```

not download some unrelated package from npm.

You can verify:

```bash
npx tsc --version
```

You should get a TypeScript version.

---

# 9. Step 7 — Configure TypeScript

Open:

```text
tsconfig.json
```

The generated file may contain many commented options.

For this project, you can replace its contents with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

## What did we change?

### target

```json
"target": "ES2022"
```

This tells TypeScript what JavaScript level we want the compiled output to target.

### module

```json
"module": "NodeNext"
```

This tells TypeScript that our project is using Node's modern module system.

### moduleResolution

```json
"moduleResolution": "NodeNext"
```

This tells TypeScript how to find imported modules.

### strict

```json
"strict": true
```

This enables TypeScript's strict type checking.

For learning agent development, this is useful because TypeScript will catch many mistakes before the program runs.

### esModuleInterop

```json
"esModuleInterop": true
```

This improves compatibility when importing CommonJS packages.

### skipLibCheck

```json
"skipLibCheck": true
```

This avoids spending time type-checking declaration files from dependencies.

### outDir

```json
"outDir": "dist"
```

When TypeScript compiles your project, the JavaScript output will go into:

```text
dist/
```

### include

```json
"include": ["src"]
```

This tells TypeScript to compile the source files inside:

```text
src/
```

---

# 10. Step 8 — Create the source directory

Run:

```bash
mkdir src
```

Now:

```text
gemini-tool-agent/
├── src/
├── node_modules/
├── package-lock.json
├── package.json
└── tsconfig.json
```

We will put our application code inside `src`.

---

# 11. Step 9 — Create index.ts

Create:

```text
src/index.ts
```

At this point do not write the complete agent.

Start with only:

```typescript
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
```

## Why are we adding these lines?

### First line

```typescript
import "dotenv/config";
```

This loads `.env` variables when the application starts.

After this, our environment variables become available through:

```typescript
process.env
```

### Second line

```typescript
import { GoogleGenAI } from "@google/genai";
```

This imports the Gemini SDK client.

We will use it to communicate with Gemini.

---

# 12. Step 10 — Add the API key check

Immediately below the imports, add:

```typescript
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}
```

Your file now contains:

```typescript
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}
```

## Why?

We don't want the application to continue if the API key doesn't exist.

Without this check, you may get a confusing authentication error later.

This gives us a clear failure:

```text
GEMINI_API_KEY is not set
```

That makes debugging easier.

---

# 13. Step 11 — Create the Gemini client

Below the API-key check, add:

```typescript
const ai = new GoogleGenAI({
  apiKey
});
```

Now:

```typescript
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set");
}

const ai = new GoogleGenAI({
  apiKey
});
```

## What is `ai`?

`ai` is the client through which our application communicates with Gemini.

Think:

```text
Your TypeScript program
        │
        │ ai
        ▼
Gemini API
```

---

# 14. Step 12 — Get your Gemini API key

Create:

```text
.env
```

The project should now look like:

```text
gemini-tool-agent/
├── src/
│   └── index.ts
├── .env
├── node_modules/
├── package-lock.json
├── package.json
└── tsconfig.json
```

Inside `.env`:

```env
GEMINI_API_KEY=YOUR_REAL_KEY_HERE
```

Replace the placeholder with your actual Gemini API key.

Do not add quotes unless you specifically need them.

---

# 15. Step 13 — Protect the API key

Create:

```text
.gitignore
```

Add:

```gitignore
node_modules/
dist/
.env
```

The most important line is:

```gitignore
.env
```

## Why?

If you eventually push this project to GitHub, Git should not upload your API key.

Check your Git status:

```bash
git status
```

If `.env` appears as an untracked file, your `.gitignore` is not working correctly.

---

# 16. Step 14 — Test the Gemini connection before adding tools

Before implementing function calling, test the basic Gemini request.

Add this below your Gemini client:

```typescript
async function main() {
  const response = await ai.models.generateContent({
    model: "YOUR_SUPPORTED_GEMINI_MODEL",
    contents: "Say hello in one sentence."
  });

  console.log(response.text);
}

main().catch(console.error);
```

Use a current Gemini model name supported by your account and SDK documentation.

## Why test this first?

Because we want to isolate problems.

If the basic request fails, we know the problem is somewhere around:

```text
API key
SDK
model name
network
configuration
```

If basic Gemini works, then we add tools.

This is a general engineering principle:

> Add one layer at a time and verify each layer before adding the next one.

---

# 17. Step 15 — Run the program

Add a development script to `package.json`.

Inside the existing `"scripts"` object, use:

```json
"scripts": {
  "dev": "tsx src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

Do not create a second `"scripts"` property.

If your package.json already has:

```json
"scripts": {
  "test": "..."
}
```

modify that existing object.

For example:

```json
"scripts": {
  "dev": "tsx src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}
```

Then run:

```bash
npm run dev
```

If everything is configured correctly, you should get a Gemini response.

---

# 18. Now we introduce tools

Once the basic Gemini request works, we add our first tool.

Our tool will be:

```text
getWeather
```

Its conceptual signature is:

```typescript
getWeather(city: string)
```

But Gemini doesn't receive our TypeScript function directly.

Instead, we provide a description/schema.

---

# 19. Tool declaration vs actual function

This distinction is extremely important.

We have two different things.

## Tool declaration

This tells Gemini:

```text
A tool exists.

Its name is getWeather.

It accepts a city.

Use it when weather information is needed.
```

## Actual implementation

This is the real TypeScript function:

```typescript
function getWeather(city: string) {
  ...
}
```

Gemini sees the declaration.

Your application owns the implementation.

Therefore:

```text
Gemini
   │
   │ decides:
   │ "Call getWeather"
   ▼
Your program
   │
   │ executes:
   │ getWeather("Delhi")
   ▼
Result
```

---

# 20. Step 16 — Define the tool schema

Add this after your Gemini client:

```typescript
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
```

## Break it down

### functionDeclarations

```typescript
functionDeclarations: [...]
```

This tells Gemini that we are exposing one or more callable functions.

### name

```typescript
name: "getWeather"
```

This is the exact identifier Gemini should return when requesting the tool.

It must match the name your application recognizes.

### description

```typescript
description: "Gets the current weather for a city."
```

This helps the model understand what the function does and when it may be useful.

### parameters

```typescript
parameters: {...}
```

This describes the arguments.

Our function needs:

```text
city
```

### required

```typescript
required: ["city"]
```

This tells Gemini that `city` must be provided.

---

# 21. Step 17 — Implement the actual tool

Below the tool declaration, add:

```typescript
function getWeather(city: string) {
  return {
    city,
    temperature: 28,
    unit: "C",
    condition: "Sunny"
  };
}
```

This is normal TypeScript.

There is nothing magical about this function.

It is just a local function.

Later it could become:

```typescript
async function getWeather(city: string) {
  const response = await fetch(...);

  return response.json();
}
```

But for now we keep it deterministic.

---

# 22. Step 18 — Create a tool registry

Add:

```typescript
const availableFunctions = {
  getWeather
};
```

Now your application has a mapping:

```text
"getWeather"
      ↓
getWeather()
```

Why do this?

Because Gemini returns the tool name as data.

For example:

```text
name = "getWeather"
```

Your application needs a safe way to translate that into a real function.

The registry provides that mapping.

Later:

```typescript
const availableFunctions = {
  getWeather,
  searchWeb,
  getUser,
  createIssue
};
```

This becomes the foundation for a multi-tool agent.

---

# 23. Step 19 — Send the user message with the tool

Inside `main()`, replace the basic test request with:

```typescript
const contents = [
  {
    role: "user",
    parts: [
      {
        text: "What's the weather in Delhi?"
      }
    ]
  }
];

const response = await ai.models.generateContent({
  model: "YOUR_SUPPORTED_GEMINI_MODEL",
  contents,
  config: {
    tools: [weatherTool]
  }
});
```

## What changed?

Previously we sent:

```typescript
contents: "Say hello in one sentence."
```

Now we send:

```typescript
contents
```

and provide:

```typescript
config: {
  tools: [weatherTool]
}
```

That tells Gemini:

```text
Here is the user message.

Here is a tool you are allowed to request.
```

---

# 24. What Gemini can return

Gemini now has two broad possibilities.

## Case A — No tool required

For example:

```text
Explain JavaScript.
```

Gemini may directly return text.

```text
Gemini
  ↓
Text response
```

## Case B — Tool required

For:

```text
What's the weather in Delhi?
```

Gemini may return a function call.

Conceptually:

```json
{
  "name": "getWeather",
  "args": {
    "city": "Delhi"
  }
}
```

This is not the weather result.

It is a request from the model:

> Please execute this function with these arguments.

---

# 25. Step 20 — Inspect the function call

After the first model call:

```typescript
const functionCalls = response.functionCalls;
```

Then:

```typescript
if (!functionCalls || functionCalls.length === 0) {
  console.log(response.text);
  return;
}
```

This handles the case where Gemini doesn't need a tool.

If there is a function call:

```typescript
const toolCall = functionCalls[0];

console.log("Tool requested:", toolCall.name);
console.log("Arguments:", toolCall.args);
```

You should see something similar to:

```text
Tool requested: getWeather
Arguments: { city: "Delhi" }
```

The exact SDK response shape can change across SDK versions, so use the current `@google/genai` TypeScript types and official documentation if your installed version exposes a slightly different property.

---

# 26. Step 21 — Find the function

Now we have:

```typescript
toolCall.name
```

which might contain:

```text
getWeather
```

We look it up in our registry:

```typescript
const fn =
  availableFunctions[
    toolCall.name as keyof typeof availableFunctions
  ];
```

Then verify it exists:

```typescript
if (!fn) {
  throw new Error(`Unknown tool: ${toolCall.name}`);
}
```

## Why is this check important?

Never assume that every model-produced function name is valid.

Your application owns the available functions.

The model can request something unexpected because of:

- model behavior
- malformed data
- future code changes
- incorrect tool configuration
- bugs

Therefore:

```text
Model request
    ↓
Validate tool exists
    ↓
Execute
```

not:

```text
Model request
    ↓
blind execution
```

---

# 27. Step 22 — Validate arguments

For the first example, check that the city is a string:

```typescript
if (
  !toolCall.args ||
  typeof toolCall.args.city !== "string"
) {
  throw new Error("Invalid arguments for getWeather");
}
```

This is basic validation.

Later, use a schema validator such as Zod for more complicated tools.

For example:

```text
Model arguments
      ↓
Zod schema
      ↓
Valid?
   ↙     ↘
 yes      no
 ↓         ↓
execute   reject
```

This becomes especially important for tools that modify data or interact with external systems.

---

# 28. Step 23 — Execute the actual function

Now:

```typescript
const result = fn(toolCall.args.city);
```

The important thing is that **your TypeScript code** is executing the function.

Gemini is not executing it.

For our example:

```text
Gemini:
getWeather({ city: "Delhi" })

Your application:

getWeather("Delhi")

Function returns:

{
  city: "Delhi",
  temperature: 28,
  unit: "C",
  condition: "Sunny"
}
```

---

# 29. Step 24 — Preserve the model's previous response

Gemini's first response contained the function call.

We need to preserve that part of the conversation.

Add:

```typescript
contents.push(response.candidates![0].content);
```

Conceptually, we are saying:

```text
Conversation so far:

User:
What's the weather in Delhi?

Gemini:
I want to call getWeather("Delhi")
```

Now we add the result.

---

# 30. Step 25 — Send the function result back

Add:

```typescript
contents.push({
  role: "user",
  parts: [
    {
      functionResponse: {
        name: toolCall.name,
        response: {
          result
        },
        id: toolCall.id
      }
    }
  ]
});
```

The important concept is:

```text
functionCall
     ↓
your application executes function
     ↓
functionResponse
```

The function response tells Gemini:

```text
You requested getWeather.

I executed it.

Here is the result.
```

---

# 31. Step 26 — Make the second Gemini call

Now send the updated conversation back:

```typescript
const finalResponse = await ai.models.generateContent({
  model: "YOUR_SUPPORTED_GEMINI_MODEL",
  contents,
  config: {
    tools: [weatherTool]
  }
});
```

Then:

```typescript
console.log(finalResponse.text);
```

Gemini now has:

```text
User request
+
its own function call
+
the function result
```

So it can produce the final answer.

---

# 32. Complete Stage 1 flow

At this point the logic is:

```typescript
async function main() {

  // 1. User message
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: "What's the weather in Delhi?"
        }
      ]
    }
  ];

  // 2. Ask Gemini
  const response = await ai.models.generateContent({
    model: "YOUR_SUPPORTED_GEMINI_MODEL",
    contents,
    config: {
      tools: [weatherTool]
    }
  });

  // 3. Did Gemini request a tool?
  const functionCalls = response.functionCalls;

  if (!functionCalls || functionCalls.length === 0) {
    console.log(response.text);
    return;
  }

  // 4. Get requested tool
  const toolCall = functionCalls[0];

  // 5. Find implementation
  const fn =
    availableFunctions[
      toolCall.name as keyof typeof availableFunctions
    ];

  if (!fn) {
    throw new Error(`Unknown tool: ${toolCall.name}`);
  }

  // 6. Validate arguments
  if (
    !toolCall.args ||
    typeof toolCall.args.city !== "string"
  ) {
    throw new Error("Invalid weather arguments");
  }

  // 7. Execute local function
  const result = fn(toolCall.args.city);

  // 8. Preserve model response
  contents.push(response.candidates![0].content);

  // 9. Send function result
  contents.push({
    role: "user",
    parts: [
      {
        functionResponse: {
          name: toolCall.name,
          response: {
            result
          },
          id: toolCall.id
        }
      }
    ]
  });

  // 10. Ask Gemini for final answer
  const finalResponse = await ai.models.generateContent({
    model: "YOUR_SUPPORTED_GEMINI_MODEL",
    contents,
    config: {
      tools: [weatherTool]
    }
  });

  // 11. Display final answer
  console.log(finalResponse.text);
}
```

Then at the bottom:

```typescript
main().catch(console.error);
```

---

# 33. The entire mental model

Remember this:

```text
                ┌─────────────┐
                │    User     │
                └──────┬──────┘
                       │
                       │ message
                       ▼
                ┌─────────────┐
                │   Gemini    │
                └──────┬──────┘
                       │
                 function call
                       │
                       ▼
             ┌───────────────────┐
             │ Your application  │
             └─────────┬─────────┘
                       │
                 validate args
                       │
                       ▼
                  getWeather()
                       │
                       │ result
                       ▼
             ┌───────────────────┐
             │ Your application  │
             └─────────┬─────────┘
                       │
                function response
                       │
                       ▼
                ┌─────────────┐
                │   Gemini    │
                └──────┬──────┘
                       │
                  final text
                       │
                       ▼
                ┌─────────────┐
                │    User     │
                └─────────────┘
```

---

# 34. Why this is called tool calling

It is called tool calling because Gemini can choose a tool based on the user's request.

But there are actually three separate responsibilities:

## Gemini

```text
Understand request
Decide whether tool is useful
Select tool
Generate arguments
Interpret tool result
Generate final response
```

## Your application

```text
Receive function call
Validate function name
Validate arguments
Authorize operation
Execute function
Handle errors
Return result
```

## Tool

```text
Perform actual operation
```

For example:

```text
Gemini
  ↓
"getWeather"
  ↓
Application
  ↓
getWeather("Delhi")
  ↓
Weather API
```

Gemini is the decision-making layer.

Your application is the execution and control layer.

---

# 35. Reliability principles

Even though this is a tiny demo, start thinking about reliability now.

## 35.1 Validate every tool call

Never blindly trust:

```typescript
toolCall.args
```

Validate it.

For simple tools:

```typescript
typeof value === "string"
```

For complex tools, use Zod or another schema validator.

---

## 35.2 Never execute arbitrary functions

Do not do:

```typescript
globalThis[toolCall.name](...)
```

Do not use:

```typescript
eval(...)
```

Instead maintain an explicit registry:

```typescript
const availableFunctions = {
  getWeather
};
```

The model can only access functions you intentionally expose.

---

## 35.3 Handle unknown tools

Always check:

```typescript
if (!fn) {
  throw new Error(`Unknown tool: ${toolCall.name}`);
}
```

---

## 35.4 Handle tool errors

A real tool can fail.

For example:

```text
Weather API
   ↓
timeout
```

Your tool should return an understandable error or your application should safely convert the failure into a tool result.

Do not invent a successful result.

---

## 35.5 Keep tools small

Prefer:

```text
getWeather()
searchUsers()
createIssue()
getFile()
```

over one enormous function:

```text
doEverything()
```

Small tools are easier for both the model and your application to understand.

---

## 35.6 Give tools precise descriptions

Bad:

```text
description: "weather"
```

Better:

```text
description:
  "Gets the current weather for a city. Use this when the user asks for current weather information."
```

The description is part of the model-facing interface.

---

# 36. Why tool schemas matter

Think of a tool schema as an API contract.

For example:

```text
getWeather
```

has:

```text
Input:
{
  city: string
}

Output:
{
  city: string,
  temperature: number,
  unit: string,
  condition: string
}
```

Your model needs to understand the input contract.

Your application needs to enforce the input contract.

This is similar to designing a REST API.

For example:

```text
POST /weather

{
  "city": "Delhi"
}
```

You wouldn't want arbitrary malformed data reaching your backend.

The same principle applies here.

---

# 37. Why we start with fake data

Do not immediately create:

```text
Gemini
+
weather tool
+
OpenWeather API
+
API authentication
+
HTTP requests
+
timeouts
+
rate limits
```

Start with:

```typescript
function getWeather(city: string) {
  return {
    city,
    temperature: 28,
    unit: "C",
    condition: "Sunny"
  };
}
```

Once this works, replace the implementation.

The interface can remain:

```typescript
getWeather(city)
```

That separation is powerful.

---

# 38. How to debug the agent

During development, log the complete flow.

Add temporary logs such as:

```typescript
console.log("USER:", userMessage);

console.log("MODEL RESPONSE:", response);

console.log("FUNCTION CALL:", toolCall);

console.log("FUNCTION ARGUMENTS:", toolCall.args);

console.log("TOOL RESULT:", result);

console.log("FINAL RESPONSE:", finalResponse.text);
```

You want to be able to see:

```text
USER:
What's the weather in Delhi?

MODEL:
getWeather

ARGS:
{ city: "Delhi" }

TOOL RESULT:
{
  city: "Delhi",
  temperature: 28,
  unit: "C",
  condition: "Sunny"
}

FINAL:
The weather in Delhi is 28°C and sunny.
```

This makes the protocol visible.

---

# 39. Test both possible paths

## Test 1 — Tool should be used

Ask:

```text
What's the weather in Delhi?
```

Expected:

```text
User
 ↓
Gemini
 ↓
getWeather
 ↓
your function
 ↓
Gemini
 ↓
final answer
```

## Test 2 — Tool should not be needed

Ask:

```text
What is JavaScript?
```

Expected:

```text
User
 ↓
Gemini
 ↓
final answer
```

No weather function should run.

This is important because declaring a tool does not mean Gemini must call it for every message.

---

# 40. Important improvement for later

For Stage 1, you can process one function call.

However, don't assume a production agent will always have:

```text
one model response
    ↓
one tool
    ↓
one final response
```

Real agents may need:

```text
Gemini
  ↓
tool A
  ↓
Gemini
  ↓
tool B
  ↓
Gemini
  ↓
tool C
  ↓
Gemini
  ↓
final answer
```

That becomes the agent loop.

Conceptually:

```text
while model wants a tool:

    receive function call

    validate

    execute

    send result back

finally:

    return text
```

But do not build that abstraction yet.

First understand the explicit two-request flow.

---

# 41. Stage 1 completion checklist

You should consider Stage 1 complete only when you understand and can run all of these:

```text
□ Node project created
□ package.json created
□ @google/genai installed
□ dotenv installed
□ TypeScript installed
□ tsx installed
□ @types/node installed
□ tsconfig.json configured
□ .env created
□ API key loaded
□ .env added to .gitignore
□ Gemini client created
□ Basic Gemini request works
□ Tool schema created
□ Actual TypeScript tool created
□ Tool registry created
□ Gemini can request the tool
□ Application reads tool name
□ Application validates arguments
□ Application executes the function
□ Application creates function response
□ Function response is sent to Gemini
□ Gemini produces final answer
□ No-tool requests also work
```

---

# 42. What you should understand before Stage 2

Do not move to multiple tools until you can explain this without looking at the code:

### Question 1

Who executes the tool?

```text
Your application.
```

Not Gemini.

### Question 2

Who decides whether the tool should be used?

```text
Gemini.
```

### Question 3

Who validates the model's arguments?

```text
Your application.
```

### Question 4

Why do we send the tool result back?

Because Gemini needs the observation/result before it can generate the final answer.

### Question 5

What is the tool declaration?

It is the model-facing contract describing:

```text
tool name
description
parameters
```

### Question 6

What is the tool implementation?

It is the actual TypeScript code that performs the operation.

---

# 43. Final architecture for Stage 1

Your finished project should look approximately like:

```text
gemini-tool-agent/
│
├── src/
│   └── index.ts
│
├── .env
├── .gitignore
├── package-lock.json
├── package.json
├── tsconfig.json
└── node_modules/
```

And conceptually:

```text
                  USER
                    │
                    ▼
             ┌─────────────┐
             │   Gemini    │
             └──────┬──────┘
                    │
                    │ function_call
                    ▼
             ┌─────────────┐
             │   Registry  │
             └──────┬──────┘
                    │
                    │ validate
                    ▼
             ┌─────────────┐
             │   Function  │
             │ getWeather()│
             └──────┬──────┘
                    │
                    │ result
                    ▼
             ┌─────────────┐
             │ function    │
             │ response    │
             └──────┬──────┘
                    │
                    ▼
             ┌─────────────┐
             │   Gemini    │
             └──────┬──────┘
                    │
                    ▼
               FINAL TEXT
```

Once this is working, you have the fundamental building block for the next stages: multiple tools, repeated tool calls, conversation history, structured validation, retries, permissions, and eventually a proper agent loop.

---

# 44. Recommended learning order after Stage 1

Do not jump directly into a framework.

Build the concepts yourself first:

```text
Stage 1
Single tool
    ↓
Stage 2
Multiple tools
    ↓
Stage 3
Agent loop
    ↓
Stage 4
Conversation history
    ↓
Stage 5
Tool validation with Zod
    ↓
Stage 6
Tool errors + retries + timeouts
    ↓
Stage 7
Real external APIs
    ↓
Stage 8
Database / filesystem tools
    ↓
Stage 9
Permissions and safety
    ↓
Stage 10
Production agent architecture
```

The purpose is to understand what an agent framework is doing for you instead of treating the framework as magic.

## Official documentation

Use Google's current Gemini API documentation when checking the exact SDK API and currently supported model names:

- Gemini API getting started
- Gemini function calling documentation
- `@google/genai` API reference

The SDK and model interfaces can change, so the installed package version and current official documentation should be treated as the source of truth when code examples disagree.
