import { evaluate } from "@lmnr-ai/lmnr"
import { main } from "../src/run" 

evaluate({
  data:[{
    data : {prompt: "What's the weather in Delhi?"},
    target: { expectedTool: 'getWeather' }, 
  }],
  executor: async (input) => {
    const result = await main(input.prompt);
    return { text: result.text, toolCalls: result.toolCalls };
  },
   evaluators: {
    calledCorrectTool: (output, target) =>
      output.toolCalls.some((c: any) => c.toolName === target.expectedTool) ? 1 : 0,
  },
  groupName: 'tool-selection',
})