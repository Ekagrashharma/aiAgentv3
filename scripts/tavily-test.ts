import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! });
const res = await tvly.search("latest stable webpack version", { maxResults: 3 });
console.log(JSON.stringify(res.results, null, 2));