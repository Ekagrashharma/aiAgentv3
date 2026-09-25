import { tool } from "ai";
import z from "zod";
import { readdir } from "fs/promises";
import { resolveSafePath } from "./sanbox.js";

export const listFilesTool = tool({
  description: "List files and folders inside a directory within the sandbox",
  inputSchema: z.object({
    path: z.string().optional().describe("Relative subdirectory to list; omit to list the sandbox root"),
  }),
  execute: async ({ path: dirPath }) => {
    const safePath = resolveSafePath(dirPath ?? ".");
    const entries = await readdir(safePath);
    return entries;
  },
});