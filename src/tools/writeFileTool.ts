import { tool } from "ai";
import { z } from "zod";
import { resolveSafePath } from "./sanbox.js";
import { writeFile } from "fs/promises";

export const writeFileTool = tool({
  description: "Write content to a file inside the sandbox directory, creating or overwriting it",
  inputSchema: z.object({
    path: z.string().describe("Relative path to the file, e.g. notes.txt"),
    content: z.string().describe("The text content to write to the file"),
  }),
  execute: async ({ path: filePath, content }) => {
    const safePath = resolveSafePath(filePath);
    await writeFile(safePath, content, "utf-8");
    return `Wrote ${content.length} characters to ${filePath}`;
  },
});
