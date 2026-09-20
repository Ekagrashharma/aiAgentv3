import { tool } from "ai";
import { z } from "zod";

export const calculator = tool({
  description: "Perform calculations",
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
  }),
  execute: async ({ a, b }) => {
    return a + b;
  },
});