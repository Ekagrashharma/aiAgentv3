import { evaluate } from "@lmnr-ai/lmnr"
import { runAgent } from "../src/runAgent.js" 

evaluate({
  data: [
   {
    data : {
      prompt: 'Whats the weather in Delhi?'
    },
    target: {
      expectedTool: 'getWeather' 
    }
   }
  ],
  executor: async (input) => {
    const result = await runAgent(input.prompt);
    return { text: result.text, toolCalls: result.toolCalls, steps: result.steps };
  },
  evaluators: {
    calledCorrectTool: (output, target) =>
      target && output.toolCalls.some((c: any) => c.toolName === target.expectedTool) ? 1 : 0,

    calledCorrectToolFirst: (output, target) => {
      const firstStepWithToolCall = output.steps.find((s: any) => s.toolCalls.length > 0);
      if (!firstStepWithToolCall || !target) return 0;
      return firstStepWithToolCall.toolCalls[0].toolName === target.expectedTool ? 1 : 0;
    },

    noRedundantToolCalls: (output) => {
      const allNames = output.steps.flatMap((s: any) => s.toolCalls.map((c: any) => c.toolName));
      return allNames.length === new Set(allNames).size ? 1 : 0;
    },
  },
  groupName: 'tool-selection',
});