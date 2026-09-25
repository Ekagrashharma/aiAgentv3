import { tool } from "ai";
import { z } from "zod";
import { resolveSafePath } from "./sanbox.js"
import { readFile } from "fs/promises";



export const readFileTool = tool({
    description: "Read the contents of a file inside the sandbox directory",
    inputSchema: z.object({
    path: z.string().describe("Relative path to the file, e.g. notes.txt"),
        }),
    execute :  async ({ path: filePath }) => {
    const safePath = resolveSafePath(filePath);
    const content = await readFile(safePath, "utf-8");
    return content;
    }
})