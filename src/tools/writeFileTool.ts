import { tool } from "ai";
import { z } from "zod";
import fs from "fs/promises";


export const writeFileTool = tool({
    description: "Write content to a file inside the sandbox directory, creating or overwriting it",
    inputSchema: z.object({
    path: z.string().describe("Relative path to the file, e.g. notes.txt"),
    content: z.string().describe("The text content to write to the file"),
}),
    execute : async({ path: filePath , content }: { path : string } , )=>{
        try {
            const content = await fs.readFile(filePath , "utf-8")
            return content;
        } catch (error) {
            const err = error as NodeJS.ErrnoException
            if( err.code == "ENOENT" ){
                return `Error: File not found: ${filePath}`;
            } 
            return `Error reading file: ${err.message}`;
        }
    }
})