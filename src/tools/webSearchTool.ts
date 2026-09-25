import { z } from "zod"
import { tool } from "ai"
import { tavily } from "@tavily/core"

const apiKey = process.env.TAVILY_API_KEY;
if (!apiKey) {
    throw new Error("TAVILY_API_KEY is not set");
}

const tvly = tavily({ apiKey });

export const webSearch = tool({
    description:
    "Search the web for current or recent information. Use this for anything that may have changed since your training data, such as latest versions, news, or prices, or when you are unsure of a fact. Returns a short list of results with title, url and snippet.",
    inputSchema: z.object({
    query: z
        .string()
        .describe("A short, specific search query, like you would type into a search engine"),
    }),
    execute: async ({ query }) => {
    try {
        const response = await tvly.search(query, {
        maxResults: 3,
        searchDepth: "basic",
        });

        return {
        query,
        results: response.results.map((r) => ({
            title: r.title,
            url: r.url,
            snippet: r.content,
        })),
        };
    } catch (error) {
        return {
        query,
        error: error instanceof Error ? error.message : "Search failed",
        results: [],
        };
    }
    },
});