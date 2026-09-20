import { tools } from './tools/index.js'

async function executeTool(
  name: string,
  args: unknown,
) {
  const tool = tools[name as keyof typeof tools];

  if (!tool) {
    return `Unknown tool: ${name}`;
  }

  const execute = tool.execute;

  if (!execute) {
    return `Provider tool ${name} - executed by model provider`;
  }
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await execute(args as any, {
    toolCallId: "",
    messages: [],
  });

  return String(result);
}