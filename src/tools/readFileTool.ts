import { tool } from "ai";
import { z } from "zod";
import fs from "fs/promises";



export const readFileTool = tool({
    description: "Read the contents of a file inside the sandbox directory",
    inputSchema: z.object({
    path: z.string().describe("Relative path to the file, e.g. notes.txt"),
        }),
    execute : async({ path: filePath }: { path : string })=>{
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